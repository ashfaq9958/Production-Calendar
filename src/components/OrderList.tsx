import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useOrders, ProductionOrder } from "@/context/OrdersContext";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";

const GRID_LAYOUT = "minmax(0, 1fr) 96px 80px 64px";

const statusIcons = {
  planned: <ScheduleIcon fontSize="small" color="action" />,
  in_progress: <HourglassEmptyIcon fontSize="small" color="primary" />,
  completed: <CheckCircleIcon fontSize="small" color="success" />,
  cancelled: <CancelIcon fontSize="small" color="error" />,
};

const OrderRow: React.FC<{
  order: ProductionOrder;
  onClick: () => void;
  selected: boolean;
  index: number;
}> = ({ order, onClick, selected }) => {
  const duration = Math.max(
    1,
    differenceInCalendarDays(parseISO(order?.end), parseISO(order?.start)) + 1
  );

  console.log("filterorder", order);

  return (
    <ListItemButton
      onClick={onClick}
      selected={selected}
      sx={{
        borderRadius: 1,
        px: 2,
        py: 1.25,
        display: "grid",
        gridTemplateColumns: GRID_LAYOUT,
        alignItems: "center",
        gap: 1.5,
        transition: "all 0.2s ease",
        "&.Mui-selected": {
          backgroundColor: "action.selected",
          boxShadow: 1,
          "&:hover": {
            backgroundColor: "action.selected",
            boxShadow: 2,
          },
        },
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.action.hover
              : theme.palette.grey[50],
          boxShadow: 1,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
          }}
        >
          {order?.code?.length > 5
            ? order.code.slice(0, 5) + "..."
            : order?.code}
        </Typography>
      </Stack>

      <Box
        display="flex"
        justifyContent="center"
        sx={{ marginLeft: "40px", alignItems: "center", gap: 0.5 }}
      >
        <StatusBadge status={order.status} size="small" />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.75rem", textAlign: "center" }}
      >
        {duration} {duration === 1 ? "day" : "days"}
      </Typography>

      <Box display="flex" justifyContent="flex-end">
        {statusIcons[order.status]}
      </Box>
    </ListItemButton>
  );
};

export const OrderList: React.FC = () => {
  const { orders, selectedId, setSelectedId, filterStatuses } = useOrders();
  console.log(orders);
  const filtered = orders.filter((o) => filterStatuses.includes(o.status));

  return (
    <Box
      component="aside"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        position: "sticky",
        top: 16,
        height: "max-content",
        overflow: "hidden",
        boxShadow: 1,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, fontSize: "0.9rem" }}
        >
          Orders
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: GRID_LAYOUT,
          px: 2,
          py: 0.75,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Plan/Order
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Status
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Duration
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "right" }}
        >
          Progress
        </Typography>
      </Box>
      <Divider />

      <List disablePadding>
        {filtered.map((o, idx) => (
          <OrderRow
            key={o.id}
            order={o}
            index={idx}
            selected={selectedId === o.id}
            onClick={() => setSelectedId(o.id)}
          />
        ))}
      </List>
    </Box>
  );
};
