import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Trophy,
  Sparkles,
  Star,
  Crown,
  MapPin,
  Camera,
  ShoppingCart,
  Gift
} from "lucide-react";

interface UserFigurine {
  id: number;
  figurineId: string;
  figurineName: string;
  rarity: 'common' | 'rare' | 'elite' | 'legendary';
  borough: string;
  ockName: string;
  acquiredDate: string;
  isUsedInHunt: boolean;
}

interface MysteryBoxPurchase {
  id: number;
  mysteryBoxId: number;
  mysteryBoxName: string;
  purchaseDate: string;
  tier: string;
  price: string;
  isOpened: boolean;
  figuresReceived: UserFigurine[];
}

export default function Inventory() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("figurines");

  // Fetch user figurines
  const { data: figurines = [], isLoading: figurinesLoading, refetch } = useQuery<UserFigurine[]>({
    queryKey: ["/api/user/figurines"],
    enabled: isAuthenticated,
  });

  // Fetch mystery box purchases
  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<MysteryBoxPurchase[]>({
    queryKey: ["/api/user/mystery-boxes"],
    enabled: isAuthenticated,
  });

  // Open mystery box mutation
  const openBoxMutation = useMutation({
    mutationFn: (boxId: number) => apiRequest("POST", `/api/user/mystery-boxes/${boxId}/open`),
    onSuccess: () => {
      toast({
        title: "Mystery Box Opened!",
        description: "Your new figurines have been added to your inventory.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Open Box",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to view your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="w-full bg-ock-orange hover:bg-ock-orange/90"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'elite': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'rare': return <Sparkles className="h-4 w-4 text-blue-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-purple-500';
      case 'elite': return 'bg-yellow-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityPoints = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 100;
      case 'elite': return 50;
      case 'rare': return 25;
      default: return 10;
    }
  };

  const availableFigurines = figurines.filter(f => !f.isUsedInHunt);
  const usedFigurines = figurines.filter(f => f.isUsedInHunt);
  const unopenedBoxes = purchases.filter(p => !p.isOpened);
  const openedBoxes = purchases.filter(p => p.isOpened);

  const totalValue = figurines.reduce((sum, fig) => sum + getRarityPoints(fig.rarity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HamburgerMenu />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-anton text-4xl md:text-5xl text-gray-900 mb-4">
              Your Collection
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Manage your figurines and mystery box purchases
            </p>
            
            {/* Collection Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="flex items-center p-4">
                  <Package className="h-8 w-8 text-ock-orange" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Figurines</p>
                    <p className="text-2xl font-bold">{figurines.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hunt Value</p>
                    <p className="text-2xl font-bold">{totalValue} pts</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Gift className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mystery Boxes</p>
                    <p className="text-2xl font-bold">{purchases.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-bold">{availableFigurines.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="figurines">Figurines ({figurines.length})</TabsTrigger>
              <TabsTrigger value="mystery-boxes">Mystery Boxes ({purchases.length})</TabsTrigger>
              <TabsTrigger value="hunt-ready">Hunt Ready ({availableFigurines.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="figurines">
              <div className="space-y-6">
                {availableFigurines.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Available for Hunt</span>
                      </CardTitle>
                      <CardDescription>
                        These figurines can be used in the scavenger hunt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableFigurines.map((figurine) => (
                          <FigurineCard 
                            key={figurine.id} 
                            figurine={figurine} 
                            available={true}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {usedFigurines.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-5 w-5" />
                        <span>Used in Hunt</span>
                      </CardTitle>
                      <CardDescription>
                        These figurines have been submitted for verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {usedFigurines.map((figurine) => (
                          <FigurineCard 
                            key={figurine.id} 
                            figurine={figurine} 
                            available={false}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {figurines.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Figurines Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Purchase mystery boxes to start building your collection!
                      </p>
                      <Button
                        onClick={() => window.location.href = '/buy-ocks'}
                        className="bg-ock-orange hover:bg-ock-orange/90"
                      >
                        Buy Mystery Boxes
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="mystery-boxes">
              <div className="space-y-6">
                {unopenedBoxes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Gift className="h-5 w-5" />
                        <span>Unopened Boxes</span>
                      </CardTitle>
                      <CardDescription>
                        Click to open your mystery boxes and discover your figurines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unopenedBoxes.map((purchase) => (
                          <Card key={purchase.id} className="border-2 border-dashed border-ock-orange">
                            <CardContent className="p-6 text-center">
                              <Gift className="h-12 w-12 mx-auto text-ock-orange mb-4" />
                              <h3 className="font-semibold mb-2">{purchase.mysteryBoxName}</h3>
                              <Badge className="mb-4">${purchase.tier}</Badge>
                              <Button
                                onClick={() => openBoxMutation.mutate(purchase.id)}
                                disabled={openBoxMutation.isPending}
                                className="w-full bg-ock-orange hover:bg-ock-orange/90"
                                data-testid={`button-open-${purchase.id}`}
                              >
                                {openBoxMutation.isPending ? "Opening..." : "Open Box"}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {openedBoxes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase History</CardTitle>
                      <CardDescription>
                        Your opened mystery boxes and what you received
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {openedBoxes.map((purchase) => (
                          <div key={purchase.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold">{purchase.mysteryBoxName}</h3>
                                <p className="text-sm text-gray-600">
                                  Purchased {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge>${purchase.tier}</Badge>
                            </div>
                            {purchase.figuresReceived && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {purchase.figuresReceived.map((fig) => (
                                  <div key={fig.id} className="text-center p-2 bg-gray-50 rounded">
                                    <p className="text-xs font-medium">{fig.figurineName}</p>
                                    <Badge className={`${getRarityColor(fig.rarity)} text-white text-xs mt-1`}>
                                      {fig.rarity}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {purchases.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Gift className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Purchases Yet</h3>
                      <p className="text-gray-600 mb-6">
                        Start your collection by purchasing mystery boxes!
                      </p>
                      <Button
                        onClick={() => window.location.href = '/buy-ocks'}
                        className="bg-ock-orange hover:bg-ock-orange/90"
                      >
                        Buy Mystery Boxes
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="hunt-ready">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Ready for the Hunt</span>
                  </CardTitle>
                  <CardDescription>
                    These figurines are available to use in the scavenger hunt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {availableFigurines.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {availableFigurines.map((figurine) => (
                          <FigurineCard 
                            key={figurine.id} 
                            figurine={figurine} 
                            available={true}
                            showHuntInfo={true}
                          />
                        ))}
                      </div>
                      <div className="text-center pt-6 border-t">
                        <Button
                          onClick={() => window.location.href = '/scavenger-hunt'}
                          size="lg"
                          className="bg-gradient-to-r from-ock-orange to-red-500 hover:from-red-500 hover:to-ock-orange"
                        >
                          Start the Hunt
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Available Figurines</h3>
                      <p className="text-gray-600 mb-6">
                        All your figurines have been used in the hunt. Purchase more mystery boxes to continue!
                      </p>
                      <Button
                        onClick={() => window.location.href = '/buy-ocks'}
                        className="bg-ock-orange hover:bg-ock-orange/90"
                      >
                        Buy More Boxes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Figurine Card Component
interface FigurineCardProps {
  figurine: UserFigurine;
  available: boolean;
  showHuntInfo?: boolean;
}

function FigurineCard({ figurine, available, showHuntInfo }: FigurineCardProps) {
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'elite': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'rare': return <Sparkles className="h-4 w-4 text-blue-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-purple-500';
      case 'elite': return 'bg-yellow-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityPoints = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 100;
      case 'elite': return 50;
      case 'rare': return 25;
      default: return 10;
    }
  };

  return (
    <Card className={`${available ? 'border-green-200' : 'border-gray-200 opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{figurine.figurineName}</h3>
            <p className="text-xs text-gray-600 mb-2">{figurine.ockName}</p>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">{figurine.borough}</span>
            </div>
          </div>
          {getRarityIcon(figurine.rarity)}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={`${getRarityColor(figurine.rarity)} text-white capitalize text-xs`}>
            {figurine.rarity}
          </Badge>
          {showHuntInfo && (
            <span className="text-xs font-semibold text-ock-orange">
              {getRarityPoints(figurine.rarity)} points
            </span>
          )}
          {!available && (
            <Badge variant="secondary" className="text-xs">
              In Use
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}