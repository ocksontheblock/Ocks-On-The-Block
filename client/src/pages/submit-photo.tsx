import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";
import PhotoUpload from "@/components/photo-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, MapPin } from "lucide-react";

interface Ock {
  id: number;
  name: string;
  borough: string;
  cornerStore: string;
}

interface Location {
  id: number;
  address: string;
  ockName: string;
  borough: string;
}

export default function SubmitPhoto() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedOck, setSelectedOck] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedFigurineRarity, setSelectedFigurineRarity] = useState<string>("");
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Fetch available Ocks
  const { data: ocks = [], isLoading: ocksLoading } = useQuery<Ock[]>({
    queryKey: ["/api/ocks"],
  });

  // Fetch available locations
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const submitPhotoMutation = useMutation({
    mutationFn: async ({ photo, location }: { photo: File; location?: GeolocationCoordinates }) => {
      // First upload the photo (this would typically use object storage)
      const formData = new FormData();
      formData.append('photo', photo);
      
      // For now, we'll simulate the upload and use a placeholder URL
      const photoUrl = `https://placeholder-storage.com/photos/${Date.now()}.jpg`;
      
      // Submit the hunt submission
      return apiRequest("POST", "/api/scavenger-hunt/submit", {
        participantId: 1, // This would be fetched from the user's hunt participation data
        ockId: selectedOck,
        locationId: selectedLocation,
        photoUrl,
        figurineRarity: selectedFigurineRarity,
        gpsCoordinates: location ? `${location.latitude},${location.longitude}` : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Photo Submitted!",
        description: "Your submission is now being reviewed. Check back for verification status.",
      });
      navigate("/scavenger-hunt");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show loading or redirect if not authenticated  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-ock-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photo submission...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to submit photos for the scavenger hunt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-ock-orange hover:bg-ock-orange/90"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePhotoSubmit = (photo: File, location?: GeolocationCoordinates) => {
    submitPhotoMutation.mutate({ photo, location });
  };

  const canSubmit = selectedOck && selectedLocation && selectedFigurineRarity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HamburgerMenu />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={() => navigate("/scavenger-hunt")}
              variant="ghost"
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hunt
            </Button>
            
            <h1 className="font-anton text-4xl md:text-5xl text-gray-900 mb-4">
              Submit Your Hunt Photo
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Found an Ock? Submit your photo for verification and earn points!
            </p>
          </div>

          {!showPhotoUpload ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Submission Details</span>
                </CardTitle>
                <CardDescription>
                  Tell us about your Ock encounter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Which Ock did you find?</label>
                  <Select onValueChange={(value) => setSelectedOck(Number(value))}>
                    <SelectTrigger data-testid="select-ock">
                      <SelectValue placeholder="Select the Ock" />
                    </SelectTrigger>
                    <SelectContent>
                      {ocksLoading ? (
                        <SelectItem value="loading">Loading Ocks...</SelectItem>
                      ) : (
                        ocks.map((ock) => (
                          <SelectItem key={ock.id} value={ock.id.toString()}>
                            {ock.name} - {ock.cornerStore} ({ock.borough})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Where did you find them?</label>
                  <Select onValueChange={(value) => setSelectedLocation(Number(value))}>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder="Select the location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationsLoading ? (
                        <SelectItem value="loading">Loading locations...</SelectItem>
                      ) : (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.address} - {location.borough}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">What rarity is your figurine?</label>
                  <Select onValueChange={setSelectedFigurineRarity}>
                    <SelectTrigger data-testid="select-rarity">
                      <SelectValue placeholder="Select figurine rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common (10 points)</SelectItem>
                      <SelectItem value="rare">Rare (25 points)</SelectItem>
                      <SelectItem value="elite">Elite (50 points)</SelectItem>
                      <SelectItem value="legendary">Legendary (100 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setShowPhotoUpload(true)}
                  disabled={!canSubmit}
                  className="w-full bg-ock-orange hover:bg-ock-orange/90"
                  data-testid="button-next"
                >
                  {canSubmit ? "Continue to Photo Upload" : "Please fill in all details"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PhotoUpload
              onPhotoCapture={handlePhotoSubmit}
              onCancel={() => setShowPhotoUpload(false)}
              isSubmitting={submitPhotoMutation.isPending}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}