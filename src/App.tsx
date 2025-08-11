import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { appTheme } from "@/theme";
import { OrdersProvider } from "@/context/OrdersContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OrdersProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrdersProvider>
      </TooltipProvider>
  </ThemeProvider>
);

export default App;
