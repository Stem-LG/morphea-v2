'use client'

import { User } from '@supabase/supabase-js'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'

interface ProfileInfoEditProps {
    user: User
    onSave: (data: ProfileUpdateData) => Promise<void>
    onCancel: () => void
    isLoading: boolean
}

interface ProfileUpdateData {
    name?: string // For backend compatibility
    firstName?: string
    lastName?: string
    email?: string
}

interface ValidationErrors {
    firstName?: string
    lastName?: string
    email?: string
}

export function ProfileInfoEdit({
    user,
    onSave,
    onCancel,
    isLoading,
}: ProfileInfoEditProps) {
    const { t } = useLanguage()

    // Form state
    const [formData, setFormData] = useState<ProfileUpdateData>(() => {
        const fullName = user.user_metadata?.full_name || ''
        const nameParts = fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        return {
            firstName,
            lastName,
            email: user.email || '',
        }
    })

    // Validation state
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when user changes
    useEffect(() => {
        const fullName = user.user_metadata?.full_name || ''
        const nameParts = fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        setFormData({
            firstName,
            lastName,
            email: user.email || '',
        })
        setErrors({})
    }, [user])

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {}

        // First name validation - required field
        if (!formData.firstName?.trim()) {
            newErrors.firstName = t('auth.firstNameRequired')
        }

        // Last name validation - optional but warn if empty
        // No validation for lastName as it can be optional

        // Email validation - required and format
        if (!formData.email?.trim()) {
            newErrors.email = t('profile.emailIsRequired')
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = t('profile.pleaseEnterValidEmail')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle input changes
    const handleInputChange = (
        field: keyof ProfileUpdateData,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }))
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Combine firstName and lastName into name for backend
            const combinedName = `${formData.firstName?.trim() || ''} ${formData.lastName?.trim() || ''}`.trim()
            
            await onSave({
                name: combinedName,
                email: formData.email
            })
        } catch (error) {
            console.error('Error saving profile:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle cancel
    const handleCancel = () => {
        // Reset form to original values
        const fullName = user.user_metadata?.full_name || ''
        const nameParts = fullName.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        
        setFormData({
            firstName,
            lastName,
            email: user.email || '',
        })
        setErrors({})
        onCancel()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6 text-center">
                <h2 className="font-recia mb-2 text-2xl font-bold text-[#053340]">
                    {t('profile.editProfileInformation')}
                </h2>
                <p className="font-supreme text-gray-600">
                    {t('profile.updateAccountDetails')}
                </p>
            </div>

            {/* Edit Form */}
            <div className="border border-gray-200 bg-white p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="firstName"
                            className="font-supreme text-lg font-medium text-[#053340]"
                        >
                            {t('profile.firstName')}
                        </Label>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder={t('auth.firstNamePlaceholder')}
                            required
                            value={formData.firstName || ''}
                            onChange={(e) =>
                                handleInputChange('firstName', e.target.value)
                            }
                            className="h-12 border-gray-300 bg-white text-lg text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]/20"
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.firstName && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-red-600">
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
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {errors.firstName}
                            </div>
                        )}
                    </div>

                    {/* Last Name Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="lastName"
                            className="font-supreme text-lg font-medium text-[#053340]"
                        >
                            {t('profile.lastName')}
                        </Label>
                        <Input
                            id="lastName"
                            type="text"
                            placeholder={t('auth.lastNamePlaceholder')}
                            value={formData.lastName || ''}
                            onChange={(e) =>
                                handleInputChange('lastName', e.target.value)
                            }
                            className="h-12 border-gray-300 bg-white text-lg text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]/20"
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.lastName && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-red-600">
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
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {errors.lastName}
                            </div>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="font-supreme text-lg font-medium text-[#053340]"
                        >
                            {t('profile.emailAddress')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('profile.enterYourEmailAddress')}
                            required
                            value={formData.email || ''}
                            onChange={(e) =>
                                handleInputChange('email', e.target.value)
                            }
                            className="h-12 border-gray-300 bg-white text-lg text-[#053340] placeholder:text-gray-400 focus:border-[#053340] focus:ring-[#053340]/20"
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.email && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-red-600">
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
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {errors.email}
                            </div>
                        )}
                        {formData.email !== user.email && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-blue-600">
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
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {t('profile.changingEmailRequiresConfirmation')}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="h-12 flex-1 bg-[#053340] text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#053340]/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting || isLoading ? (
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/loading.gif"
                                        alt="Loading"
                                        className="h-5 w-5"
                                    />
                                    {t('profile.savingChanges')}
                                </div>
                            ) : (
                                t('profile.saveChanges')
                            )}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting || isLoading}
                            className="h-12 flex-1 bg-gray-500 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-gray-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {t('profile.cancel')}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Information Note */}
            <div className="border border-gray-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#053340]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div className="text-sm text-[#053340]">
                        <p className="font-supreme mb-1 font-medium">
                            {t('profile.importantNotes')}
                        </p>
                        <ul className="font-supreme space-y-1 text-xs">
                            <li>
                                • {t('profile.emailChangeRequiresVerification')}
                            </li>
                            <li>• {t('profile.confirmationEmailSent')}</li>
                            <li>• {t('profile.nameUpdatedImmediately')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
