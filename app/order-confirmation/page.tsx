"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrderConfirmationPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20 text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Order Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                Thank you for your order! We've received your payment and your order is being processed.
              </p>
              <div className="bg-white/5 border border-morpheus-gold-dark/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-morpheus-gold-light">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Estimated Delivery: 7 business days</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What's Next?</h3>
              <div className="text-left space-y-2 text-gray-300">
                <p>• You'll receive an email confirmation shortly</p>
                <p>• We'll notify you when your order ships</p>
                <p>• Track your order status in your account</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <Button
                onClick={() => router.push("/profile")}
                variant="outline"
                className="flex-1 border-morpheus-gold-dark/30 text-white hover:bg-morpheus-gold-dark/20"
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}