import { createTheme } from "@mui/material/styles";

// MUI theme bridged to Tailwind design tokens via CSS variables
export const appTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "hsl(var(--background))",
      paper: "hsl(var(--card))",
    },
    text: {
      primary: "hsl(var(--foreground))",
      secondary: "hsl(var(--muted-foreground))",
    },
    primary: {
      main: "hsl(var(--primary))",
      contrastText: "hsl(var(--primary-foreground))",
    },
    secondary: {
      main: "hsl(var(--secondary))",
      contrastText: "hsl(var(--secondary-foreground))",
    },
    success: { main: "hsl(var(--status-completed))" },
    info: { main: "hsl(var(--status-inprogress))" },
    warning: { main: "hsl(var(--status-planned))" },
    grey: {
      500: "hsl(var(--status-cancelled))",
    } as any,
    divider: "hsl(var(--border))",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      "Inter Variable",
      "Inter",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "Noto Sans",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700, letterSpacing: -0.5 },
    h2: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid hsl(var(--border))",
        },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
