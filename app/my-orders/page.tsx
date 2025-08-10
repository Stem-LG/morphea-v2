"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useUserOrders } from "@/app/_hooks/order/useUserOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, DollarSign, Clock, Check, X, Truck, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: orders = [], isLoading } = useUserOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "confirmed":
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-300"><Package className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "shipped":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-300"><Truck className="w-3 h-3 mr-1" />Shipped</Badge>;
      case "delivered":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300"><Check className="w-3 h-3 mr-1" />Delivered</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-500/20 text-red-300"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your order is being reviewed and will be processed soon.";
      case "confirmed":
        return "Your order has been confirmed and is being prepared for shipment.";
      case "shipped":
        return "Your order has been shipped and is on its way to you.";
      case "delivered":
        return "Your order has been delivered successfully.";
      case "cancelled":
        return "This order has been cancelled.";
      default:
        return "Order status unknown.";
    }
  };

  const calculateOrderTotal = (orderItems: any[]) => {
    return orderItems.reduce((total, item) => {
      const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0;
      return total + (price * item.zcommandequantite);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-morpheus-blue-dark via-morpheus-blue-dark/95 to-morpheus-blue-light/90">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
            <p className="text-gray-300">Track your order status and history</p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-morpheus-gold-light/50 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
                <p className="text-gray-300 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark text-white"
                >
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((orderGroup) => (
              <Card key={orderGroup.zcommandeno} className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-white">
                        Order #{orderGroup.zcommandeno}
                      </CardTitle>
                      {getStatusBadge(orderGroup.zcommandestatut)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4" />
                      {new Date(orderGroup.zcommandedate).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    {getStatusMessage(orderGroup.zcommandestatut)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Delivery Information */}
                  {orderGroup.zcommandestatut !== "cancelled" && (
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4 text-morpheus-gold-light" />
                        <span className="font-medium text-white">Delivery Information</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Expected delivery: {new Date(orderGroup.zcommandelivraisondate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Items Ordered</h4>
                    {orderGroup.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
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
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h5 className="font-medium text-white">
                            {item.yvarprod?.yvarprodintitule || "Unknown Product"}
                          </h5>
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
                        </div>

                        {/* Quantity and Price */}
                        <div className="text-right">
                          <p className="font-medium text-white">Qty: {item.zcommandequantite}</p>
                          <p className="text-sm text-morpheus-gold-light">
                            ${(item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-morpheus-gold-dark/30" />

                  {/* Order Total */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-morpheus-gold-light" />
                      <span className="text-lg font-semibold text-white">
                        Total: ${calculateOrderTotal(orderGroup.items).toFixed(2)}
                      </span>
                    </div>
                    {orderGroup.zcommandestatut === "shipped" && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        <Truck className="w-3 h-3 mr-1" />
                        Track Package
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}