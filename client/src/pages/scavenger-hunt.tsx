import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Camera, MapPin, Users, Star, Crown, Gem, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LeaderboardEntry {
  id: number;
  username: string;
  totalOcksFound: number;
  totalPoints: number;
  status: string;
}

interface Prize {
  id: number;
  name: string;
  description: string;
  rarity: string;
  minOcksRequired: number;
  prizeValue: string; // decimal comes back as string from database
}

export default function ScavengerHunt() {
  const [selectedRarity, setSelectedRarity] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/scavenger-hunt/leaderboard"],
  });

  // Fetch prizes
  const { data: prizes = [], isLoading: prizesLoading } = useQuery<Prize[]>({
    queryKey: ["/api/scavenger-hunt/prizes"],
  });

  const joinHuntMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("Must be logged in to join");
      return apiRequest("POST", "/api/scavenger-hunt/join", { userId: user.id });
    },
    onSuccess: () => {
      toast({
        title: "Welcome to the Hunt!",
        description: "You've successfully joined NYC's biggest scavenger hunt!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join the scavenger hunt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "legendary": return <Crown className="h-4 w-4 text-yellow-500" />;
      case "elite": return <Gem className="h-4 w-4 text-purple-500" />;
      case "rare": return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Award className="h-4 w-4 text-green-500" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "elite": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "rare": return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
      case "grand_prize": return "bg-gradient-to-r from-red-600 to-pink-600 text-white";
      default: return "bg-gradient-to-r from-green-500 to-teal-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HamburgerMenu />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="font-anton text-5xl md:text-7xl text-gray-900 mb-4">
              NYC Scavenger Hunt
            </h1>
            <p className="text-2xl md:text-3xl text-ock-orange font-bold mb-6">
              The Biggest Ock Hunt in NYC History!
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Collect your Ock figurines, find the real-life Ocks, and take the perfect photo together. 
              First to complete the hunt wins incredible prizes!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg">
              <Camera className="h-5 w-5 text-ock-orange" />
              <span className="text-sm font-semibold">Photo Verification</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg">
              <MapPin className="h-5 w-5 text-green-500" />
              <span className="text-sm font-semibold">Real NYC Locations</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-semibold">Amazing Prizes</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-6">
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button 
                  onClick={() => joinHuntMutation.mutate()}
                  disabled={joinHuntMutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-ock-orange to-red-500 hover:from-red-500 hover:to-ock-orange text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-join-hunt"
                >
                  {joinHuntMutation.isPending ? "Joining..." : "Join the Hunt"}
                </Button>
                <Button 
                  onClick={() => window.location.href = '/submit-photo'}
                  size="lg"
                  variant="outline"
                  className="border-ock-orange text-ock-orange hover:bg-ock-orange hover:text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-submit-photo"
                >
                  Submit Hunt Photo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={() => window.location.href = '/signup'}
                  size="lg"
                  className="bg-gradient-to-r from-ock-orange to-red-500 hover:from-red-500 hover:to-ock-orange text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-signup-hunt"
                >
                  Sign Up to Join the Hunt
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Already have an account? <a href="/login" className="text-ock-orange hover:underline font-semibold">Sign in here</a>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              *First purchase mystery boxes to get your figurines, then use our Ocky Map to find the real Ocks!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-anton text-4xl md:text-5xl text-center text-gray-900 mb-12">
            How the Hunt Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-ock-orange/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-ock-orange">1</span>
                </div>
                <CardTitle className="text-xl">Collect Your Figurines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Purchase your Ock figurines from our mystery boxes. Different rarities = bigger prizes!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-500">2</span>
                </div>
                <CardTitle className="text-xl">Find the Real Ock</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use our Ocky Map to locate the real-life Ock that matches your figurine around NYC.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-yellow-500/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-yellow-500">3</span>
                </div>
                <CardTitle className="text-xl">Take the Perfect Shot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Photo must include: You + Your figurine + The real Ock. Upload to our platform for verification!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-anton text-4xl md:text-5xl text-center text-gray-900 mb-12">
            Epic Prizes Await
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prizesLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              prizes.map((prize: Prize) => (
                <Card key={prize.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className={`text-white ${getRarityColor(prize.rarity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getRarityIcon(prize.rarity)}
                        <CardTitle className="text-lg">{prize.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        ${prize.prizeValue}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{prize.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{prize.minOcksRequired} Ocks required</span>
                      <Badge className={getRarityColor(prize.rarity)}>
                        {prize.rarity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-anton text-4xl md:text-5xl text-center text-gray-900 mb-12">
            Live Leaderboard
          </h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Current Rankings</span>
                  </CardTitle>
                  <CardDescription>
                    Track your progress against other hunters
                  </CardDescription>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No participants yet. Be the first to join!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.username}</p>
                          <p className="text-sm text-gray-500">{entry.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.totalPoints} pts</p>
                        <p className="text-sm text-gray-500">{entry.totalOcksFound} Ocks found</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}