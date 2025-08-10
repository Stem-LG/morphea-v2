"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useAllOrders } from "@/app/admin/orders/_hooks/use-all-orders";
import { useUpdateOrderStatus } from "@/app/admin/orders/_hooks/use-update-order-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Package, User, Calendar, DollarSign, Check, X, Clock, Search } from "lucide-react";
import { useState } from "react";

interface OrderGroup {
    zcommandeno: string;
    zcommandeid: number;
    zcommandedate: string;
    zcommandelivraisondate: string;
    zcommandestatut: string;
    yvisiteur?: {
        yvisiteurnom?: string;
        yvisiteuremail?: string;
        yvisiteurtelephone?: string;
    } | null;
    items: any[];
}

export default function AdminOrdersPage() {
    const { t } = useLanguage();
    const { data: orders = [], isLoading } = useAllOrders();
    const updateOrderStatusMutation = useUpdateOrderStatus();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredOrders = orders.filter((order: OrderGroup) => {
        const matchesSearch =
            order.zcommandeno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.yvisiteur?.yvisiteurnom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.zcommandestatut === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusUpdate = async (orderNumber: string, newStatus: string) => {
      try {
        await updateOrderStatusMutation.mutateAsync({ orderNumber, status: newStatus });
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        <Package className="w-3 h-3 mr-1" />
                        Confirmed
                    </Badge>
                );
            case "shipped":
                return (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        <Check className="w-3 h-3 mr-1" />
                        Shipped
                    </Badge>
                );
            case "delivered":
                return (
                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                        <Check className="w-3 h-3 mr-1" />
                        Delivered
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="secondary" className="bg-red-500/20 text-red-300">
                        <X className="w-3 h-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const calculateOrderTotal = (orderItems: any[]) => {
        return orderItems.reduce((total, item) => {
            const price = item.yvarprod?.yvarprodprixpromotion || item.yvarprod?.yvarprodprixcatalogue || 0;
            return total + price * item.zcommandequantite;
        }, 0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-morpheus-gold-dark border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-3 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Order Management</h1>
                    <p className="text-gray-300">Manage and track all customer orders</p>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <Package className="w-5 h-5 text-morpheus-gold-light" />
                    <span className="font-medium">{orders.length} Total Orders</span>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="search" className="text-white">
                                Search Orders
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Search by order number or customer name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white/10 border-morpheus-gold-dark/30 text-white placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Label className="text-white">Filter by Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-white/10 border-morpheus-gold-dark/30 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20">
                        <CardContent className="text-center py-8">
                            <Package className="w-16 h-16 mx-auto text-morpheus-gold-light/50 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
                            <p className="text-gray-300">No orders match your current filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((orderGroup: OrderGroup) => (
                        <Card
                            key={orderGroup.zcommandeno}
                            className="bg-white/10 backdrop-blur-md border border-morpheus-gold-dark/20"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-4">
                                        <CardTitle className="text-white">Order #{orderGroup.zcommandeno}</CardTitle>
                                        {getStatusBadge(orderGroup.zcommandestatut)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(orderGroup.zcommandedate).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Customer Info */}
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                                    <User className="w-5 h-5 text-morpheus-gold-light" />
                                    <div>
                                        <p className="font-medium text-white">
                                            {orderGroup.yvisiteur?.yvisiteurnom || "Unknown Customer"}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {orderGroup.yvisiteur?.yvisiteuremail || "No email"}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-white">Order Items</h4>
                                    {orderGroup.items.map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-white">
                                                    {item.yvarprod?.yvarprodintitule || "Unknown Product"}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    {item.yvarprod?.xcouleur && (
                                                        <span className="flex items-center gap-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full border"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.yvarprod.xcouleur.xcouleurhexa,
                                                                }}
                                                            />
                                                            {item.yvarprod.xcouleur.xcouleurintitule}
                                                        </span>
                                                    )}
                                                    {item.yvarprod?.xtaille && (
                                                        <span>• {item.yvarprod.xtaille.xtailleintitule}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-white">Qty: {item.zcommandequantite}</p>
                                                <p className="text-sm text-morpheus-gold-light">
                                                    $
                                                    {(
                                                        item.yvarprod?.yvarprodprixpromotion ||
                                                        item.yvarprod?.yvarprodprixcatalogue ||
                                                        0
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="bg-morpheus-gold-dark/30" />

                                {/* Order Total and Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-morpheus-gold-light" />
                                        <span className="text-lg font-semibold text-white">
                                            Total: ${calculateOrderTotal(orderGroup.items).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {orderGroup.zcommandestatut === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(orderGroup.zcommandeno, "confirmed")
                                                    }
                                                    disabled={updateOrderStatusMutation.isPending}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleStatusUpdate(orderGroup.zcommandeno, "cancelled")
                                                    }
                                                    disabled={updateOrderStatusMutation.isPending}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {orderGroup.zcommandestatut === "confirmed" && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(orderGroup.zcommandeno, "shipped")}
                                                disabled={updateOrderStatusMutation.isPending}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <Package className="w-4 h-4 mr-1" />
                                                Mark as Shipped
                                            </Button>
                                        )}
                                        {orderGroup.zcommandestatut === "shipped" && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleStatusUpdate(orderGroup.zcommandeno, "delivered")}
                                                disabled={updateOrderStatusMutation.isPending}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Mark as Delivered
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
