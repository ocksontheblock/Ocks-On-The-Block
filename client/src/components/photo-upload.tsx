import { useState, useRef } from "react";
import { Camera, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onPhotoCapture: (photo: File, location?: GeolocationCoordinates) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PhotoUpload({ onPhotoCapture, onCancel, isSubmitting }: PhotoUploadProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Get location
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      toast({
        title: "Location Captured",
        description: "Photo location has been recorded for verification.",
      });
    } catch (error) {
      toast({
        title: "Location Access Denied",
        description: "Enable location access for better verification.",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = async () => {
    setIsCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',  // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });

      // Create video element to capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `hunt-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhoto(file);
            setPhotoPreview(canvas.toDataURL());
          }
        }, 'image/jpeg', 0.8);

        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      };

      // Get location
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take photos.",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const handleSubmit = () => {
    if (photo) {
      onPhotoCapture(photo, location || undefined);
    }
  };

  const handleReset = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setLocation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Submit Your Hunt Photo</span>
        </CardTitle>
        <CardDescription>
          Take a photo with you, your figurine, and the real Ock together
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!photoPreview ? (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="flex-1"
                data-testid="button-camera"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isCapturing ? "Opening Camera..." : "Take Photo"}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
                data-testid="button-upload"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
            
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your photo must include:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>✓ You in the photo</li>
                <li>✓ Your Ock figurine clearly visible</li>
                <li>✓ The real Ock (store worker)</li>
                <li>✓ Clear store/location context</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Hunt submission" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                onClick={handleReset}
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                data-testid="button-reset"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-1 text-green-500" />
                Photo ready
              </span>
              {location && (
                <span className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Location captured
                </span>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-ock-orange hover:bg-ock-orange/90"
                data-testid="button-submit"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}