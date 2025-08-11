import React from "react";
import { Box, Typography, List, Divider } from "@mui/material";
import { useOrders } from "@/context/OrdersContext";

import OrderRow from "./OrderRow";

const GRID_LAYOUT = "minmax(0, 1fr) 96px 80px 64px";

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
