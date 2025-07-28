import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import OckyDrip from "@/pages/ocky-drip";
import OckyMap from "@/pages/ocky-map";
import BuyOcks from "@/pages/buy-ocks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ocky-drip" component={OckyDrip} />
      <Route path="/ocky-map" component={OckyMap} />
      <Route path="/buy-ocks" component={BuyOcks} />
      <Route component={NotFound} />
    </Switch>
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
