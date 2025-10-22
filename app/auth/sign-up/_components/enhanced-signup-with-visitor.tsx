'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PhoneInput } from '@/components/ui/phone-input'
import { useLanguage } from '@/hooks/useLanguage'
import { useWebsiteUrl } from '@/hooks/use-website-url'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    Search,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react'

type PasswordRequirement = {
    label: string
    met: boolean
}

type VisitorFormData = {
    phone: string
    address: string
    selectedVisitorType: string
    profileQuestion: string
    sourceQuestion: string
    interestQuestion: string
    specialtyQuestion: string
    expectationQuestion: string
}

interface EnhancedSignupWithVisitorProps
    extends React.ComponentPropsWithoutRef<'div'> {
    showVisitorForm?: boolean
}


// Custom Alert Circle Icon with Gold Gradient
const AlertCircleGradient = ({ className }: { className?: string }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient
                id="alert-circle-gradient"
                x1="0"
                y1="0"
                x2="24"
                y2="24"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#B27C64" />
                <stop offset="50%" stopColor="#E8D07A" />
                <stop offset="100%" stopColor="#B27C64" />
            </linearGradient>
        </defs>
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="url(#alert-circle-gradient)"
            strokeWidth="2"
        />
        <line
            x1="12"
            y1="8"
            x2="12"
            y2="12"
            stroke="url(#alert-circle-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle
            cx="12"
            cy="16"
            r="1"
            fill="url(#alert-circle-gradient)"
        />
    </svg>
)

export function EnhancedSignupWithVisitor({
    className,
    showVisitorForm = false,
    ...props
}: EnhancedSignupWithVisitorProps) {
    // Steps: 1=Basic, 2=Phone, 3=Profile, 4=Source, 5=Interest, 6=Specialty, 7=Expectation
    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = showVisitorForm && true ? 7 : 1
    
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showRepeatPassword, setShowRepeatPassword] = useState(false)
    const [visitorTypeSearch, setVisitorTypeSearch] = useState('')

    // Visitor form data
    const [visitorData, setVisitorData] = useState<VisitorFormData>({
        phone: '',
        address: '',
        selectedVisitorType: '',
        profileQuestion: '',
        sourceQuestion: '',
        interestQuestion: '',
        specialtyQuestion: '',
        expectationQuestion: '',
    })

    const router = useRouter()
    const { t } = useLanguage()
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl()
    const { hasConsent } = useCookieConsent()

    // Local visitor data state
    const [existingVisitorData, setExistingVisitorData] = useState<any>(null)
    const [isLoadingVisitor, setIsLoadingVisitor] = useState(false)

    // Fetch existing visitor data safely
    useEffect(() => {
        const fetchVisitorData = async () => {
            try {
                setIsLoadingVisitor(true)
                const supabase = createClient()

                // Get current user safely
                const { data: currentUserData, error: userError } =
                    await supabase.auth.getUser()

                // If there's an auth error, just continue without prefilling
                if (userError || !currentUserData?.user) {
                    setIsLoadingVisitor(false)
                    return
                }

                // Try to fetch visitor data
                const { data, error } = await supabase
                    .schema('morpheus')
                    .from('yvisiteur')
                    .select(
                        'yvisiteurid, yvisiteurnom, yvisiteuremail, yvisiteurtelephone, yvisiteuradresse'
                    )
                    .eq('yuseridfk', currentUserData.user.id)
                    .order('yvisiteurid', { ascending: false })
                    .limit(1)

                if (!error && data && data.length > 0) {
                    setExistingVisitorData(data[0])
                }
            } catch (error) {
                // Silently handle errors - just don't prefill
                console.log('Could not fetch visitor data:', error)
            } finally {
                setIsLoadingVisitor(false)
            }
        }

        fetchVisitorData()
    }, [])

    // Prefill form with visitor data when available
    useEffect(() => {
        if (existingVisitorData && !isLoadingVisitor) {
            if (existingVisitorData.yvisiteurnom && !firstName && !lastName) {
                const nameParts = existingVisitorData.yvisiteurnom
                    .trim()
                    .split(' ')
                if (nameParts.length >= 2) {
                    setFirstName(nameParts[0])
                    setLastName(nameParts.slice(1).join(' '))
                } else {
                    setFirstName(existingVisitorData.yvisiteurnom)
                }
            }
            if (existingVisitorData.yvisiteuremail && !email) {
                setEmail(existingVisitorData.yvisiteuremail)
            }
        }
    }, [existingVisitorData, isLoadingVisitor, firstName, lastName, email])

    // Password validation
    const passwordRequirements = useMemo((): PasswordRequirement[] => {
        return [
            {
                label: t('auth.passwordMinLength'),
                met: password.length >= 8,
            },
            {
                label: t('auth.passwordUppercase'),
                met: /[A-Z]/.test(password),
            },
            {
                label: t('auth.passwordNumber'),
                met: /\d/.test(password),
            },
            {
                label: t('auth.passwordSpecialChar'),
                met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            },
        ]
    }, [password, t])

    const isPasswordValid = passwordRequirements.every((req) => req.met)
    const passwordsMatch =
        password === repeatPassword && repeatPassword.length > 0

    // Email validation
    const isEmailValid = email.trim() && email.includes('@') && email.includes('.')

    // Step 1 validation
    const isStep1Valid =
        firstName.trim() &&
        lastName.trim() &&
        isEmailValid &&
        isPasswordValid &&
        passwordsMatch &&
        acceptedTerms

    // Check if visitor form is properly filled when displayed
    const isVisitorFormValid =
        !showVisitorForm ||
        !hasConsent ||
        (visitorData.phone.trim() &&
            visitorData.profileQuestion.trim() &&
            visitorData.sourceQuestion.trim() &&
            visitorData.interestQuestion.trim() &&
            visitorData.specialtyQuestion.trim() &&
            visitorData.expectationQuestion.trim())

    const isFormValid = isStep1Valid && isVisitorFormValid

    // Step-specific validators
    const isStep2Valid = visitorData.phone.trim()
    const isStep3Valid = visitorData.profileQuestion.trim()
    const isStep4Valid = visitorData.sourceQuestion.trim()
    const isStep5Valid = visitorData.interestQuestion.trim()
    const isStep6Valid = visitorData.specialtyQuestion.trim()
    const isStep7Valid = visitorData.expectationQuestion.trim()

    // Filter visitor types based on search
    const filteredVisitorTypes = useMemo(() => {
        const visitorTypeOptions = [
            { key: 'grandpublic', label: 'Grand Public', category: 'General' },
            { key: 'clientprive', label: 'Client Privé', category: 'General' },
            {
                key: 'acheteurluxe',
                label: 'Acheteur de Luxe',
                category: 'Acheteur',
            },
            {
                key: 'acheteurpro',
                label: 'Acheteur Professionnel',
                category: 'Acheteur',
            },
            { key: 'artisan', label: 'Artisan', category: 'Créatif' },
            {
                key: 'createur',
                label: 'Créateur/Designer',
                category: 'Créatif',
            },
            {
                key: 'collectionneur',
                label: 'Collectionneur',
                category: 'Spécialisé',
            },
            { key: 'investisseur', label: 'Investisseur', category: 'Finance' },
            { key: 'influenceur', label: 'Influenceur', category: 'Média' },
            { key: 'journaliste', label: 'Journaliste', category: 'Média' },
            {
                key: 'pressespecialisee',
                label: 'Presse Spécialisée',
                category: 'Média',
            },
            {
                key: 'culturel',
                label: 'Professionnel Culturel',
                category: 'Culture',
            },
            { key: 'vip', label: 'VIP', category: 'Spécialisé' },
        ]

        if (!visitorTypeSearch.trim()) return visitorTypeOptions

        return visitorTypeOptions.filter(
            (option) =>
                option.label
                    .toLowerCase()
                    .includes(visitorTypeSearch.toLowerCase()) ||
                option.category
                    .toLowerCase()
                    .includes(visitorTypeSearch.toLowerCase())
        )
    }, [visitorTypeSearch])

    const handleVisitorTypeChange = (type: string) => {
        setVisitorData((prev) => ({
            ...prev,
            selectedVisitorType: type,
        }))
    }

    const handleNextStep = () => {
        setError(null)
        if (currentStep === 1 && isStep1Valid) {
            if (!showVisitorForm || !hasConsent) {
                handleSignUp(new Event('submit') as any)
            } else {
                setCurrentStep(2)
            }
        } else if (currentStep === 2 && isStep2Valid) {
            setCurrentStep(3)
        } else if (currentStep === 3 && isStep3Valid) {
            setCurrentStep(4)
        } else if (currentStep === 4 && isStep4Valid) {
            setCurrentStep(5)
        } else if (currentStep === 5 && isStep5Valid) {
            setCurrentStep(6)
        } else if (currentStep === 6 && isStep6Valid) {
            setCurrentStep(7)
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setError(null)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        if (!firstName.trim()) {
            setError(t('auth.firstNameRequired'))
            setIsLoading(false)
            return
        }

        if (!lastName.trim()) {
            setError(t('auth.lastNameRequired'))
            setIsLoading(false)
            return
        }

        if (!email.trim()) {
            setError(t('auth.emailIsRequired'))
            setIsLoading(false)
            return
        }

        if (!isPasswordValid) {
            setError(t('auth.passwordRequirementsNotMet'))
            setIsLoading(false)
            return
        }

        if (password !== repeatPassword) {
            setError(t('auth.passwordsDoNotMatch'))
            setIsLoading(false)
            return
        }

        if (!acceptedTerms) {
            setError(t('auth.termsAndConditionsRequired'))
            setIsLoading(false)
            return
        }

        try {
            // Get current user (should be anonymous)
            const { data: currentUserData } = await supabase.auth.getUser()
            const currentUser = currentUserData?.user

            // Sign up with email and password
            const redirectUrl =
                websiteUrl && !isLoadingWebsiteUrl
                    ? `${websiteUrl}/main`
                    : `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/main`

            const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: redirectUrl,
                        data: {
                            full_name: `${firstName.trim()} ${lastName.trim()}`,
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                        },
                    },
                })

            if (signUpError) throw signUpError

            // Handle visitor data creation or update
            if (signUpData.user) {
                if (existingVisitorData && currentUser) {
                    // Update existing visitor record
                    try {
                        await supabase
                            .schema('morpheus')
                            .from('yvisiteur')
                            .update({
                                yuseridfk: signUpData.user.id,
                                yvisiteurnom: `${firstName.trim()} ${lastName.trim()}`,
                                yvisiteuremail: email,
                            })
                            .eq('yvisiteurid', existingVisitorData.yvisiteurid)
                    } catch (updateError) {
                        console.error(
                            'Error updating visitor record:',
                            updateError
                        )
                    }
                } else if (showVisitorForm && hasConsent) {
                    // Create new visitor record with form data
                    try {
                        const visitorCode = `V${Date.now().toString().slice(-8)}`

                        const { data: existingVisitors } = await supabase
                            .schema('morpheus')
                            .from('yvisiteur')
                            .select('yvisiteurid')
                            .order('yvisiteurid', { ascending: false })
                            .limit(1)

                        const nextId =
                            existingVisitors && existingVisitors.length > 0
                                ? existingVisitors[0].yvisiteurid + 1
                                : 1

                        const visitorRecord = {
                            yvisiteurid: nextId,
                            yuseridfk: signUpData.user.id,
                            yvisiteurcode: visitorCode,
                            yvisiteurnom: `${firstName.trim()} ${lastName.trim()}`,
                            yvisiteuremail: email,
                            yvisiteurtelephone:
                                visitorData.phone.trim() || null,
                            profile_question: visitorData.profileQuestion.trim() || null,
                            source_question: visitorData.sourceQuestion.trim() || null,
                            interest_question: visitorData.interestQuestion.trim() || null,
                            specialty_question: visitorData.specialtyQuestion.trim() || null,
                            expectation_question: visitorData.expectationQuestion.trim() || null,
                        }

                        await supabase
                            .schema('morpheus')
                            .from('yvisiteur')
                            .insert(visitorRecord as any)
                    } catch (insertError) {
                        console.error(
                            'Error creating visitor record:',
                            insertError
                        )
                    }
                }
            }

            router.push('/auth/sign-up-success')
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : t('auth.errorOccurred')
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={cn(
                'mx-auto flex w-full max-w-5xl flex-col gap-8',
                className
            )}
            {...props}
        >
            {/* Welcome header */}
            <div className="mb-8 text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#05141D] to-[#063846]">
                    <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                </div>
                <h1 className="font-recia mb-4 text-4xl leading-tight font-extrabold text-[#05141D] md:text-5xl">
                    {t('auth.joinTheFuture')}
                </h1>
                <p className="font-supreme mx-auto max-w-md text-lg text-[#063846]">
                    {t('auth.signUpSubtitle')}
                </p>
            </div>

            {/* Progress Bar */}
            {showVisitorForm && hasConsent && (
                <div className="mx-auto w-full max-w-2xl px-4">
                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">
                                Étape {currentStep} sur {totalSteps}
                            </span>
                            <span className="text-slate-500">
                                {Math.round((currentStep / totalSteps) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-gradient-to-r from-[#05141D] to-[#063846] transition-all duration-500 ease-out"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="transform overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleSignUp} className="h-full">
                    {/* Step 1: Basic Registration */}
                    {currentStep === 1 && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                {isLoadingVisitor ? (
                                    // Skeleton loading state
                                    <div className="animate-pulse space-y-6">
                                        <div className="space-y-2">
                                            <div className="h-4 w-16 rounded bg-slate-300"></div>
                                            <div className="h-11 w-full rounded-md bg-slate-300"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-12 rounded bg-slate-300"></div>
                                            <div className="h-11 w-full rounded-md bg-slate-300"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-20 rounded bg-slate-300"></div>
                                            <div className="h-11 w-full rounded-md bg-slate-300"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-24 rounded bg-slate-300"></div>
                                            <div className="h-11 w-full rounded-md bg-slate-300"></div>
                                        </div>
                                        <div className="h-11 w-full rounded-md bg-slate-300"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-xs text-red-500">*{t('auth.allFieldsRequiredNote')}</div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="firstName"
                                                    className="text-sm font-medium text-[#05141D]"
                                                >
                                                    {t('auth.firstName')}
                                                    {firstName.trim() && (
                                                        <span className="ml-1 text-green-500">
                                                            ✓
                                                        </span>
                                                    )}
                                                </Label>
                                                <Input
                                                    id="firstName"
                                                    type="text"
                                                    placeholder={t(
                                                        'auth.firstNamePlaceholder'
                                                    )}
                                                    required
                                                    value={firstName}
                                                    onChange={(e) =>
                                                        setFirstName(e.target.value)
                                                    }
                                                    className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${firstName.trim()
                                                        ? 'border-green-300 focus:border-green-500'
                                                        : ''
                                                        }`}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="lastName"
                                                    className="text-sm font-medium text-[#05141D]"
                                                >
                                                    {t('auth.lastName')}
                                                    {lastName.trim() && (
                                                        <span className="ml-1 text-green-500">
                                                            ✓
                                                        </span>
                                                    )}
                                                </Label>
                                                <Input
                                                    id="lastName"
                                                    type="text"
                                                    placeholder={t(
                                                        'auth.lastNamePlaceholder'
                                                    )}
                                                    required
                                                    value={lastName}
                                                    onChange={(e) =>
                                                        setLastName(e.target.value)
                                                    }
                                                    className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${lastName.trim()
                                                        ? 'border-green-300 focus:border-green-500'
                                                        : ''
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm font-medium text-[#05141D]"
                                            >
                                                {t('auth.email')}
                                                {email.trim() &&
                                                    email.includes('@') && (
                                                        <span className="ml-1 text-green-500">
                                                            ✓
                                                        </span>
                                                    )}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder={t(
                                                    'auth.emailPlaceholder'
                                                )}
                                                required
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${email.trim() &&
                                                    email.includes('@')
                                                    ? 'border-green-300 focus:border-green-500'
                                                    : ''
                                                    }`}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm font-medium text-[#05141D]"
                                            >
                                                {t('auth.password')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder={t(
                                                        'auth.createPasswordPlaceholder'
                                                    )}
                                                    required
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(e.target.value)
                                                    }
                                                    className="h-11 rounded-md border-slate-300 bg-white pr-20 text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                                                />

                                                <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                        className="text-slate-400 transition-colors hover:text-slate-600"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {/* Password validation icon */}
                                                    {password.length > 0 && (
                                                        <div className="group relative">
                                                            {isPasswordValid ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <AlertCircleGradient className="h-5 w-5 text-amber-500" />
                                                            )}

                                                            {/* Enhanced tooltip */}
                                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 max-w-xs rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                                <div className="mb-2 text-xs font-medium">
                                                                    {t(
                                                                        'auth.passwordRequirements'
                                                                    )}
                                                                    :
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {passwordRequirements.map(
                                                                        (
                                                                            requirement,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex items-center gap-2 text-xs"
                                                                            >
                                                                                <span
                                                                                    className={`h-2 w-2 rounded-full ${requirement.met ? 'bg-green-500' : 'bg-slate-500'}`}
                                                                                ></span>
                                                                                <span
                                                                                    className={
                                                                                        requirement.met
                                                                                            ? 'text-green-300'
                                                                                            : 'text-slate-300'
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        requirement.label
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bars for password strength */}
                                            {password.length > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex gap-1">
                                                        {passwordRequirements.map(
                                                            (req, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${req.met
                                                                        ? 'bg-green-500'
                                                                        : 'bg-slate-200'
                                                                        }`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Sécurité:{' '}
                                                        {
                                                            passwordRequirements.filter(
                                                                (r) => r.met
                                                            ).length
                                                        }
                                                        /
                                                        {
                                                            passwordRequirements.length
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="repeat-password"
                                                className="text-sm font-medium text-[#05141D]"
                                            >
                                                {t('auth.confirmPassword')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="repeat-password"
                                                    type={
                                                        showRepeatPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    placeholder={t(
                                                        'auth.repeatPasswordPlaceholder'
                                                    )}
                                                    required
                                                    value={repeatPassword}
                                                    onChange={(e) =>
                                                        setRepeatPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-11 rounded-md border-slate-300 bg-white pr-20 text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                                                />

                                                <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowRepeatPassword(
                                                                !showRepeatPassword
                                                            )
                                                        }
                                                        className="text-slate-400 transition-colors hover:text-slate-600"
                                                    >
                                                        {showRepeatPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>

                                                    {/* Password confirmation icon */}
                                                    {repeatPassword.length > 0 && (
                                                        <div className="group relative">
                                                            {passwordsMatch ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-500" />
                                                            )}
                                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                                {passwordsMatch
                                                                    ? t(
                                                                        'auth.passwordsMatch'
                                                                    )
                                                                    : t(
                                                                        'auth.passwordsDoNotMatchTooltip'
                                                                    )}
                                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Terms and Conditions Checkbox */}
                                        <div className="space-y-2">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-row items-center gap-3">
                                                    <Checkbox
                                                        id="terms"
                                                        checked={acceptedTerms}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            setAcceptedTerms(
                                                                !!checked
                                                            )
                                                        }
                                                        className="mt-1 border-slate-300 focus-visible:ring-[#063846]/50 data-[state=checked]:border-[#063846] data-[state=checked]:bg-[#063846]"
                                                    />
                                                    <Label
                                                        htmlFor="terms"
                                                        className="flex cursor-pointer text-sm leading-relaxed text-slate-600"
                                                    >
                                                        {t(
                                                            'auth.agreeToTerms'
                                                        )}{' '}
                                                    </Label>
                                                    <Link
                                                        href="/terms-and-conditions"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm -ml-1 font-semibold text-[#063846] underline underline-offset-2 transition-colors hover:text-[#05141D]"
                                                    >
                                                        {t(
                                                            'auth.termsAndConditions'
                                                        )}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                                {error}
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            disabled={isLoading || !isStep1Valid}
                                            className="h-11 w-full transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>
                                                        {showVisitorForm && hasConsent
                                                            ? 'Continuer'
                                                            : t('auth.createAccount')}
                                                    </span>
                                                    <svg
                                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </Button>

                                        <div className="text-center">
                                            <p className="text-slate-600">
                                                {t('auth.alreadyHaveAccount')}{' '}
                                                <Link
                                                    href="/auth/login"
                                                    className="font-semibold text-[#063846] underline underline-offset-2 transition-colors hover:text-[#05141D]"
                                                >
                                                    {t('auth.signIn')}
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Phone Input */}
                    {currentStep === 2 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            Quel est votre numéro de téléphone ?
                                        </Label>
                                        <p className="mb-4 text-sm text-slate-600">
                                            Pour mieux vous contacter
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <PhoneInput
                                            id="phone"
                                            defaultCountry="FR"
                                            value={visitorData.phone}
                                            onChange={(value) =>
                                                setVisitorData((prev) => ({
                                                    ...prev,
                                                    phone: value || '',
                                                }))
                                            }
                                            className={`h-12 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                visitorData.phone.trim()
                                                    ? 'border-green-300 focus:border-green-500'
                                                    : ''
                                            }`}
                                            placeholder="Entrez votre numéro de téléphone"
                                        />
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading || !isStep2Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Profile Question */}
                    {currentStep === 3 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            1. Vous êtes ?
                                        </Label>
                                        <p className="text-sm text-slate-600">
                                            Identifier le profil professionnel ou personnel
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { value: 'student', label: 'Étudiant' },
                                            { value: 'pro', label: 'Professionnel du secteur mode / design' },
                                            { value: 'designer', label: 'Designer de mode' },
                                            { value: 'artist', label: 'Artiste / Artisan' },
                                            { value: 'project_lead', label: 'Porteur de projet' },
                                            { value: 'curious', label: 'Curieux / Passionné d\'art et de design' },
                                            { value: 'representative', label: 'Représentant d\'institution ou de marque' },
                                            { value: 'other', label: 'Autre' },
                                        ].map(({ value, label }) => (
                                            <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                <input
                                                    type="radio"
                                                    name="profileQuestion"
                                                    value={value}
                                                    checked={visitorData.profileQuestion === value}
                                                    onChange={(e) => setVisitorData((prev) => ({ ...prev, profileQuestion: e.target.value }))}
                                                    className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                />
                                                <span className="text-base font-medium text-slate-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading || !isStep3Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Source Question */}
                    {currentStep === 4 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            2. Comment avez-vous entendu parler de Morphea ?
                                        </Label>
                                        <p className="text-sm text-slate-600">
                                            Mesurer les canaux de communication efficaces
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { value: 'linkedin', label: 'LinkedIn' },
                                            { value: 'facebook', label: 'Facebook' },
                                            { value: 'instagram', label: 'Instagram' },
                                            { value: 'word', label: 'Bouche à oreille' },
                                            { value: 'news', label: 'Presse spécialisée' },
                                            { value: 'event', label: 'Événement / salon' },
                                            { value: 'other', label: 'Autre' },
                                        ].map(({ value, label }) => (
                                            <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                <input
                                                    type="radio"
                                                    name="sourceQuestion"
                                                    value={value}
                                                    checked={visitorData.sourceQuestion === value}
                                                    onChange={(e) => setVisitorData((prev) => ({ ...prev, sourceQuestion: e.target.value }))}
                                                    className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                />
                                                <span className="text-base font-medium text-slate-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading || !isStep4Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Interest Question */}
                    {currentStep === 5 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            3. Quel est votre principal intérêt sur Morphea ?
                                        </Label>
                                        <p className="text-sm text-slate-600">
                                            Cerner les attentes utilisateur
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { value: 'discover', label: 'Découvrir des créateurs et leurs créations' },
                                            { value: 'sell', label: 'Vendre mes créations' },
                                            { value: 'buy', label: 'Acheter des pièces uniques' },
                                            { value: 'participate', label: 'Participer à des événements immersifs' },
                                            { value: 'inspiration', label: 'M\'inspirer pour un projet personnel ou professionnel' },
                                            { value: 'explore', label: 'Explorer un nouveau type d\'expérience digitale' },
                                            { value: 'other', label: 'Autre' },
                                        ].map(({ value, label }) => (
                                            <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                <input
                                                    type="radio"
                                                    name="interestQuestion"
                                                    value={value}
                                                    checked={visitorData.interestQuestion === value}
                                                    onChange={(e) => setVisitorData((prev) => ({ ...prev, interestQuestion: e.target.value }))}
                                                    className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                />
                                                <span className="text-base font-medium text-slate-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading || !isStep5Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Specialty Question */}
                    {currentStep === 6 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            4. Dans quel domaine évoluez-vous ?
                                        </Label>
                                        <p className="text-sm text-slate-600">
                                            Affiner le profil professionnel / secteur
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { value: 'fashion', label: 'Mode' },
                                            { value: 'design', label: 'Design d\'objet' },
                                            { value: 'artist', label: 'Artisanat / Métiers d\'art' },
                                            { value: 'visual_art', label: 'Arts visuels' },
                                            { value: 'marketing', label: 'Communication / Marketing' },
                                            { value: 'teaching', label: 'Enseignement / Formation' },
                                            { value: 'development', label: 'Développement technologique / 3D / VR' },
                                            { value: 'other', label: 'Autre' },
                                        ].map(({ value, label }) => (
                                            <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                <input
                                                    type="radio"
                                                    name="specialtyQuestion"
                                                    value={value}
                                                    checked={visitorData.specialtyQuestion === value}
                                                    onChange={(e) => setVisitorData((prev) => ({ ...prev, specialtyQuestion: e.target.value }))}
                                                    className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                />
                                                <span className="text-base font-medium text-slate-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={isLoading || !isStep6Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Continuer
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Expectation Question */}
                    {currentStep === 7 && showVisitorForm && hasConsent && (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-2 block text-lg font-semibold text-[#05141D]">
                                            5. Quel type d'expérience recherchez-vous sur Morphea ?
                                        </Label>
                                        <p className="text-sm text-slate-600">
                                            Adapter l'offre de contenu et les recommandations
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {[
                                            { value: 'art', label: 'Une expérience artistique et immersive' },
                                            { value: 'display', label: 'Une vitrine pour mes créations' },
                                            { value: 'networking', label: 'Un espace de networking créatif' },
                                            { value: 'buy_sell', label: 'Une plateforme pour vendre ou acheter des œuvres' },
                                            { value: 'inspiration', label: 'Une source d\'inspiration culturelle' },
                                            { value: 'opportunity', label: 'Une opportunité de collaboration ou de visibilité' },
                                            { value: 'other', label: 'Autre' },
                                        ].map(({ value, label }) => (
                                            <label key={value} className="group flex cursor-pointer items-center space-x-3 rounded-lg border border-slate-200 p-4 transition-all hover:border-[#063846] hover:bg-slate-50">
                                                <input
                                                    type="radio"
                                                    name="expectationQuestion"
                                                    value={value}
                                                    checked={visitorData.expectationQuestion === value}
                                                    onChange={(e) => setVisitorData((prev) => ({ ...prev, expectationQuestion: e.target.value }))}
                                                    className="h-5 w-5 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-2 focus:ring-[#063846]"
                                                />
                                                <span className="text-base font-medium text-slate-700">{label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 bg-slate-50 px-8 py-4">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="h-11 flex-1 rounded-md border-slate-300 text-base font-semibold text-slate-700 transition-all hover:bg-slate-100"
                                    >
                                        <svg
                                            className="mr-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        Retour
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !isStep7Valid}
                                        className="h-11 flex-1 transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Création en cours...
                                            </>
                                        ) : (
                                            <>
                                                Créer mon compte
                                                <CheckCircle className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Back to home */}
            <div className="text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-[#05141D]"
                >
                    {t('auth.backToMorpheusMall')}
                </Link>
            </div>
        </div>
    )
}
