import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Unsubscribe() {
  const [location, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [email, setEmail] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setStatus('invalid');
      return;
    }

    const handleUnsubscribe = async () => {
      try {
        const response: any = await apiRequest("POST", "/api/unsubscribe", { token });
        setEmail(response.email);
        setStatus('success');
        toast({
          title: "Successfully Unsubscribed",
          description: "You won't receive any more email alerts from us.",
        });
      } catch (error: any) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        toast({
          title: "Unsubscribe Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    };

    handleUnsubscribe();
  }, [location, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <div className="animate-spin w-12 h-12 border-4 border-ock-orange border-t-transparent rounded-full"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-500" />
            )}
            {(status === 'error' || status === 'invalid') && (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-anton">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Unsubscribed Successfully'}
            {status === 'error' && 'Unsubscribe Failed'}
            {status === 'invalid' && 'Invalid Link'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'We\'re processing your unsubscribe request...'}
            {status === 'success' && `${email} has been removed from our mailing list.`}
            {status === 'error' && 'There was an issue processing your request.'}
            {status === 'invalid' && 'This unsubscribe link is invalid or has expired.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You've been successfully unsubscribed from Ocks on the Block email alerts. 
                You won't receive any more promotional emails from us.
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Sorry, we couldn't process your unsubscribe request. Please try again or contact support.
              </p>
            </div>
          )}
          
          {status === 'invalid' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                This unsubscribe link appears to be invalid or may have expired. 
                If you're still receiving unwanted emails, please contact our support team.
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
          
          {status === 'success' && (
            <div className="text-xs text-gray-500 mt-4">
              <p>Changed your mind? You can always sign up for alerts again on our homepage.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}