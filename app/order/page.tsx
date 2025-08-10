"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/app/_hooks/cart/useCart";
import { useCreateOrder } from "@/app/_hooks/order/useCreateOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ShoppingCart, CreditCard, MapPin, User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddressForm {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function OrderPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: cartItems = [], isLoading } = useCart();
  const createOrderMutation = useCreateOrder();

  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0;
      return total + price * item.ypanierqte;
    }, 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((discount, item) => {
      if (item.yvarprod?.yvarprodprixpromotion && item.yvarprod?.yvarprodprixcatalogue) {
        const itemDiscount = (item.yvarprod.yvarprodprixcatalogue - item.yvarprod.yvarprodprixpromotion) * item.ypanierqte;
        return discount + itemDiscount;
      }
      return discount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shipping = 10; // Fixed shipping cost
  const total = subtotal - discount + shipping;

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentForm, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validate forms
    const addressValid = Object.values(addressForm).every(value => value.trim() !== "");
    const paymentValid = Object.values(paymentForm).every(value => value.trim() !== "");

    if (!addressValid) {
      toast.error("Please fill in all address fields");
      return;
    }

    if (!paymentValid) {
      toast.error("Please fill in all payment fields");
      return;
    }

    // Simulate card validation (for demo purposes)
    if (paymentForm.cardNumber.length < 16) {
      toast.error("Invalid card number");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({ cartItems });
      toast.success("Order placed successfully!");
      router.push("/order-confirmation");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-morpheus-gold-light/50 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-300 mb-4">Add some items to proceed with checkout</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingCart className="w-5 h-5 text-morpheus-gold-light" />
                  Order Items ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.ypanierid}
                    className="flex items-center gap-4 p-4 border border-morpheus-gold-dark/20 rounded-lg bg-white/5"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {(item.yvarprod as any)?.yvarprodmedia?.[0]?.ymedia?.ymediaurl ? (
                        <Image
                          src={(item.yvarprod as any).yvarprodmedia[0].ymedia.ymediaurl}
                          alt={item.yvarprod?.yvarprodintitule || "Product"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {item.yvarprod?.yvarprodintitule || "Unknown Product"}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        {item.yvarprod?.xcouleur && (
                          <span className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: item.yvarprod.xcouleur.xcouleurhexa }}
                            />
                            {item.yvarprod.xcouleur.xcouleurintitule}
                          </span>
                        )}
                        {item.yvarprod?.xtaille && (
                          <span>• {item.yvarprod.xtaille.xtailleintitule}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-300">Qty: {item.ypanierqte}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-morpheus-gold-dark">
                            $
                            {(
                              item.yvarprod?.yvarprodprixpromotion ||
                              item.yvarprod?.yvarprodprixcatalogue ||
                              0
                            ).toFixed(2)}
                          </span>
                          {item.yvarprod?.yvarprodprixpromotion &&
                            item.yvarprod?.yvarprodprixcatalogue && (
                              <span className="text-sm text-gray-300 line-through">
                                ${item.yvarprod.yvarprodprixcatalogue.toFixed(2)}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5 text-morpheus-gold-light" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      value={addressForm.fullName}
                      onChange={(e) => handleAddressChange("fullName", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone</Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-white">Address</Label>
                  <Input
                    id="address"
                    value={addressForm.address}
                    onChange={(e) => handleAddressChange("address", e.target.value)}
                    className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-white">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-white">Country</Label>
                    <Input
                      id="country"
                      value={addressForm.country}
                      onChange={(e) => handleAddressChange("country", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5 text-morpheus-gold-light" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName" className="text-white">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={(e) => handlePaymentChange("cardholderName", e.target.value)}
                    className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                    className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate" className="text-white">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={(e) => handlePaymentChange("expiryDate", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv" className="text-white">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                      className="bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-white">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator className="bg-morpheus-gold-dark/30" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}