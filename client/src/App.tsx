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
import ScavengerHunt from "@/pages/scavenger-hunt";
import BuyOcks from "@/pages/buy-ocks";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import PaymentSuccess from "@/pages/payment-success";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Account from "@/pages/account";
import SubmitPhoto from "@/pages/submit-photo";
import AdminDashboard from "@/pages/admin-dashboard";
import Inventory from "@/pages/inventory";
import Unsubscribe from "@/pages/unsubscribe";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/ocky-drip" component={OckyDrip} />
      <Route path="/ocky-map" component={OckyMap} />
      <Route path="/scavenger-hunt" component={ScavengerHunt} />
      <Route path="/buy-ocks" component={BuyOcks} />
      <Route path="/cart" component={Cart} />
      <Route path="/submit-photo" component={SubmitPhoto} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/account" component={Account} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/unsubscribe" component={Unsubscribe} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
