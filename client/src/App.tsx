import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import Calendar from "@/pages/calendar";
import Customers from "@/pages/customers";
import Vehicles from "@/pages/vehicles";
import Inventory from "@/pages/inventory";
import Suppliers from "@/pages/suppliers";
import Receipts from "@/pages/receipts";
import Reports from "@/pages/reports";
import Backup from "@/pages/backup";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

function Router() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/jobs" component={Jobs} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/customers" component={Customers} />
            <Route path="/vehicles" component={Vehicles} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/suppliers" component={Suppliers} />
            <Route path="/receipts" component={Receipts} />
            <Route path="/reports" component={Reports} />
            <Route path="/backup" component={Backup} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
