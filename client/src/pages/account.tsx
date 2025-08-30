import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import HamburgerMenu from "@/components/hamburger-menu";
import UserDisplay from "@/components/user-display";
import Footer from "@/components/footer";
import { 
  User, 
  Package, 
  Shield, 
  Download, 
  Trash2, 
  Edit3, 
  Mail,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  Check,
  X
} from "lucide-react";

// Form schemas
const profileUpdateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
type PasswordUpdateForm = z.infer<typeof passwordUpdateSchema>;

interface Purchase {
  id: number;
  mysteryBoxName: string;
  quantity: number;
  totalAmount: number;
  purchaseDate: string;
  stripePaymentId: string;
  isOpened: boolean;
}

export default function Account() {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security' | 'data'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Fetch user's purchase history
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/user/purchases", user?.id],
    enabled: !!user?.id,
    queryFn: () => [], // Placeholder - returns empty array for now
  });

  // Profile update form
  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Password update form
  const passwordForm = useForm<PasswordUpdateForm>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: (data: ProfileUpdateForm) => 
      apiRequest("PUT", "/api/user/profile", data),
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const passwordUpdateMutation = useMutation({
    mutationFn: (data: PasswordUpdateForm) => 
      apiRequest("PUT", "/api/user/password", data),
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Password Update Failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  // Data export mutation
  const dataExportMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/export-data"),
    onSuccess: (data: any) => {
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocks-account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Data Export Complete",
        description: "Your account data has been downloaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  // Account deletion mutation
  const accountDeleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/user/account"),
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HamburgerMenu />
      <UserDisplay />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-anton text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-600">Manage your profile, view orders, and control your account settings</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'orders', label: 'Orders', icon: Package },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'data', label: 'Data & Privacy', icon: Download },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === id
                        ? 'border-ock-orange text-ock-orange'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                      <CardDescription>
                        Manage your personal information and preferences
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {editingProfile ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit((data) => profileUpdateMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex space-x-4">
                            <Button
                              type="submit"
                              disabled={profileUpdateMutation.isPending}
                              className="bg-ock-orange hover:bg-ock-orange/90"
                            >
                              {profileUpdateMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Username</label>
                            <p className="text-gray-900">{user?.username}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900">{user?.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">First Name</label>
                            <p className="text-gray-900">{user?.firstName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Name</label>
                            <p className="text-gray-900">{user?.lastName || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Order History</span>
                    </CardTitle>
                    <CardDescription>
                      View your mystery box purchases and order details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {purchasesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-ock-orange border-t-transparent rounded-full"></div>
                      </div>
                    ) : purchases.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No orders yet</p>
                        <p className="text-sm text-gray-400 mb-4">Get started by purchasing your first mystery box!</p>
                        <Button 
                          onClick={() => window.location.href = '/buy-ocks'}
                          className="bg-ock-orange hover:bg-ock-orange/90"
                        >
                          Shop Mystery Boxes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {purchases.map((purchase) => (
                          <div key={purchase.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{purchase.mysteryBoxName}</h4>
                                <p className="text-sm text-gray-500">Order #{purchase.id}</p>
                              </div>
                              <Badge variant={purchase.isOpened ? "secondary" : "default"}>
                                {purchase.isOpened ? "Opened" : "Unopened"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Quantity:</span>
                                <p className="font-medium">{purchase.quantity}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total:</span>
                                <p className="font-medium">{formatCurrency(purchase.totalAmount)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Date:</span>
                                <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Payment ID:</span>
                                <p className="font-medium text-xs">{purchase.stripePaymentId}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit((data) => passwordUpdateMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showNewPassword ? "text" : "password"}
                                    className="pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={passwordUpdateMutation.isPending}
                          className="bg-ock-orange hover:bg-ock-orange/90"
                        >
                          {passwordUpdateMutation.isPending ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Data & Privacy Tab */}
              {activeTab === 'data' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Data & Privacy</span>
                    </CardTitle>
                    <CardDescription>
                      Control your data and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Export */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Export Your Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a copy of all your account data, including profile information, purchase history, and settings.
                      </p>
                      <Button
                        onClick={() => dataExportMutation.mutate()}
                        disabled={dataExportMutation.isPending}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>{dataExportMutation.isPending ? "Preparing..." : "Download My Data"}</span>
                      </Button>
                    </div>

                    <Separator />

                    {/* Account Deletion */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center space-x-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </h4>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        onClick={() => {
                          if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.")) {
                            accountDeleteMutation.mutate();
                          }
                        }}
                        disabled={accountDeleteMutation.isPending}
                        variant="destructive"
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{accountDeleteMutation.isPending ? "Deleting..." : "Delete My Account"}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Active</span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <span className="text-sm font-medium">{purchases.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => window.location.href = '/buy-ocks'}
                    className="w-full bg-ock-orange hover:bg-ock-orange/90"
                    size="sm"
                  >
                    Shop Mystery Boxes
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/inventory'}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    View Collection
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/scavenger-hunt'}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Join Scavenger Hunt
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}