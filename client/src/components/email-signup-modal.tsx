import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailSignupSchema, type InsertEmailSignup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailSignupModal({ isOpen, onClose }: EmailSignupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertEmailSignup>({
    resolver: zodResolver(insertEmailSignupSchema),
    defaultValues: {
      email: "",
      active: true,
    },
  });

  const onSubmit = async (data: InsertEmailSignup) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/email-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Failed to signup");
      
      toast({
        title: "Welcome to the block!",
        description: "Check your email for a welcome message with all the details.",
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again. Make sure your email is valid.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          data-testid="button-close-signup-modal"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h3 className="font-anton text-2xl text-gray-900 mb-2">
            Get First Drop Alerts
          </h3>
          <p className="text-gray-600 text-sm">
            Be the first to know about new Ock drops, limited releases, and exclusive merch. You'll get a welcome email with all the details!
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              {...form.register("email")}
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ock-orange focus:border-transparent"
              placeholder="your.email@example.com"
              data-testid="input-signup-email"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ock-orange hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            data-testid="button-signup-submit"
          >
            {isSubmitting ? "Signing up..." : "Get Drop Alerts"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          No spam, just the freshest drops. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}