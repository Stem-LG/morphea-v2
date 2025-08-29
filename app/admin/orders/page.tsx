'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useAllOrders } from '@/app/admin/orders/_hooks/use-all-orders'
import { useUpdateOrderStatus } from '@/app/admin/orders/_hooks/use-update-order-status'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
    Package,
    User,
    Calendar,
    DollarSign,
    Check,
    X,
    Clock,
    Search,
} from 'lucide-react'
import { useState } from 'react'

interface OrderGroup {
    zcommandeno: string
    zcommandeid: number
    zcommandedate: string
    zcommandelivraisondate: string
    zcommandestatut: string
    yvisiteur?: {
        yvisiteurnom?: string
        yvisiteuremail?: string
        yvisiteurtelephone?: string
    } | null
    items: any[]
}

export default function AdminOrdersPage() {
    const { t } = useLanguage()
    const { data: orders = [], isLoading } = useAllOrders()
    const updateOrderStatusMutation = useUpdateOrderStatus()

    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const filteredOrders = orders.filter((order: OrderGroup) => {
        const matchesSearch =
            order.zcommandeno
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            order.yvisiteur?.yvisiteurnom
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
        const matchesStatus =
            statusFilter === 'all' || order.zcommandestatut === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleStatusUpdate = async (
        orderNumber: string,
        newStatus: string
    ) => {
        try {
            await updateOrderStatusMutation.mutateAsync({
                orderNumber,
                status: newStatus,
            })
        } catch (error) {
            console.error('Failed to update order status:', error)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {t('orders.status.pending')}
                    </Badge>
                )
            case 'confirmed':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                    >
                        <Package className="mr-1 h-3 w-3" />
                        {t('orders.status.confirmed')}
                    </Badge>
                )
            case 'shipped':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        {t('orders.status.shipped')}
                    </Badge>
                )
            case 'delivered':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        {t('orders.status.delivered')}
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700"
                    >
                        <X className="mr-1 h-3 w-3" />
                        {t('orders.status.cancelled')}
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const calculateOrderTotal = (orderItems: any[]) => {
        return orderItems.reduce((total, item) => {
            const price =
                item.yvarprod?.yvarprodprixpromotion ||
                item.yvarprod?.yvarprodprixcatalogue ||
                0
            return total + price * item.zcommandequantite
        }, 0)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-3 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('admin.orders.title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('admin.orders.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-gray-900">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">
                        {orders.length} {t('admin.orders.totalOrders')}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="flex-1">
                            <Label htmlFor="search" className="text-gray-900">
                                {t('admin.orders.searchOrders')}
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder={t(
                                        'admin.orders.searchPlaceholder'
                                    )}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Label className="text-gray-900">
                                {t('admin.orders.filterByStatus')}
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('admin.orders.allStatus')}
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        {t('orders.status.pending')}
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                        {t('orders.status.confirmed')}
                                    </SelectItem>
                                    <SelectItem value="shipped">
                                        {t('orders.status.shipped')}
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        {t('orders.status.delivered')}
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        {t('orders.status.cancelled')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card className="border border-gray-200 bg-white">
                        <CardContent className="py-8 text-center">
                            <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">
                                {t('admin.orders.noOrdersFound')}
                            </h3>
                            <p className="text-gray-600">
                                {t('admin.orders.noOrdersMatchFilters')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredOrders.map((orderGroup: OrderGroup) => (
                        <Card
                            key={orderGroup.zcommandeno}
                            className="border border-gray-200 bg-white"
                        >
                            <CardHeader>
                                <div className="flex items-center justify-between pt-4">
                                    <div className="flex items-center gap-4">
                                        <CardTitle className="text-gray-900">
                                            {t('admin.orders.orderNumber')} #
                                            {orderGroup.zcommandeno}
                                        </CardTitle>
                                        {getStatusBadge(
                                            orderGroup.zcommandestatut
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(
                                            orderGroup.zcommandedate
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Customer Info */}
                                <div className="flex items-center gap-4 rounded-lg bg-white/5 p-4">
                                    <User className="text-morpheus-gold-light h-5 w-5" />
                                    <div>
                                        <p className="font-medium text-white">
                                            {orderGroup.yvisiteur
                                                ?.yvisiteurnom ||
                                                t(
                                                    'admin.orders.unknownCustomer'
                                                )}
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {orderGroup.yvisiteur
                                                ?.yvisiteuremail ||
                                                t('admin.orders.noEmail')}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-white">
                                        {t('admin.orders.orderItems')}
                                    </h4>
                                    {orderGroup.items.map(
                                        (item: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">
                                                        {item.yvarprod
                                                            ?.yvarprodintitule ||
                                                            t(
                                                                'admin.orders.unknownProduct'
                                                            )}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        {item.yvarprod
                                                            ?.xcouleur && (
                                                            <span className="flex items-center gap-1">
                                                                <div
                                                                    className="h-3 w-3 rounded-full border"
                                                                    style={{
                                                                        backgroundColor:
                                                                            item
                                                                                .yvarprod
                                                                                .xcouleur
                                                                                .xcouleurhexa,
                                                                    }}
                                                                />
                                                                {
                                                                    item
                                                                        .yvarprod
                                                                        .xcouleur
                                                                        .xcouleurintitule
                                                                }
                                                            </span>
                                                        )}
                                                        {item.yvarprod
                                                            ?.xtaille && (
                                                            <span>
                                                                •{' '}
                                                                {
                                                                    item
                                                                        .yvarprod
                                                                        .xtaille
                                                                        .xtailleintitule
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-white">
                                                        {t(
                                                            'admin.orders.quantity'
                                                        )}
                                                        :{' '}
                                                        {item.zcommandequantite}
                                                    </p>
                                                    <p className="text-morpheus-gold-light text-sm">
                                                        $
                                                        {(
                                                            item.yvarprod
                                                                ?.yvarprodprixpromotion ||
                                                            item.yvarprod
                                                                ?.yvarprodprixcatalogue ||
                                                            0
                                                        ).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                <Separator className="bg-morpheus-gold-dark/30" />

                                {/* Order Total and Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="text-morpheus-gold-light h-5 w-5" />
                                        <span className="text-lg font-semibold text-white">
                                            {t('admin.orders.total')}: $
                                            {calculateOrderTotal(
                                                orderGroup.items
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {orderGroup.zcommandestatut ===
                                            'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            orderGroup.zcommandeno,
                                                            'confirmed'
                                                        )
                                                    }
                                                    disabled={
                                                        updateOrderStatusMutation.isPending
                                                    }
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    <Check className="mr-1 h-4 w-4" />
                                                    {t('admin.orders.confirm')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleStatusUpdate(
                                                            orderGroup.zcommandeno,
                                                            'cancelled'
                                                        )
                                                    }
                                                    disabled={
                                                        updateOrderStatusMutation.isPending
                                                    }
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    {t('admin.orders.cancel')}
                                                </Button>
                                            </>
                                        )}
                                        {orderGroup.zcommandestatut ===
                                            'confirmed' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        orderGroup.zcommandeno,
                                                        'shipped'
                                                    )
                                                }
                                                disabled={
                                                    updateOrderStatusMutation.isPending
                                                }
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <Package className="mr-1 h-4 w-4" />
                                                {t(
                                                    'admin.orders.markAsShipped'
                                                )}
                                            </Button>
                                        )}
                                        {orderGroup.zcommandestatut ===
                                            'shipped' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleStatusUpdate(
                                                        orderGroup.zcommandeno,
                                                        'delivered'
                                                    )
                                                }
                                                disabled={
                                                    updateOrderStatusMutation.isPending
                                                }
                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <Check className="mr-1 h-4 w-4" />
                                                {t(
                                                    'admin.orders.markAsDelivered'
                                                )}
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
    )
}
