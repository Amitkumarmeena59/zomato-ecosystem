import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import RestaurantDetail from "@/pages/RestaurantDetail";
import OrderTracking from "@/pages/OrderTracking";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import RiderDashboard from "@/pages/RiderDashboard";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/restaurant/:id"} component={RestaurantDetail} />
      <Route path={"/order/:orderId"} component={OrderTracking} />
      <Route path={"/restaurant-dashboard"} component={RestaurantDashboard} />
      <Route path={"/rider-dashboard"} component={RiderDashboard} />
      <Route path={"/admin-panel"} component={AdminPanel} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
