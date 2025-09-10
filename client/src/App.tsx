import { useState, useEffect, Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingSpinner from "@/components/loading-spinner";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load all pages for code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const OckyDrip = lazy(() => import("@/pages/ocky-drip"));
const OckyMap = lazy(() => import("@/pages/ocky-map"));
const ScavengerHunt = lazy(() => import("@/pages/scavenger-hunt"));
const BuyOcks = lazy(() => import("@/pages/buy-ocks"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const Account = lazy(() => import("@/pages/account"));
const SubmitPhoto = lazy(() => import("@/pages/submit-photo"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const Inventory = lazy(() => import("@/pages/inventory"));
const Unsubscribe = lazy(() => import("@/pages/unsubscribe"));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
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
