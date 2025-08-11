import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
} from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
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
  TextField,
  Select,
  FormControl,
} from "@mui/material";

export default function DayDroppable({
  date,
  children,
}: {
  date: Date;
  children?: React.ReactNode;
}) {
  const id = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({ id });

  const isToday =
    format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const isCurrentMonth = date.getMonth() === new Date().getMonth();

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1.2,
        minHeight: 112,
        borderRadius: 2,
        borderColor: isToday ? "primary.main" : "divider",
        bgcolor: isOver
          ? "action.hover"
          : !isCurrentMonth
          ? "action.selectedOpacity"
          : "background.paper",
        boxShadow: isToday ? 2 : "none",
        transition: "background-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="caption"
          color={isCurrentMonth ? "text.secondary" : "text.disabled"}
          fontWeight={isToday ? 700 : 400}
          sx={{
            bgcolor: isToday ? "primary.main" : "transparent",
            color: isToday ? "common.white" : "inherit",
            px: isToday ? 0.8 : 0,
            py: isToday ? 0.2 : 0,
            borderRadius: 1,
            display: "inline-block",
            alignSelf: "flex-start",
          }}
        >
          {format(date, "d")}
        </Typography>
        {children}
      </Stack>
    </Paper>
  );
}
