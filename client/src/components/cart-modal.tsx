import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

export default function CartModal({ isOpen, onClose, userId }: CartModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['/api/cart', userId],
    enabled: !!userId && isOpen,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      if (quantity <= 0) {
        return apiRequest('DELETE', `/api/cart/${itemId}`);
      }
      return apiRequest('PATCH', `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => apiRequest('DELETE', `/api/cart/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', userId] });
      toast({
        title: "Item removed",
        description: "Item removed from cart",
      });
    },
  });

  const cartItems = cartData?.cartItems || [];
  const total = cartItems.reduce((sum: number, item: any) => 
    sum + (item.mysteryBox?.price || 0) * item.quantity, 0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams({
      cart: 'true',
      userId: userId?.toString() || '',
      total: total.toString()
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ock-orange to-red-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-xl font-anton">Your Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              data-testid="button-close-cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm">Add some mystery boxes to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-anton text-lg text-gray-900">
                        {item.mysteryBox?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.mysteryBox?.description}
                      </p>
                      <span className="text-lg font-bold text-ock-orange">
                        ${item.mysteryBox?.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          itemId: item.id, 
                          quantity: item.quantity - 1 
                        })}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-lg min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          itemId: item.id, 
                          quantity: item.quantity + 1 
                        })}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItemMutation.mutate(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      data-testid={`button-remove-${item.id}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-anton text-ock-orange">${total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-ock-orange to-red-500 text-white py-4 px-6 rounded-xl font-bold hover:from-red-500 hover:to-ock-orange transition-all duration-300 transform hover:scale-105 shadow-lg"
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}