import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, formatISO, isWithinInterval, parseISO, startOfDay } from "date-fns";

export type OrderStatus = "completed" | "in_progress" | "cancelled" | "planned";

export interface ProductionOrder {
  id: string;
  area: string;
  assignee?: string | null;
  start: string; // ISO date (start of day)
  end: string; // ISO date (inclusive)
  status: OrderStatus;
  color: string; // hsl(var(--...)) string to link with area color
  progress: number; // 0..100
}

export type ViewMode = "month" | "week";

interface OrdersContextValue {
  orders: ProductionOrder[];
  areas: { key: string; label: string; colorVar: string }[];
  assignees: string[];

  viewDate: Date;
  setViewDate: (d: Date) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  gotoPrev: () => void;
  gotoNext: () => void;
  gotoThisMonth: () => void;

  filters: Set<OrderStatus>;
  toggleFilter: (s: OrderStatus) => void;
  clearFilters: () => void;

  hoveredId?: string | null;
  setHoveredId: (id: string | null) => void;
  selectedId?: string | null;
  setSelectedId: (id: string | null) => void;

  addOrder: (input: Omit<ProductionOrder, "id" | "progress"> & { progress?: number }) => { ok: true; order: ProductionOrder } | { ok: false; error: string };
  updateOrder: (id: string, patch: Partial<ProductionOrder>) => void;
  moveOrderByDays: (id: string, dayDelta: number) => { ok: true } | { ok: false; error: string };
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const STORAGE_KEY = "production-orders-v1";

function uuid8() {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const defaultAreas = [
  { key: "A", label: "Area A", colorVar: "--area-a" },
  { key: "B", label: "Area B", colorVar: "--area-b" },
  { key: "C", label: "Area C", colorVar: "--area-c" },
  { key: "D", label: "Area D", colorVar: "--area-d" },
];

const sampleAssignees = ["Alex Kim", "Jordan Lee", "Sam Patel", "Taylor Quinn", "Morgan Yu"];

function startIso(d: Date) {
  return formatISO(startOfDay(d), { representation: "date" });
}

function daysBetweenInclusive(start: string, end: string) {
  return differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;
}

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as ProductionOrder[];
      } catch {}
    }
    // Seed with a few sample orders for a great first impression
    const today = startOfDay(new Date());
    const make = (
      area: string,
      status: OrderStatus,
      offset: number,
      length: number,
      colorVar: string,
      assignee: string,
      progress: number
    ): ProductionOrder => ({
      id: uuid8(),
      area,
      status,
      start: startIso(addDays(today, offset)),
      end: startIso(addDays(today, offset + length - 1)),
      color: `hsl(var(${colorVar}))`,
      assignee,
      progress,
    });
    return [
      make("Area A", "planned", -3, 2, "--area-a", sampleAssignees[0], 0),
      make("Area B", "in_progress", -2, 3, "--area-b", sampleAssignees[1], 60),
      make("Area C", "completed", 1, 2, "--area-c", sampleAssignees[2], 100),
      make("Area D", "cancelled", 5, 1, "--area-d", sampleAssignees[3], 0),
    ];
  });

  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [filters, setFilters] = useState<Set<OrderStatus>>(new Set(["completed", "in_progress", "cancelled", "planned"]));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const toggleFilter = useCallback((s: OrderStatus) => {
    setFilters((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters(new Set()), []);

  const hasOverlap = useCallback(
    (candidate: Omit<ProductionOrder, "id" | "progress">, excludeId?: string) => {
      const cStart = parseISO(candidate.start);
      const cEnd = parseISO(candidate.end);
      return orders.some((o) => {
        if (excludeId && o.id === excludeId) return false;
        if (o.area !== candidate.area) return false; // prevent overlaps per area
        const oStart = parseISO(o.start);
        const oEnd = parseISO(o.end);
        return isWithinInterval(cStart, { start: oStart, end: oEnd }) ||
               isWithinInterval(cEnd, { start: oStart, end: oEnd }) ||
               isWithinInterval(oStart, { start: cStart, end: cEnd }) ||
               isWithinInterval(oEnd, { start: cStart, end: cEnd });
      });
    },
    [orders]
  );

  const addOrder: OrdersContextValue["addOrder"] = useCallback(
    (input) => {
      const candidate = { ...input };
      if (hasOverlap(candidate)) {
        return { ok: false, error: "Overlapping order in the same area and dates." } as const;
      }
      const order: ProductionOrder = {
        id: uuid8(),
        progress: input.progress ?? (input.status === "completed" ? 100 : 0),
        ...candidate,
      };
      setOrders((prev) => [order, ...prev]);
      return { ok: true, order } as const;
    },
    [hasOverlap]
  );

  const updateOrder = useCallback((id: string, patch: Partial<ProductionOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const moveOrderByDays: OrdersContextValue["moveOrderByDays"] = useCallback(
    (id, delta) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return { ok: false, error: "Order not found" } as const;
      const newStart = startIso(addDays(parseISO(o.start), delta));
      const newEnd = startIso(addDays(parseISO(o.end), delta));
      const candidate = { area: o.area, assignee: o.assignee ?? undefined, start: newStart, end: newEnd, status: o.status as OrderStatus, color: o.color };
      if (hasOverlap(candidate, id)) {
        return { ok: false, error: "Overlapping order in the same area and dates." } as const;
      }
      setOrders((prev) => prev.map((x) => (x.id === id ? { ...x, start: newStart, end: newEnd } : x)));
      return { ok: true } as const;
    },
    [orders, hasOverlap]
  );

  const gotoPrev = useCallback(() => {
    setViewDate((d) => (viewMode === "month" ? addDays(d, -30) : addDays(d, -7)));
  }, [viewMode]);

  const gotoNext = useCallback(() => {
    setViewDate((d) => (viewMode === "month" ? addDays(d, 30) : addDays(d, 7)));
  }, [viewMode]);

  const gotoThisMonth = useCallback(() => setViewDate(new Date()), []);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      areas: defaultAreas,
      assignees: sampleAssignees,
      viewDate,
      setViewDate,
      viewMode,
      setViewMode,
      gotoPrev,
      gotoNext,
      gotoThisMonth,
      filters,
      toggleFilter,
      clearFilters,
      hoveredId,
      setHoveredId,
      selectedId,
      setSelectedId,
      addOrder,
      updateOrder,
      moveOrderByDays,
    }),
    [orders, viewDate, viewMode, gotoPrev, gotoNext, gotoThisMonth, filters, toggleFilter, hoveredId, selectedId, addOrder, updateOrder, moveOrderByDays]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};

export function orderDurationDays(o: ProductionOrder) {
  return daysBetweenInclusive(o.start, o.end);
}
