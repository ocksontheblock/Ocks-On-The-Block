import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await apiRequest('POST', endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You're successfully logged in." : "Your account has been created successfully.",
      });
      onSuccess(data.user);
      onClose();
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    const submitData = isLogin 
      ? { email: formData.email, password: formData.password }
      : {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        };

    authMutation.mutate(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-ock-orange to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-anton">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              data-testid="button-close-auth"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ock-orange focus:border-transparent transition-all"
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ock-orange focus:border-transparent transition-all"
                  data-testid="input-last-name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ock-orange focus:border-transparent transition-all"
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ock-orange focus:border-transparent transition-all"
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ock-orange focus:border-transparent transition-all"
                data-testid="input-confirm-password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={authMutation.isPending}
            className="w-full bg-gradient-to-r from-ock-orange to-red-500 text-white py-4 px-6 rounded-xl font-bold hover:from-red-500 hover:to-ock-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-submit-auth"
          >
            {authMutation.isPending 
              ? 'Processing...' 
              : isLogin ? 'Sign In' : 'Create Account'
            }
          </button>

          <div className="text-center pt-4 space-y-3">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-ock-orange font-semibold hover:text-red-500 transition-colors"
                data-testid="button-switch-auth"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500 mb-2">
                Want to checkout quickly?
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                data-testid="button-close-to-guest"
              >
                Continue as Guest instead
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}