import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Autocomplete,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useOrders, OrderStatus } from "@/context/OrdersContext";
import { format, parseISO } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const OrderDialog: React.FC<Props> = ({ open, onClose }) => {
  const { areas, assignees, addOrder } = useOrders();
  const [area, setArea] = useState(areas[0]?.label || "Area A");
  const [status, setStatus] = useState<OrderStatus>("planned");
  const [assignee, setAssignee] = useState<string | null>(assignees[0] || null);
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [start, setStart] = useState<string>(today);
  const [end, setEnd] = useState<string>(today);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    const areaCfg = areas.find((a) => a.label === area) || areas[0];
    if (!areaCfg) return;
    const color = `hsl(var(${areaCfg.colorVar}))`;
    const okDates = parseISO(end) >= parseISO(start);
    if (!okDates) {
      setError("End date must be after start date.");
      return;
    }
    const res = addOrder({ area, assignee, start, end, status, color });
    if (res.ok) {
      onClose();
      // reset form
      setStatus("planned");
    } else {
      setError("error" in res ? res.error : "Unknown error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Order</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 1 }}>
          <TextField
            select
            label="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            fullWidth
          >
            {areas.map((a) => (
              <MenuItem key={a.key} value={a.label}>
                <Chip size="small" sx={{ bgcolor: `hsl(var(${a.colorVar}))`, mr: 1 }} /> {a.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            fullWidth
          >
            <MenuItem value="planned">Planned</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
            label="Start date"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="End date"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Autocomplete
            options={assignees}
            value={assignee}
            onChange={(_, v) => setAssignee(v)}
            renderInput={(params) => <TextField {...params} label="Assignee" />}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate}>Create Order</Button>
      </DialogActions>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Dialog>
  );
};
