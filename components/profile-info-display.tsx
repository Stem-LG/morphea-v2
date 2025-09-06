'use client'

import { User } from '@supabase/supabase-js'
import { useLanguage } from '@/hooks/useLanguage'

interface ProfileInfoDisplayProps {
    user: User
}

export function ProfileInfoDisplay({ user }: ProfileInfoDisplayProps) {
    const { t } = useLanguage()

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return t('profile.notAvailable')
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="border-b border-gray-200 pb-6 text-center">
                <h2 className="font-recia mb-2 text-2xl font-bold text-[#053340]">
                    {t('profile.profileInformation')}
                </h2>
                <p className="font-supreme text-gray-600">
                    {t('profile.yourAccountDetails')}
                </p>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Email Address */}
                <div className="space-y-2">
                    <label className="font-supreme text-lg font-medium text-[#053340]">
                        {t('profile.emailAddress')}
                    </label>
                    <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 text-[#053340]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                />
                            </svg>
                            <span className="font-supreme text-lg">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* First Name */}
                {(() => {
                    // Check for new firstName field first, then fall back to parsing full_name
                    const firstName = user.user_metadata?.firstName || 
                        (user.user_metadata?.full_name ? user.user_metadata.full_name.trim().split(' ')[0] : null);
                    
                    return firstName ? (
                        <div className="space-y-2">
                            <label className="font-supreme text-lg font-medium text-[#053340]">
                                {t('profile.firstName')}
                            </label>
                            <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                                <div className="flex items-center gap-3">
                                    <svg
                                        className="h-5 w-5 text-[#053340]"
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
                                    <span className="font-supreme text-lg">
                                        {firstName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* Last Name */}
                {(() => {
                    // Check for new lastName field first, then fall back to parsing full_name
                    const lastName = user.user_metadata?.lastName || 
                        (user.user_metadata?.full_name ? user.user_metadata.full_name.trim().split(' ').slice(1).join(' ') : null);
                    
                    return lastName ? (
                        <div className="space-y-2">
                            <label className="font-supreme text-lg font-medium text-[#053340]">
                                {t('profile.lastName')}
                            </label>
                            <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                                <div className="flex items-center gap-3">
                                    <svg
                                        className="h-5 w-5 text-[#053340]"
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
                                    <span className="font-supreme text-lg">
                                        {lastName}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null;
                })()}

                {/* Account Created */}
                <div className="space-y-2">
                    <label className="font-supreme text-lg font-medium text-[#053340]">
                        {t('profile.accountCreated')}
                    </label>
                    <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 text-[#053340]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                                />
                            </svg>
                            <span className="font-supreme text-lg">
                                {formatDate(user.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Last Login */}
                <div className="space-y-2">
                    <label className="font-supreme text-lg font-medium text-[#053340]">
                        {t('profile.lastLogin')}
                    </label>
                    <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-5 w-5 text-[#053340]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="font-supreme text-lg">
                                {formatDate(user.last_sign_in_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional User Metadata (if available) */}
            {user.user_metadata &&
                Object.keys(user.user_metadata).length > 0 && (
                    <div className="space-y-2">
                        <label className="font-supreme text-lg font-medium text-[#053340]">
                            {t('profile.additionalInformation')}
                        </label>
                        <div className="border border-gray-200 bg-gray-50 p-4 text-[#053340]">
                            <div className="space-y-2">
                                {user.user_metadata.avatar_url && (
                                    <div className="flex items-center gap-3">
                                        <svg
                                            className="h-5 w-5 text-[#053340]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span>
                                            <span className="font-supreme text-gray-600">
                                                {t('profile.avatar')}:
                                            </span>{' '}
                                            {t('profile.available')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}
