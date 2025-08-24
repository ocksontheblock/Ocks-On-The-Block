import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import HamburgerMenu from "@/components/hamburger-menu";
import UserDisplay from "@/components/user-display";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Camera, MapPin, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import logo from "@assets/38707FA8-BE4C-4354-933E-95B456DBEA1A_1756054318714.png";

export default function ScavengerHunt() {
  const { toast } = useToast();
  const { isAuthenticated, user, isLoading } = useAuth();

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

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      <UserDisplay />
      
      {/* Hero Section with Logo */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={logo} 
              alt="Ocks on the Block" 
              className="w-80 h-80 mx-auto object-contain"
            />
          </div>

          {/* Top Prize Banner */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-black p-8 rounded-3xl shadow-2xl border-4 border-yellow-300 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <DollarSign className="h-12 w-12" />
                <h1 className="font-anton text-6xl md:text-8xl font-black">$10,000</h1>
                <DollarSign className="h-12 w-12" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">TOP PRIZE</p>
              <p className="text-lg font-semibold mt-2">NYC'S BIGGEST OCK HUNT</p>
            </div>
          </div>

          {/* Quick Rules */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h2 className="font-anton text-3xl md:text-4xl text-white mb-8">THE RULES</h2>
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="flex flex-col items-center">
                <div className="bg-ock-orange p-4 rounded-full mb-4">
                  <span className="text-2xl font-bold text-black">1</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Buy Mystery Boxes</h3>
                <p className="text-sm text-gray-300">Get your Ock figurines</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-green-500 p-4 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Find Real Ocks</h3>
                <p className="text-sm text-gray-300">Use our Ocky Map</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-yellow-500 p-4 rounded-full mb-4">
                  <Camera className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Take Photo</h3>
                <p className="text-sm text-gray-300">You + Figurine + Real Ock</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center space-y-6">
            {isLoading ? (
              <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full"></div>
            ) : isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <Button 
                  onClick={() => joinHuntMutation.mutate()}
                  disabled={joinHuntMutation.isPending}
                  size="lg"
                  className="bg-ock-orange text-black hover:bg-white hover:text-black font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-join-hunt"
                >
                  {joinHuntMutation.isPending ? "Joining..." : "JOIN THE HUNT"}
                </Button>
                <Button 
                  onClick={() => window.location.href = '/submit-photo'}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-submit-photo"
                >
                  SUBMIT PHOTO
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={() => window.location.href = '/signup'}
                  size="lg"
                  className="bg-ock-orange text-black hover:bg-white hover:text-black font-bold py-6 px-12 rounded-2xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  data-testid="button-signup-hunt"
                >
                  SIGN UP TO WIN $10,000
                </Button>
                <p className="text-white text-center">
                  Already have an account? <a href="/login" className="text-ock-orange hover:underline font-bold">Sign in here</a>
                </p>
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16">
            <p className="text-white/80 text-lg mb-4">Start by getting your figurines</p>
            <Button 
              onClick={() => window.location.href = '/buy-ocks'}
              variant="outline"
              className="border-ock-orange text-ock-orange hover:bg-ock-orange hover:text-black font-bold py-3 px-8 rounded-xl"
            >
              Shop Mystery Boxes
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}