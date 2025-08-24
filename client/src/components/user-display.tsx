import { User, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface CartItem {
  id: number;
  quantity: number;
}

export default function UserDisplay() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Fetch cart item count for authenticated users
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart", user?.id],
    enabled: isAuthenticated && !!user,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center space-x-4">
      {/* Cart Icon with Count */}
      <Button
        onClick={() => window.location.href = '/cart'}
        variant="ghost"
        size="sm"
        className="relative bg-black bg-opacity-70 text-white hover:bg-opacity-90 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-2"
      >
        <ShoppingCart className="h-5 w-5" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-ock-orange text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </Button>

      {/* User Info */}
      <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white border-opacity-20 flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">{user?.username}</span>
      </div>
    </div>
  );
}