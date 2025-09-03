'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { useCurrency } from '@/hooks/useCurrency'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/app/_hooks/cart/useCart'
import { useCreateOrder } from '@/app/_hooks/order/useCreateOrder'
import { useDeliveryFee } from '@/hooks/use-delivery-fee'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { OrderStepper } from '@/app/_components/order-stepper'
import Image from 'next/image'
import { ShoppingCart, CreditCard, MapPin, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AddressForm {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
}

interface PaymentForm {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderFirstName: string
    cardholderLastName: string
}

export default function OrderPage() {
    const { t } = useLanguage()
    const { formatPrice, currencies, convertPrice, currentCurrency } =
        useCurrency()
    const { data: currentUser } = useAuth()
    const router = useRouter()
    const { data: cartItems = [], isLoading } = useCart()
    const createOrderMutation = useCreateOrder()
    const { data: deliveryFee = 10, isLoading: isLoadingDeliveryFee } =
        useDeliveryFee()

    // Stepper state
    const [currentStep, setCurrentStep] = useState(1)

    const steps = [
        {
            id: 'cart',
            title: t('order.steps.confirmCart') || 'Confirm Cart',
            description:
                t('order.stepDescriptions.confirmCart') ||
                'Review your selected items',
        },
        {
            id: 'shipping',
            title: t('order.steps.shippingAddress') || 'Shipping Address',
            description:
                t('order.stepDescriptions.shippingAddress') ||
                'Enter your delivery address',
        },
        {
            id: 'payment',
            title: t('order.steps.paymentInfo') || 'Payment Info',
            description:
                t('order.stepDescriptions.paymentInfo') ||
                'Enter payment details',
        },
        {
            id: 'review',
            title: t('order.steps.reviewOrder') || 'Review Order',
            description:
                t('order.stepDescriptions.reviewOrder') || 'Confirm your order',
        },
    ]

    const [addressForm, setAddressForm] = useState<AddressForm>({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
    })

    const [paymentForm, setPaymentForm] = useState<PaymentForm>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderFirstName: '',
        cardholderLastName: '',
    })

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            if (!item.yvarprod) return total

            // Find the product's base currency
            const productCurrency = currencies.find(
                (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
            )
            const price =
                item.yvarprod.yvarprodprixpromotion ||
                item.yvarprod.yvarprodprixcatalogue ||
                0

            // Convert price from product currency to current currency
            const convertedPrice = convertPrice(price, productCurrency)

            return total + convertedPrice * item.ypanierqte
        }, 0)
    }

    const calculateDiscount = () => {
        return cartItems.reduce((discount, item) => {
            if (
                !item.yvarprod?.yvarprodprixpromotion ||
                !item.yvarprod?.yvarprodprixcatalogue
            )
                return discount

            // Find the product's base currency
            const productCurrency = currencies.find(
                (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
            )

            // Convert prices from product currency to current currency
            const convertedOriginalPrice = convertPrice(
                item.yvarprod.yvarprodprixcatalogue,
                productCurrency
            )
            const convertedPromotionPrice = convertPrice(
                item.yvarprod.yvarprodprixpromotion,
                productCurrency
            )

            const itemDiscount =
                (convertedOriginalPrice - convertedPromotionPrice) *
                item.ypanierqte
            return discount + itemDiscount
        }, 0)
    }

    // Helper function to get formatted price for an item
    const getFormattedItemPrice = (item: any) => {
        if (!item.yvarprod) return '$0.00'

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        const price =
            item.yvarprod.yvarprodprixpromotion ||
            item.yvarprod.yvarprodprixcatalogue ||
            0

        return formatPrice(price, productCurrency)
    }

    // Helper function to get formatted original price for an item
    const getFormattedOriginalPrice = (item: any) => {
        if (
            !item.yvarprod?.yvarprodprixpromotion ||
            !item.yvarprod?.yvarprodprixcatalogue
        )
            return null

        const productCurrency = currencies.find(
            (c) => c.xdeviseid === item.yvarprod?.xdeviseidfk
        )
        return formatPrice(item.yvarprod.yvarprodprixcatalogue, productCurrency)
    }

    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const shipping = deliveryFee // Dynamic delivery fee from settings
    const total = subtotal - discount + shipping

    // Stepper navigation functions
    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const goToStep = (step: number) => {
        setCurrentStep(step)
    }

    const handleAddressChange = (field: keyof AddressForm, value: string) => {
        setAddressForm((prev) => ({ ...prev, [field]: value }))
    }

    const handlePaymentChange = (field: keyof PaymentForm, value: string) => {
        setPaymentForm((prev) => ({ ...prev, [field]: value }))
    }

    // Validation functions
    const validateAddressForm = () => {
        return Object.values(addressForm).every((value) => value.trim() !== '')
    }

    const validatePaymentForm = () => {
        return Object.values(paymentForm).every((value) => value.trim() !== '')
    }

    const handleContinueToShipping = () => {
        nextStep()
    }

    const handleContinueToPayment = () => {
        if (!validateAddressForm()) {
            toast.error(
                t('order.pleaseCompleteAddressFields') ||
                    'Please complete all address fields'
            )
            return
        }
        nextStep()
    }

    const handleContinueToReview = () => {
        if (!validatePaymentForm()) {
            toast.error(
                t('order.pleaseCompletePaymentFields') ||
                    'Please complete all payment fields'
            )
            return
        }
        if (paymentForm.cardNumber.length < 16) {
            toast.error(t('order.invalidCardNumber') || 'Invalid card number')
            return
        }
        nextStep()
    }

    const handlePlaceOrder = async () => {
        try {
            await createOrderMutation.mutateAsync({ cartItems })
            toast.success(t('order.orderPlacedSuccessfully'))
            router.push('/order-confirmation')
        } catch (error) {
            console.log(error)
            toast.error(t('order.failedToPlaceOrder'))
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#053340] border-t-transparent"></div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Card className="mx-auto max-w-md border-border bg-card shadow-xl">
                    <CardContent className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted p-4">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="font-recia mb-3 text-2xl font-extrabold text-foreground">
                            {t('cart.yourCartIsEmpty')}
                        </h2>
                        <p className="font-supreme mb-6 text-lg text-muted-foreground">
                            {t('order.addItemsToCheckout')}
                        </p>
                        <Button
                            onClick={() => router.push('/')}
                            className="font-supreme bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                        >
                            {t('cart.continueShopping')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderCartConfirmation()
            case 2:
                return renderShippingAddress()
            case 3:
                return renderPaymentInfo()
            case 4:
                return renderOrderReview()
            default:
                return renderCartConfirmation()
        }
    }

    const renderCartConfirmation = () => (
        <Card className="border-border bg-card shadow-lg">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-3 text-card-foreground">
                    <div className="rounded-lg bg-muted p-2">
                        <ShoppingCart className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="font-recia text-2xl font-extrabold">
                        {t('order.orderItems')} ({cartItems.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {cartItems.map((item) => (
                    <div
                        key={item.ypanierid}
                        className="flex items-center gap-4 rounded-xl border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
                    >
                        {/* Product Image */}
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-border bg-card shadow-sm">
                            {(item.yvarprod as any)?.yvarprodmedia?.[0]?.ymedia
                                ?.ymediaurl ? (
                                <Image
                                    src={
                                        (item.yvarprod as any).yvarprodmedia[0]
                                            .ymedia.ymediaurl
                                    }
                                    alt={
                                        item.yvarprod.yvarprodintitule ||
                                        'Product'
                                    }
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-supreme truncate text-lg font-semibold text-foreground">
                                {item.yvarprod?.yvarprodintitule ||
                                    'Unknown Product'}
                            </h4>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                {item.yvarprod?.xcouleur && (
                                    <span className="flex items-center gap-1">
                                        <div
                                            className="h-3 w-3 rounded-full border"
                                            style={{
                                                backgroundColor:
                                                    item.yvarprod.xcouleur
                                                        .xcouleurhexa,
                                            }}
                                        />
                                        {
                                            item.yvarprod.xcouleur
                                                .xcouleurintitule
                                        }
                                    </span>
                                )}
                                {item.yvarprod?.xtaille && (
                                    <span>
                                        •{' '}
                                        {item.yvarprod.xtaille.xtailleintitule}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="font-supreme text-sm text-gray-500">
                                    {t('orders.quantity')}: {item.ypanierqte}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-supreme text-lg font-bold text-[#053340]">
                                        {getFormattedItemPrice(item)}
                                    </span>
                                    {getFormattedOriginalPrice(item) && (
                                        <span className="text-sm text-gray-400 line-through">
                                            {getFormattedOriginalPrice(item)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleContinueToShipping}
                        className="font-supreme bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                    >
                        {t('order.continueToShipping') ||
                            'Continue to Shipping'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderShippingAddress = () => (
        <Card className="border-border bg-card shadow-lg">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-3 text-card-foreground">
                    <div className="rounded-lg bg-muted p-2">
                        <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="font-recia text-2xl font-extrabold">
                        {t('order.shippingAddress')}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="firstName"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('profile.firstName') || 'First Name'}
                        </Label>
                        <Input
                            id="firstName"
                            value={addressForm.firstName}
                            onChange={(e) =>
                                handleAddressChange('firstName', e.target.value)
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={
                                t('order.firstNamePlaceholder') ||
                                'Enter your first name'
                            }
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="lastName"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('profile.lastName') || 'Last Name'}
                        </Label>
                        <Input
                            id="lastName"
                            value={addressForm.lastName}
                            onChange={(e) =>
                                handleAddressChange('lastName', e.target.value)
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={
                                t('order.lastNamePlaceholder') ||
                                'Enter your last name'
                            }
                        />
                    </div>
                </div>
                <div>
                    <Label
                        htmlFor="phone"
                        className="font-supreme font-semibold text-[#053340]"
                    >
                        {t('visitorForm.phone')}
                    </Label>
                    <Input
                        id="phone"
                        value={addressForm.phone}
                        onChange={(e) =>
                            handleAddressChange('phone', e.target.value)
                        }
                        className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                        placeholder={t('order.phonePlaceholder')}
                    />
                </div>
                <div>
                    <Label
                        htmlFor="address"
                        className="font-supreme font-semibold text-[#053340]"
                    >
                        {t('visitorForm.address')}
                    </Label>
                    <Input
                        id="address"
                        value={addressForm.address}
                        onChange={(e) =>
                            handleAddressChange('address', e.target.value)
                        }
                        className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                        placeholder={t('order.addressPlaceholder')}
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <Label
                            htmlFor="city"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('order.city')}
                        </Label>
                        <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) =>
                                handleAddressChange('city', e.target.value)
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={t('order.cityPlaceholder')}
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="postalCode"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('order.postalCode')}
                        </Label>
                        <Input
                            id="postalCode"
                            value={addressForm.postalCode}
                            onChange={(e) =>
                                handleAddressChange(
                                    'postalCode',
                                    e.target.value
                                )
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={t('order.postalCodePlaceholder')}
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="country"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('order.country')}
                        </Label>
                        <Input
                            id="country"
                            value={addressForm.country}
                            onChange={(e) =>
                                handleAddressChange('country', e.target.value)
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={t('order.countryPlaceholder')}
                        />
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="font-supreme border-gray-300 font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                    >
                        {t('order.backToCart') || 'Back to Cart'}
                    </Button>
                    <Button
                        onClick={handleContinueToPayment}
                        className="font-supreme bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                    >
                        {t('order.continueToPayment') || 'Continue to Payment'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderPaymentInfo = () => (
        <Card className="border-border bg-card shadow-lg">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-3 text-card-foreground">
                    <div className="rounded-lg bg-muted p-2">
                        <CreditCard className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="font-recia text-2xl font-extrabold">
                        {t('order.paymentInformation')}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label
                            htmlFor="cardholderFirstName"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('profile.firstName') || 'First Name'}
                        </Label>
                        <Input
                            id="cardholderFirstName"
                            value={paymentForm.cardholderFirstName}
                            onChange={(e) =>
                                handlePaymentChange(
                                    'cardholderFirstName',
                                    e.target.value
                                )
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={
                                t('order.firstNamePlaceholder') ||
                                'Enter cardholder first name'
                            }
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="cardholderLastName"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('profile.lastName') || 'Last Name'}
                        </Label>
                        <Input
                            id="cardholderLastName"
                            value={paymentForm.cardholderLastName}
                            onChange={(e) =>
                                handlePaymentChange(
                                    'cardholderLastName',
                                    e.target.value
                                )
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={
                                t('order.lastNamePlaceholder') ||
                                'Enter cardholder last name'
                            }
                        />
                    </div>
                </div>
                <div>
                    <Label
                        htmlFor="cardNumber"
                        className="font-supreme font-semibold text-[#053340]"
                    >
                        {t('order.cardNumber')}
                    </Label>
                    <Input
                        id="cardNumber"
                        value={paymentForm.cardNumber}
                        onChange={(e) =>
                            handlePaymentChange('cardNumber', e.target.value)
                        }
                        className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                        placeholder={t('order.cardNumberPlaceholder')}
                        maxLength={19}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label
                            htmlFor="expiryDate"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('order.expiryDate')}
                        </Label>
                        <Input
                            id="expiryDate"
                            value={paymentForm.expiryDate}
                            onChange={(e) =>
                                handlePaymentChange(
                                    'expiryDate',
                                    e.target.value
                                )
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={t('order.expiryDatePlaceholder')}
                            maxLength={5}
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="cvv"
                            className="font-supreme font-semibold text-[#053340]"
                        >
                            {t('order.cvv')}
                        </Label>
                        <Input
                            id="cvv"
                            value={paymentForm.cvv}
                            onChange={(e) =>
                                handlePaymentChange('cvv', e.target.value)
                            }
                            className="mt-2 h-12 border-gray-300 bg-white text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]"
                            placeholder={t('order.cvvPlaceholder')}
                            maxLength={4}
                        />
                    </div>
                </div>
                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="font-supreme border-gray-300 font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                    >
                        {t('order.backToShipping') || 'Back to Shipping'}
                    </Button>
                    <Button
                        onClick={handleContinueToReview}
                        className="font-supreme bg-[#053340] font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                    >
                        {t('order.continueToReview') || 'Continue to Review'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const renderOrderReview = () => (
        <Card className="border-border bg-card shadow-lg">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-recia text-2xl font-extrabold text-[#053340]">
                    {t('order.orderSummary')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Order Items */}
                <div className="space-y-4">
                    <h3 className="font-supreme flex items-center gap-2 font-semibold text-[#053340]">
                        <ShoppingCart className="h-4 w-4" />
                        {t('order.orderItems')} ({cartItems.length})
                    </h3>
                    <div className="space-y-2">
                        {cartItems.map((item) => (
                            <div
                                key={item.ypanierid}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
                                        {(item.yvarprod as any)
                                            ?.yvarprodmedia?.[0]?.ymedia
                                            ?.ymediaurl ? (
                                            <Image
                                                src={
                                                    (item.yvarprod as any)
                                                        .yvarprodmedia[0].ymedia
                                                        .ymediaurl
                                                }
                                                alt={
                                                    item.yvarprod
                                                        .yvarprodintitule ||
                                                    'Product'
                                                }
                                                width={32}
                                                height={32}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                <ShoppingCart className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-supreme text-sm font-medium text-[#053340]">
                                            {item.yvarprod?.yvarprodintitule ||
                                                'Unknown Product'}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            {item.yvarprod?.xcouleur && (
                                                <span className="flex items-center gap-1">
                                                    <div
                                                        className="h-2 w-2 rounded-full border"
                                                        style={{
                                                            backgroundColor:
                                                                item.yvarprod
                                                                    .xcouleur
                                                                    .xcouleurhexa,
                                                        }}
                                                    />
                                                    {
                                                        item.yvarprod.xcouleur
                                                            .xcouleurintitule
                                                    }
                                                </span>
                                            )}
                                            {item.yvarprod?.xtaille && (
                                                <span>
                                                    •{' '}
                                                    {
                                                        item.yvarprod.xtaille
                                                            .xtailleintitule
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="font-supreme text-sm font-semibold text-[#053340]">
                                    x{item.ypanierqte}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                    <h3 className="font-supreme flex items-center gap-2 font-semibold text-[#053340]">
                        <MapPin className="h-4 w-4" />
                        {t('order.shippingAddress')}
                    </h3>
                    <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('profile.firstName')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {addressForm.firstName}
                                </p>
                            </div>
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('profile.lastName')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {addressForm.lastName}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs tracking-wide text-gray-500 uppercase">
                                {t('visitorForm.address')}
                            </span>
                            <p className="font-supreme font-medium text-[#053340]">
                                {addressForm.address}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('order.city')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {addressForm.city}
                                </p>
                            </div>
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('order.postalCode')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {addressForm.postalCode}
                                </p>
                            </div>
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('order.country')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {addressForm.country}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs tracking-wide text-gray-500 uppercase">
                                {t('visitorForm.phone')}
                            </span>
                            <p className="font-supreme font-medium text-[#053340]">
                                {addressForm.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-3">
                    <h3 className="font-supreme flex items-center gap-2 font-semibold text-[#053340]">
                        <CreditCard className="h-4 w-4" />
                        {t('order.paymentInformation')}
                    </h3>
                    <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('profile.firstName')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {paymentForm.cardholderFirstName}
                                </p>
                            </div>
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('profile.lastName')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {paymentForm.cardholderLastName}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs tracking-wide text-gray-500 uppercase">
                                {t('order.cardNumber')}
                            </span>
                            <p className="font-supreme font-medium text-[#053340]">
                                •••• •••• ••••{' '}
                                {paymentForm.cardNumber.slice(-4)}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('order.expiryDate')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    {paymentForm.expiryDate}
                                </p>
                            </div>
                            <div className="flex-1">
                                <span className="text-xs tracking-wide text-gray-500 uppercase">
                                    {t('order.cvv')}
                                </span>
                                <p className="font-supreme font-medium text-[#053340]">
                                    •••
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="font-supreme border-gray-300 font-medium text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                    >
                        {t('order.backToPayment') || 'Back to Payment'}
                    </Button>
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={createOrderMutation.isPending}
                        className="font-supreme bg-[#053340] py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                    >
                        {createOrderMutation.isPending
                            ? t('order.processing')
                            : t('order.placeOrder')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-[#053340] hover:bg-gray-100"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back')}
                    </Button>
                    <h1 className="font-recia text-4xl font-extrabold text-[#053340]">
                        {t('order.checkout')}
                    </h1>
                </div>

                {/* Stepper */}
                <OrderStepper currentStep={currentStep} steps={steps} />

                {/* Step Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">{renderStepContent()}</div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8 border-border bg-card shadow-lg">
                            <CardHeader className="border-b border-border pb-4">
                                <CardTitle className="font-recia text-2xl font-extrabold text-[#053340]">
                                    {t('cart.orderSummary')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="font-supreme flex justify-between text-[#053340]">
                                    <span className="font-medium">
                                        {t('order.subtotal')}
                                    </span>
                                    <span className="font-semibold">
                                        {formatPrice(
                                            subtotal,
                                            currentCurrency,
                                            currentCurrency
                                        )}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="font-supreme font-medium">
                                            {t('order.discount')}
                                        </span>
                                        <span className="font-supreme font-semibold">
                                            -
                                            {formatPrice(
                                                discount,
                                                currentCurrency,
                                                currentCurrency
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="font-supreme flex justify-between text-[#053340]">
                                    <span className="font-medium">
                                        {t('cart.shipping')}
                                    </span>
                                    <span className="font-semibold">
                                        {formatPrice(
                                            shipping,
                                            currentCurrency,
                                            currentCurrency
                                        )}
                                    </span>
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span className="font-supreme text-[#053340]">
                                        {t('cart.total')}
                                    </span>
                                    <span className="font-recia text-[#053340]">
                                        {formatPrice(
                                            total,
                                            currentCurrency,
                                            currentCurrency
                                        )}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
