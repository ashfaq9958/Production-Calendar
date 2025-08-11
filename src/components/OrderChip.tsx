import { Box, Stack, Tooltip, Typography, Chip } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { useOrders, ProductionOrder } from "@/context/OrdersContext";
import { StatusBadge } from "./StatusBadge";
import { format, parseISO } from "date-fns";

function OrderChip({ order }: { order: ProductionOrder }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: order.id });
  const { hoveredId, setHoveredId, selectedId } = useOrders();
  const isHoveredActive = !!hoveredId && hoveredId !== order.id;
  const isSelected = selectedId === order.id;
  const label = `${order.code.slice(0, 6).toUpperCase()}`;

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
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="caption">{order.area}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <StatusBadge status={order.status} />
            <Typography variant="caption">
              {format(parseISO(order.start), "MMM d")} –{" "}
              {format(parseISO(order.end), "MMM d")}
            </Typography>
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
          borderColor: isSelected
            ? "primary.main"
            : isPlanned
            ? "warning.main"
            : undefined,
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

export default OrderChip;
