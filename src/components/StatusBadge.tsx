import React from "react";
import Chip from "@mui/material/Chip";
import { OrderStatus } from "@/context/OrdersContext";

interface Props {
  status: OrderStatus;
  size?: "small" | "medium";
}

const labelMap: Record<OrderStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  cancelled: "Cancelled",
  planned: "Planned",
};

export const StatusBadge: React.FC<Props> = ({ status, size = "small" }) => {
  const colorMap: Record<OrderStatus, { variant: "filled" | "outlined"; color?: "success" | "info" | "default" } & { sx?: any }> = {
    completed: { variant: "filled", color: "success" },
    in_progress: { variant: "filled", color: "info" },
    cancelled: { variant: "filled", color: "default", sx: { bgcolor: "grey.200", color: "text.primary" } },
    planned: { variant: "outlined", color: "default", sx: { borderColor: "warning.main", color: "warning.main" } },
  };

  const cfg = colorMap[status];
  return (
    <Chip
      label={labelMap[status]}
      size={size}
      variant={cfg.variant}
      color={cfg.color}
      sx={{ fontWeight: 600, ...(cfg.sx || {}) }}
    />
  );
};
