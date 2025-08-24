import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

interface CartItem {
  id: number;
  quantity: number;
  mysteryBox: {
    id: number;
    name: string;
    description: string;
    price: number;
    tier: number;
    image: string;
  };
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setUrlParams(searchParams);
  }, []);

  // Add item to cart from URL parameters
  const addToCartMutation = useMutation({
    mutationFn: ({ mysteryBoxId, quantity }: { mysteryBoxId: number; quantity: number }) =>
      apiRequest("POST", "/api/cart", {
        userId: user?.id,
        mysteryBoxId,
        quantity,
      }),
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
      // Clear URL parameters
      window.history.replaceState({}, "", "/cart");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Item",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  // Auto-add item from URL if user is logged in
  useEffect(() => {
    if (isAuthenticated && user && urlParams?.has('box')) {
      const boxId = parseInt(urlParams.get('box') || '0');
      if (boxId > 0) {
        addToCartMutation.mutate({ mysteryBoxId: boxId, quantity: 1 });
      }
    }
  }, [isAuthenticated, user, urlParams]);

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading, refetch } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: isAuthenticated && !!user,
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      apiRequest("PUT", `/api/cart/${itemId}`, { quantity }),
    onSuccess: () => {
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update quantity.",
        variant: "destructive",
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => apiRequest("DELETE", `/api/cart/${itemId}`),
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove item.",
        variant: "destructive",
      });
    },
  });

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.mysteryBox.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You must be logged in to view your cart.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-ock-orange hover:bg-ock-orange/90"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                variant="outline"
                className="w-full"
              >
                Create Account
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate("/buy-ocks")}
                variant="ghost"
                className="text-sm"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HamburgerMenu />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={() => navigate("/buy-ocks")}
              variant="ghost"
              className="mb-4 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-anton text-gray-900">Your Cart</h1>
                <p className="text-gray-600 mt-1">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          {cartLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some mystery boxes to get started!</p>
                <Button onClick={() => navigate("/buy-ocks")} className="bg-ock-orange hover:bg-ock-orange/90">
                  Shop Mystery Boxes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                          <img
                            src={item.mysteryBox.image}
                            alt={item.mysteryBox.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-anton text-lg text-gray-900 flex items-center space-x-2">
                                <span>{item.mysteryBox.name}</span>
                                <Badge variant="secondary">Tier {item.mysteryBox.tier}</Badge>
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">{item.mysteryBox.description}</p>
                              <p className="text-xl font-bold text-gray-900 mt-2">${item.mysteryBox.price}</p>
                            </div>
                            
                            <Button
                              onClick={() => removeItemMutation.mutate(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              <Button
                                onClick={() => updateQuantityMutation.mutate({
                                  itemId: item.id,
                                  quantity: Math.max(1, item.quantity - 1)
                                })}
                                variant="outline"
                                size="sm"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-semibold text-gray-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <Button
                                onClick={() => updateQuantityMutation.mutate({
                                  itemId: item.id,
                                  quantity: item.quantity + 1
                                })}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                ${(item.mysteryBox.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      const params = new URLSearchParams({
                        amount: total.toString(),
                        items: JSON.stringify(cartItems.map(item => ({
                          id: item.mysteryBox.id,
                          name: item.mysteryBox.name,
                          quantity: item.quantity,
                          price: item.mysteryBox.price
                        })))
                      });
                      navigate(`/checkout?${params.toString()}`);
                    }}
                    className="w-full mt-6 bg-ock-orange hover:bg-ock-orange/90 text-lg py-3"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}