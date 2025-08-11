import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  TextField,
  Select,
  FormControl,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add,
  FilterList,
} from "@mui/icons-material";
import { useOrders, OrderStatus } from "@/context/OrdersContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
} from "date-fns";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { OrderDialog } from "./OrderDialog";
import { StatusBadge } from "./StatusBadge";
import { OrderList } from "./OrderList";
import DayDroppable from "./DayDroppable";
import OrderChip from "./OrderChip";

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
  console.log(viewDate);
  const weeks =
    viewMode === "month" ? useMonthMatrix(viewDate) : useWeekRow(viewDate);

  const visibleOrders = useMemo(
    () => orders.filter((o) => filters.has(o.status)),
    [orders, filters]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id as string | undefined;
    const activeId = e.active.id as string;
    if (!overId) return;
    const order = orders.find((o) => o.id === activeId);
    if (!order) return;
    const delta = Math.round(
      (parseISO(overId).getTime() - parseISO(order.start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (delta !== 0) moveOrderByDays(order.id, delta);
  };

  const openFilters = (e: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(e.currentTarget);
  const closeFilters = () => setFilterAnchor(null);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Production
          </Typography>

          <TextField
            size="small"
            variant="outlined"
            placeholder="Search orders..."
            sx={{ width: 250 }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Tabs
            value={0}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              minHeight: 36,
              ".MuiTab-root": {
                minHeight: 36,
                fontWeight: 500,
                textTransform: "none",
              },
            }}
          >
            <Tab label="Orders" />
            <Tab label="Downtime Logs" disabled />
            <Tab label="Batch Releases" disabled />
          </Tabs>

          <Button
            size="small"
            variant="contained"
            startIcon={<Add fontSize="small" />}
            onClick={() => setDialogOpen(true)}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, overflow: "auto" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 2 }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton size="small" onClick={gotoPrev}>
                <ChevronLeft fontSize="small" />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {format(viewDate, viewMode === "month" ? "LLLL yyyy" : "PP")}
              </Typography>
              <IconButton size="small" onClick={gotoNext}>
                <ChevronRight fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                >
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="week">Weekly</MenuItem>
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" onClick={gotoThisMonth}>
                This Month
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterList fontSize="small" />}
                onClick={openFilters}
              >
                Filters
              </Button>
            </Stack>
          </Stack>

          <Menu
            anchorEl={filterAnchor}
            open={!!filterAnchor}
            onClose={closeFilters}
            PaperProps={{
              sx: { minWidth: 200, py: 0.5 },
            }}
          >
            {(
              [
                "completed",
                "in_progress",
                "cancelled",
                "planned",
              ] as OrderStatus[]
            ).map((s) => (
              <MenuItem
                key={s}
                onClick={() => toggleFilter(s)}
                sx={{
                  py: 0.75,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <StatusBadge status={s} size="small" />
              </MenuItem>
            ))}
          </Menu>

          <Divider sx={{ mb: 2 }} />

          <DndContext onDragEnd={onDragEnd}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ px: 0.5, mb: 1 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <Box key={d} sx={{ flex: 1, textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {d}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {weeks.map((week, wi) => (
                <Stack key={wi} direction="row" spacing={1}>
                  {week.map((date) => {
                    const id = format(date, "yyyy-MM-dd");
                    const dayOrders = visibleOrders.filter(
                      (o) =>
                        parseISO(o.start) <= date && parseISO(o.end) >= date
                    );

                    return (
                      <Box key={id} sx={{ flex: 1 }}>
                        <DayDroppable date={date}>
                          {dayOrders.map((o) => (
                            <OrderChip key={`${o.code}`} order={o} />
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
