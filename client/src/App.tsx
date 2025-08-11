import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingSpinner from "@/components/loading-spinner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import OckyDrip from "@/pages/ocky-drip";
import OckyMap from "@/pages/ocky-map";
import BuyOcks from "@/pages/buy-ocks";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/ocky-drip" component={OckyDrip} />
      <Route path="/ocky-map" component={OckyMap} />
      <Route path="/buy-ocks" component={BuyOcks} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for assets and initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
