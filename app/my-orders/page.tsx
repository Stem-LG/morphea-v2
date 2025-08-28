'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useUserOrders } from '@/app/_hooks/order/useUserOrders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Package,
    Calendar,
    DollarSign,
    Clock,
    Check,
    X,
    Truck,
    Home,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MyOrdersPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const { data: orders = [], isLoading } = useUserOrders()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-500/20 text-yellow-300"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {t('orders.status.pending')}
                    </Badge>
                )
            case 'confirmed':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-300"
                    >
                        <Package className="mr-1 h-3 w-3" />
                        {t('orders.status.confirmed')}
                    </Badge>
                )
            case 'shipped':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-500/20 text-green-300"
                    >
                        <Truck className="mr-1 h-3 w-3" />
                        {t('orders.status.shipped')}
                    </Badge>
                )
            case 'delivered':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-emerald-500/20 text-emerald-300"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        {t('orders.status.delivered')}
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-red-500/20 text-red-300"
                    >
                        <X className="mr-1 h-3 w-3" />
                        {t('orders.status.cancelled')}
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return t('orders.messagePending')
            case 'confirmed':
                return t('orders.messageConfirmed')
            case 'shipped':
                return t('orders.messageShipped')
            case 'delivered':
                return t('orders.messageDelivered')
            case 'cancelled':
                return t('orders.messageCancelled')
            default:
                return t('orders.messageUnknown')
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
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#053340]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-recia text-3xl font-bold text-[#053340]">
                            {t('orders.myOrders')}
                        </h1>
                        <p className="font-supreme text-gray-600">
                            {t('orders.trackYourOrder')}
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-[#053340] text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        {t('orders.startShopping')}
                    </Button>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <Card className="border border-gray-200 bg-white shadow-lg">
                            <CardContent className="py-12 text-center">
                                <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="font-recia mb-2 text-xl font-medium text-[#053340]">
                                    {t('orders.noOrdersYet')}
                                </h3>
                                <p className="font-supreme mb-6 text-gray-600">
                                    {t('orders.startShoppingMessage')}
                                </p>
                                <Button
                                    onClick={() => router.push('/')}
                                    className="bg-[#053340] text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                                >
                                    {t('orders.startShopping')}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((orderGroup) => (
                            <Card
                                key={orderGroup.zcommandeno}
                                className="border border-gray-200 bg-white shadow-lg"
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CardTitle className="font-recia text-[#053340]">
                                                {t('orders.orderNumber')}:{' '}
                                                {orderGroup.zcommandeno}
                                            </CardTitle>
                                            {getStatusBadge(
                                                orderGroup.zcommandestatut
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(
                                                orderGroup.zcommandedate
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="font-supreme mt-2 text-sm text-gray-600">
                                        {getStatusMessage(
                                            orderGroup.zcommandestatut
                                        )}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Delivery Information */}
                                    {orderGroup.zcommandestatut !==
                                        'cancelled' && (
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Truck className="h-4 w-4 text-[#053340]" />
                                                <span className="font-supreme font-medium text-[#053340]">
                                                    {t('orders.deliveryInfo')}
                                                </span>
                                            </div>
                                            <p className="font-supreme text-sm text-gray-600">
                                                {t('orders.expectedDelivery')}:{' '}
                                                {new Date(
                                                    orderGroup.zcommandelivraisondate
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Order Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-recia font-medium text-[#053340]">
                                            {t('orders.items')}
                                        </h4>
                                        {orderGroup.items.map(
                                            (item: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 rounded-lg bg-gray-50 p-4"
                                                >
                                                    {/* Product Image */}
                                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        {(item.yvarprod as any)
                                                            ?.yvarprodmedia?.[0]
                                                            ?.ymedia
                                                            ?.ymediaurl ? (
                                                            <Image
                                                                src={
                                                                    (
                                                                        item.yvarprod as any
                                                                    )
                                                                        .yvarprodmedia[0]
                                                                        .ymedia
                                                                        .ymediaurl
                                                                }
                                                                alt={
                                                                    item
                                                                        .yvarprod
                                                                        ?.yvarprodintitule ||
                                                                    'Product'
                                                                }
                                                                width={64}
                                                                height={64}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                                <Package className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1">
                                                        <h5 className="font-supreme font-medium text-[#053340]">
                                                            {item.yvarprod
                                                                ?.yvarprodintitule ||
                                                                t(
                                                                    'orders.unknownProduct'
                                                                )}
                                                        </h5>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
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

                                                    {/* Quantity and Price */}
                                                    <div className="text-right">
                                                        <p className="font-supreme font-medium text-[#053340]">
                                                            {t(
                                                                'orders.quantity'
                                                            )}
                                                            :{' '}
                                                            {
                                                                item.zcommandequantite
                                                            }
                                                        </p>
                                                        <p className="text-sm font-semibold text-[#053340]">
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

                                    <Separator className="bg-gray-200" />

                                    {/* Order Total */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-[#053340]" />
                                            <span className="font-recia text-lg font-semibold text-[#053340]">
                                                {t('orders.total')}: $
                                                {calculateOrderTotal(
                                                    orderGroup.items
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        {orderGroup.zcommandestatut ===
                                            'shipped' && (
                                            <Badge
                                                variant="secondary"
                                                className="border-blue-200 bg-blue-50 text-blue-600"
                                            >
                                                <Truck className="mr-1 h-3 w-3" />
                                                {t('orders.trackPackage')}
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
    )
}
