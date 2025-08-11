import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Add, FilterList } from "@mui/icons-material";
import { useOrders, OrderStatus, ProductionOrder } from "@/context/OrdersContext";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, parseISO } from "date-fns";
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import { OrderDialog } from "./OrderDialog";
import { StatusBadge } from "./StatusBadge";
import { OrderList } from "./OrderList";

function DayDroppable({ date, children }: { date: Date; children?: React.ReactNode }) {
  const id = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Paper ref={setNodeRef} variant="outlined" sx={{ p: 1, minHeight: 112, bgcolor: isOver ? "action.hover" : undefined }}>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">{format(date, "d")}</Typography>
        {children}
      </Stack>
    </Paper>
  );
}

function OrderChip({ order }: { order: ProductionOrder }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: order.id });
  const { hoveredId, setHoveredId, selectedId } = useOrders();
  const isHoveredActive = !!hoveredId && hoveredId !== order.id;
  const isSelected = selectedId === order.id;
  const label = `#${order.id.slice(0, 6).toUpperCase()}`;

  const isPlanned = order.status === "planned";
  const sx = isPlanned
    ? { borderColor: "warning.main", color: "warning.main" }
    : order.status === "completed"
      ? { bgcolor: "success.main", color: "common.white" }
      : order.status === "in_progress"
        ? { bgcolor: "info.main", color: "common.white" }
        : { bgcolor: "grey.300", color: "text.primary" };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{label}</Typography>
          <Typography variant="caption">{order.area}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <StatusBadge status={order.status} />
            <Typography variant="caption">{format(parseISO(order.start), "MMM d")} – {format(parseISO(order.end), "MMM d")}</Typography>
          </Stack>
        </Box>
      }
      arrow
      enterDelay={200}
    >
      <Chip
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        size="small"
        label={label}
        variant={isPlanned ? "outlined" : "filled"}
        sx={{
          ...sx,
          opacity: isHoveredActive ? 0.3 : 1,
          borderWidth: isPlanned || isSelected ? 2 : 0,
          borderColor: isSelected ? "primary.main" : (isPlanned ? "warning.main" : undefined),
          fontWeight: 700,
          justifyContent: "flex-start",
          boxShadow: isSelected ? 3 : 0,
        }}
        onMouseEnter={() => setHoveredId(order.id)}
        onMouseLeave={() => setHoveredId(null)}
      />
    </Tooltip>
  );
}

function useMonthMatrix(viewDate: Date) {
  const start = startOfWeek(startOfMonth(viewDate));
  const end = endOfWeek(endOfMonth(viewDate));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

function useWeekRow(viewDate: Date) {
  const start = startOfWeek(viewDate);
  return [Array.from({ length: 7 }, (_, i) => addDays(start, i))];
}

export const ProductionCalendar: React.FC = () => {
  const {
    orders,
    viewDate,
    viewMode,
    setViewMode,
    gotoPrev,
    gotoNext,
    gotoThisMonth,
    filters,
    toggleFilter,
    moveOrderByDays,
  } = useOrders();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  const weeks = viewMode === "month" ? useMonthMatrix(viewDate) : useWeekRow(viewDate);

  const visibleOrders = useMemo(() => orders.filter((o) => filters.has(o.status)), [orders, filters]);

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id as string | undefined;
    const activeId = e.active.id as string;
    if (!overId) return;
    const order = orders.find((o) => o.id === activeId);
    if (!order) return;
    const delta = Math.round((parseISO(overId).getTime() - parseISO(order.start).getTime()) / (1000 * 60 * 60 * 24));
    if (delta !== 0) moveOrderByDays(order.id, delta);
  };

  const openFilters = (e: React.MouseEvent<HTMLElement>) => setFilterAnchor(e.currentTarget);
  const closeFilters = () => setFilterAnchor(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box component="header" sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h1" sx={{ fontSize: 24, mb: 1 }}>Production</Typography>
        <Tabs value={0} textColor="primary" indicatorColor="primary" sx={{ minHeight: 36 }}>
          <Tab label="Orders" sx={{ minHeight: 36 }} />
          <Tab label="Downtime Logs" disabled sx={{ minHeight: 36 }} />
          <Tab label="Batch Releases" disabled sx={{ minHeight: 36 }} />
        </Tabs>
      </Box>

      <Box component="main" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2, overflow: "auto" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2 }} spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={gotoPrev}><ChevronLeft /></IconButton>
              <Typography variant="h6">{format(viewDate, viewMode === "month" ? "LLLL yyyy" : "PP")}</Typography>
              <IconButton onClick={gotoNext}><ChevronRight /></IconButton>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setViewMode(viewMode === "month" ? "week" : "month")}>{viewMode === "month" ? "Monthly" : "Weekly"}</Button>
              <Button variant="outlined" onClick={gotoThisMonth}>This Month</Button>
              <Button variant="outlined" startIcon={<FilterList />} onClick={openFilters}>Filters</Button>
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Create Order</Button>
            </Stack>
          </Stack>

          <Menu anchorEl={filterAnchor} open={!!filterAnchor} onClose={closeFilters}>
            {(["completed", "in_progress", "cancelled", "planned"] as OrderStatus[]).map((s) => (
              <MenuItem key={s} onClick={() => toggleFilter(s)}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusBadge status={s} />
                  <Typography textTransform="capitalize">{s.replace("_", " ")}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </Menu>

          <Divider sx={{ mb: 2 }} />

          <DndContext onDragEnd={onDragEnd}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ px: 0.5, mb: 1 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <Box key={d} sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">{d}</Typography>
                  </Box>
                ))}
              </Stack>
              {weeks.map((week, wi) => (
                <Stack key={wi} direction="row" spacing={1}>
                  {week.map((date) => {
                    const id = format(date, "yyyy-MM-dd");
                    const dayOrders = visibleOrders.filter(
                      (o) => parseISO(o.start) <= date && parseISO(o.end) >= date
                    );
                    return (
                      <Box key={id} sx={{ flex: 1 }}>
                        <DayDroppable date={date}>
                          {dayOrders.map((o) => (
                            <OrderChip key={`${o.id}-${id}`} order={o} />
                          ))}
                        </DayDroppable>
                      </Box>
                    );
                  })}
                </Stack>
              ))}
            </Stack>
            <DragOverlay />
          </DndContext>
        </Box>
        <OrderList />
      </Box>

      <OrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};
