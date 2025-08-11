import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useOrders, ProductionOrder } from "@/context/OrdersContext";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { StatusBadge } from "./StatusBadge";

const OrderRow: React.FC<{ order: ProductionOrder; onClick: () => void; selected: boolean }> = ({ order, onClick, selected }) => {
  const duration = differenceInCalendarDays(parseISO(order.end), parseISO(order.start)) + 1;
  return (
    <ListItemButton onClick={onClick} selected={selected} sx={{ borderRadius: 1, mb: 0.5 }}>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip size="small" label={`#${order.id.slice(0, 6).toUpperCase()}`} sx={{ bgcolor: order.color, color: "common.white" }} />
            <Typography variant="body2" color="text.secondary">{order.area}</Typography>
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <StatusBadge status={order.status} />
            <Typography variant="caption" color="text.secondary">{duration} days</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress variant="determinate" value={order.progress} size={18} thickness={6} />
              <Typography variant="caption" color="text.secondary">{order.progress}</Typography>
            </Stack>
          </Stack>
        }
      />
    </ListItemButton>
  );
};

export const OrderList: React.FC = () => {
  const { orders, selectedId, setSelectedId } = useOrders();

  return (
    <Box component="aside" sx={{ p: 2, borderLeft: "1px solid", borderColor: "divider", height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: "text.secondary" }}>Plan/Order</Typography>
      <List disablePadding>
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} selected={selectedId === o.id} onClick={() => setSelectedId(o.id)} />
        ))}
      </List>
    </Box>
  );
};
