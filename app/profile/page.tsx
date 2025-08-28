'use client'

import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProfileInfoDisplay } from '@/components/profile-info-display'
import { ProfileInfoEdit } from '@/components/profile-info-edit'
import { PasswordChangeForm } from '@/components/password-change-form'
import { AccountDeletionSection } from '@/components/account-deletion-section'
import { profileService, ProfileUpdateData } from '@/lib/profile-service'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useUserOrders } from '@/app/_hooks/order/useUserOrders'
import { Badge } from '@/components/ui/badge'
import {
    Package,
    Calendar,
    DollarSign,
    Clock,
    Check,
    X,
    Truck,
} from 'lucide-react'
import Image from 'next/image'

// Orders Tab Component
function OrdersTab() {
    const { data: orders = [], isLoading } = useUserOrders()
    const { t } = useLanguage()
    const router = useRouter()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        variant="secondary"
                        className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {t('orders.status.pending')}
                    </Badge>
                )
            case 'confirmed':
                return (
                    <Badge
                        variant="secondary"
                        className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                        <Package className="mr-1 h-3 w-3" />
                        {t('orders.status.confirmed')}
                    </Badge>
                )
            case 'shipped':
                return (
                    <Badge
                        variant="secondary"
                        className="border-green-200 bg-green-50 text-green-700"
                    >
                        <Truck className="mr-1 h-3 w-3" />
                        {t('orders.status.shipped')}
                    </Badge>
                )
            case 'delivered':
                return (
                    <Badge
                        variant="secondary"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        {t('orders.status.delivered')}
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge
                        variant="secondary"
                        className="border-red-200 bg-red-50 text-red-700"
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
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#053340]"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4 text-center">
                <h2 className="font-recia text-2xl font-bold text-[#053340]">
                    {t('orders.myOrders')}
                </h2>
                <p className="font-supreme text-gray-600">
                    {t('orders.trackYourOrder')}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="space-y-4 py-12 text-center">
                    <Package className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="font-recia text-xl font-medium text-[#053340]">
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
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((orderGroup: any) => (
                        <div
                            key={orderGroup.zcommandeno}
                            className="space-y-4 border border-gray-200 bg-white p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-recia text-lg font-semibold text-[#053340]">
                                        {t('orders.orderNumber')}:{' '}
                                        {orderGroup.zcommandeno}
                                    </h3>
                                    {getStatusBadge(orderGroup.zcommandestatut)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(
                                        orderGroup.zcommandedate
                                    ).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3">
                                <h4 className="font-recia font-medium text-[#053340]">
                                    {t('orders.items')}
                                </h4>
                                {orderGroup.items
                                    .slice(0, 3)
                                    .map((item: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 rounded-lg bg-gray-50 p-3"
                                        >
                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {(item.yvarprod as any)
                                                    ?.yvarprodmedia?.[0]?.ymedia
                                                    ?.ymediaurl ? (
                                                    <Image
                                                        src={
                                                            (
                                                                item.yvarprod as any
                                                            ).yvarprodmedia[0]
                                                                .ymedia
                                                                .ymediaurl
                                                        }
                                                        alt={
                                                            item.yvarprod
                                                                ?.yvarprodintitule ||
                                                            'Product'
                                                        }
                                                        width={48}
                                                        height={48}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-supreme text-sm font-medium text-[#053340]">
                                                    {item.yvarprod
                                                        ?.yvarprodintitule ||
                                                        'Unknown Product'}
                                                </p>
                                                <p className="font-supreme text-xs text-gray-600">
                                                    {t('orders.quantity')}:{' '}
                                                    {item.zcommandequantite}
                                                </p>
                                            </div>
                                            <div className="text-right">
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
                                    ))}
                                {orderGroup.items.length > 3 && (
                                    <p className="font-supreme text-center text-sm text-gray-600">
                                        +{orderGroup.items.length - 3}{' '}
                                        {t('orders.moreItems')}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-[#053340]" />
                                    <span className="font-recia text-lg font-semibold text-[#053340]">
                                        {t('orders.total')}: $
                                        {calculateOrderTotal(
                                            orderGroup.items
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => router.push('/my-orders')}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-[#053340] hover:border-[#053340] hover:bg-gray-50"
                                >
                                    {t('orders.viewDetails')}
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 text-center">
                        <Button
                            onClick={() => router.push('/my-orders')}
                            className="bg-[#053340] text-white shadow-lg transition-all hover:bg-[#053340]/90 hover:shadow-xl"
                        >
                            {t('orders.viewAllOrders')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ProfilePage() {
    const { data: currentUser, isLoading, refetch } = useAuth()
    const { t } = useLanguage()
    const router = useRouter()
    const queryClient = useQueryClient()

    // Component state
    const [activeTab, setActiveTab] = useState<
        'profile' | 'orders' | 'security'
    >('profile')
    const [isEditing, setIsEditing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [showAccountDeletion, setShowAccountDeletion] = useState(false)
    const [message, setMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push('/auth/login')
        }
    }, [currentUser, isLoading, router])

    // Clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [message])

    // Handle profile save
    const handleProfileSave = async (data: ProfileUpdateData) => {
        setIsUpdating(true)
        setMessage(null)

        try {
            const result = await profileService.updateProfile(data)

            if (result.success) {
                setMessage({ type: 'success', text: result.message })
                setIsEditing(false)

                // Refresh user data to show updated information
                await refetch()

                // Also invalidate the auth query to ensure fresh data
                queryClient.invalidateQueries({ queryKey: ['authUser'] })
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        } catch (error: any) {
            console.error('Profile update error:', error)
            setMessage({
                type: 'error',
                text: t('profile.unexpectedErrorOccurred'),
            })
        } finally {
            setIsUpdating(false)
        }
    }

    // Handle edit cancel
    const handleEditCancel = () => {
        setIsEditing(false)
        setMessage(null)
    }

    // Handle edit mode toggle
    const handleEditToggle = () => {
        setIsEditing(!isEditing)
        setShowPasswordChange(false)
        setMessage(null)
    }

    // Handle password change success
    const handlePasswordChangeSuccess = () => {
        setMessage({
            type: 'success',
            text: t('profile.passwordChangedSuccessfully'),
        })
        setShowPasswordChange(false)

        // Sign out user after successful password change
        setTimeout(() => {
            router.push('/auth/login')
        }, 2000)
    }

    // Handle password change error
    const handlePasswordChangeError = (error: string) => {
        setMessage({ type: 'error', text: error })
    }

    // Handle password change toggle
    const handlePasswordChangeToggle = () => {
        setShowPasswordChange(!showPasswordChange)
        setShowAccountDeletion(false)
        setIsEditing(false)
        setMessage(null)
    }

    // Handle account deletion toggle
    const handleAccountDeletionToggle = () => {
        setShowAccountDeletion(!showAccountDeletion)
        setShowPasswordChange(false)
        setIsEditing(false)
        setMessage(null)
    }

    // Handle account deletion
    const handleAccountDeletion = async (password: string) => {
        try {
            const result = await profileService.deleteAccount(password)

            if (result.success) {
                setMessage({ type: 'success', text: result.message })

                // Sign out and redirect to home page after successful deletion
                setTimeout(() => {
                    router.push('/')
                }, 2000)
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            console.error('Account deletion error:', error)
            throw new Error(error.message || t('profile.failedToDeleteAccount'))
        }
    }

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="space-y-4 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#053340]"></div>
                    <p className="font-supreme text-lg text-[#053340]">
                        {t('nav.loading')}
                    </p>
                </div>
            </div>
        )
    }

    // Don't render anything if not authenticated (will redirect)
    if (!currentUser) {
        return null
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="mb-4 space-y-3 text-center sm:mb-6 sm:space-y-4 md:mb-8">
                    <h1 className="font-recia text-xl leading-tight font-extrabold text-[#053340] sm:text-2xl md:text-3xl lg:text-4xl">
                        {t('profile.title')}
                    </h1>
                    <p className="font-supreme mx-auto max-w-2xl px-2 text-xs text-gray-600 sm:px-4 sm:text-sm md:text-base lg:text-lg">
                        {t('profile.subtitle')}
                    </p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div
                        className={`mb-6 rounded-lg border p-4 ${
                            message.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <svg
                                    className="h-5 w-5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-5 w-5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            )}
                            <span className="font-medium">{message.text}</span>
                            <button
                                onClick={() => setMessage(null)}
                                className="ml-auto text-current hover:opacity-70"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="mb-8">
                    {/* Mobile Tab Navigation - Dropdown Style */}
                    <div className="mb-4 md:hidden">
                        <select
                            value={activeTab}
                            onChange={(e) => {
                                const newTab = e.target.value as
                                    | 'profile'
                                    | 'orders'
                                    | 'security'
                                setActiveTab(newTab)
                                setIsEditing(false)
                                setShowPasswordChange(false)
                                setShowAccountDeletion(false)
                                setMessage(null)
                            }}
                            className="w-full border border-gray-300 bg-white p-4 text-lg font-semibold text-[#053340] focus:border-[#053340] focus:ring-[#053340]/20"
                        >
                            <option
                                value="profile"
                                className="bg-white text-[#053340]"
                            >
                                👤 {t('profile.profile')}
                            </option>
                            <option
                                value="orders"
                                className="bg-white text-[#053340]"
                            >
                                📦 {t('profile.orders')}
                            </option>
                            <option
                                value="security"
                                className="bg-white text-[#053340]"
                            >
                                🔒 {t('profile.security')}
                            </option>
                        </select>
                    </div>

                    {/* Desktop Tab Navigation - Button Style */}
                    <div className="hidden md:block">
                        <div className="flex flex-wrap justify-center gap-2 border border-gray-200 bg-gray-50 p-2">
                            <button
                                onClick={() => {
                                    setActiveTab('profile')
                                    setIsEditing(false)
                                    setShowPasswordChange(false)
                                    setShowAccountDeletion(false)
                                    setMessage(null)
                                }}
                                className={`px-4 py-3 text-sm font-semibold transition-all duration-300 lg:px-6 lg:text-base ${
                                    activeTab === 'profile'
                                        ? 'bg-[#053340] text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#053340]'
                                }`}
                            >
                                <svg
                                    className="mr-1 inline h-4 w-4 lg:mr-2 lg:h-5 lg:w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="hidden sm:inline">
                                    {t('profile.profile')}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('orders')
                                    setIsEditing(false)
                                    setShowPasswordChange(false)
                                    setShowAccountDeletion(false)
                                    setMessage(null)
                                }}
                                className={`px-4 py-3 text-sm font-semibold transition-all duration-300 lg:px-6 lg:text-base ${
                                    activeTab === 'orders'
                                        ? 'bg-[#053340] text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#053340]'
                                }`}
                            >
                                <svg
                                    className="mr-1 inline h-4 w-4 lg:mr-2 lg:h-5 lg:w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                <span className="hidden sm:inline">
                                    {t('profile.orders')}
                                </span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('security')
                                    setIsEditing(false)
                                    setShowPasswordChange(false)
                                    setShowAccountDeletion(false)
                                    setMessage(null)
                                }}
                                className={`px-4 py-3 text-sm font-semibold transition-all duration-300 lg:px-6 lg:text-base ${
                                    activeTab === 'security'
                                        ? 'bg-[#053340] text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#053340]'
                                }`}
                            >
                                <svg
                                    className="mr-1 inline h-4 w-4 lg:mr-2 lg:h-5 lg:w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span className="hidden sm:inline">
                                    {t('profile.security')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="border border-gray-200 bg-white p-4 shadow-lg sm:p-6 md:p-8">
                    {activeTab === 'profile' && (
                        <>
                            {!isEditing ? (
                                <>
                                    <ProfileInfoDisplay user={currentUser} />

                                    {/* Action Buttons */}
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                            <Button
                                                onClick={handleEditToggle}
                                                disabled={isUpdating}
                                                className="bg-[#053340] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                                {t('profile.editProfile')}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <ProfileInfoEdit
                                    user={currentUser}
                                    onSave={handleProfileSave}
                                    onCancel={handleEditCancel}
                                    isLoading={isUpdating}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'orders' && <OrdersTab />}

                    {activeTab === 'security' && (
                        <>
                            {!showPasswordChange && !showAccountDeletion ? (
                                <div className="space-y-8 text-center">
                                    <div className="space-y-4">
                                        <h2 className="font-recia text-2xl font-bold text-[#053340]">
                                            {t('profile.securitySettings')}
                                        </h2>
                                        <p className="font-supreme text-gray-600">
                                            {t('profile.manageAccountSecurity')}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Password Change Section */}
                                        <div className="space-y-4 border border-gray-200 bg-white p-6 shadow-lg">
                                            <div className="flex items-center justify-center gap-3 text-[#053340]">
                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                                                    />
                                                </svg>
                                                <span className="font-recia text-lg font-semibold">
                                                    {t(
                                                        'profile.passwordSecurity'
                                                    )}
                                                </span>
                                            </div>
                                            <p className="font-supreme text-sm text-gray-600">
                                                {t(
                                                    'profile.updatePasswordToKeepSecure'
                                                )}
                                            </p>
                                            <Button
                                                onClick={
                                                    handlePasswordChangeToggle
                                                }
                                                disabled={isUpdating}
                                                className="bg-[#053340] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                                                    />
                                                </svg>
                                                {t('profile.changePassword')}
                                            </Button>
                                        </div>

                                        {/* Account Deletion Section */}
                                        <div className="space-y-4 border border-red-200 bg-red-50 p-6">
                                            <div className="flex items-center justify-center gap-3 text-red-600">
                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-9 2a9 9 0 1118 0 9 9 0 01-18 0z"
                                                    />
                                                </svg>
                                                <span className="font-recia text-lg font-semibold">
                                                    {t(
                                                        'profile.accountDeletion'
                                                    )}
                                                </span>
                                            </div>
                                            <p className="font-supreme text-sm text-red-700">
                                                {t(
                                                    'profile.permanentlyDeleteAccount'
                                                )}
                                            </p>
                                            <Button
                                                onClick={
                                                    handleAccountDeletionToggle
                                                }
                                                disabled={isUpdating}
                                                className="bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                                {t('profile.deleteAccount')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : showPasswordChange ? (
                                <>
                                    <PasswordChangeForm
                                        onSuccess={handlePasswordChangeSuccess}
                                        onError={handlePasswordChangeError}
                                    />

                                    {/* Back Button */}
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={
                                                    handlePasswordChangeToggle
                                                }
                                                className="bg-[#053340] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                    />
                                                </svg>
                                                {t('profile.backToSecurity')}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : showAccountDeletion ? (
                                <>
                                    <AccountDeletionSection
                                        onDeleteAccount={handleAccountDeletion}
                                        isLoading={isUpdating}
                                    />

                                    {/* Back Button */}
                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={
                                                    handleAccountDeletionToggle
                                                }
                                                className="bg-[#053340] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                                    />
                                                </svg>
                                                {t('profile.backToSecurity')}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
