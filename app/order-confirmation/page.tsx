'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Package, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrderConfirmationPage() {
    const { t } = useLanguage()
    const router = useRouter()

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="text-[#053340] hover:bg-gray-100"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back')}
                    </Button>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-2xl">
                    <Card className="border border-gray-200 bg-white shadow-lg">
                        <CardHeader className="border-b border-gray-100 pb-6 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 p-4">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <CardTitle className="font-recia text-3xl font-extrabold text-[#053340]">
                                {t('orderConfirmation.orderConfirmed')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-8">
                            <div className="text-center">
                                <p className="font-supreme mb-6 text-lg text-gray-600">
                                    {t('orderConfirmation.thankYouMessage')}
                                </p>
                                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                                    <div className="flex items-center justify-center gap-3 text-[#053340]">
                                        <div className="rounded-lg bg-white p-2 shadow-sm">
                                            <Package className="h-5 w-5 text-[#053340]" />
                                        </div>
                                        <span className="font-supreme text-lg font-semibold">
                                            {t(
                                                'orderConfirmation.estimatedDelivery'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-recia text-2xl font-extrabold text-[#053340]">
                                    {t('orderConfirmation.whatsNext')}
                                </h3>
                                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-[#053340]"></div>
                                        <p className="font-supreme text-gray-700">
                                            {t(
                                                'orderConfirmation.emailConfirmation'
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-[#053340]"></div>
                                        <p className="font-supreme text-gray-700">
                                            {t(
                                                'orderConfirmation.shippingNotification'
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-[#053340]"></div>
                                        <p className="font-supreme text-gray-700">
                                            {t('orderConfirmation.trackOrder')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="font-supreme flex-1 bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    {t('cart.continueShopping')}
                                </Button>
                                <Button
                                    onClick={() => router.push('/profile')}
                                    variant="outline"
                                    className="font-supreme flex-1 border-gray-300 font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                                >
                                    {t('orders.viewAllOrders')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
