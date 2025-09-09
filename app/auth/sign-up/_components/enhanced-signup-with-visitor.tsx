'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/useLanguage'
import { useWebsiteUrl } from '@/hooks/use-website-url'
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
}

interface EnhancedSignupWithVisitorProps
    extends React.ComponentPropsWithoutRef<'div'> {
    showVisitorForm?: boolean
}

export function EnhancedSignupWithVisitor({
    className,
    showVisitorForm = false,
    ...props
}: EnhancedSignupWithVisitorProps) {
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
    })

    const router = useRouter()
    const { t } = useLanguage()
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl()

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

    // Check if visitor form is properly filled when displayed
    const isVisitorFormValid =
        !showVisitorForm ||
        (visitorData.phone.trim() &&
            visitorData.address.trim() &&
            visitorData.selectedVisitorType.trim()) // Visitor type selected

    const isFormValid =
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        isPasswordValid &&
        passwordsMatch &&
        acceptedTerms &&
        isVisitorFormValid

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
                } else if (showVisitorForm) {
                    // Create new visitor record with form data
                    try {
                        const visitorCode = `V${Date.now().toString().slice(-8)}`

                        // Get the next available ID
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

                        await supabase
                            .schema('morpheus')
                            .from('yvisiteur')
                            .insert({
                                yvisiteurid: nextId,
                                yuseridfk: signUpData.user.id,
                                yvisiteurcode: visitorCode,
                                yvisiteurnom: `${firstName.trim()} ${lastName.trim()}`,
                                yvisiteuremail: email,
                                yvisiteurtelephone:
                                    visitorData.phone.trim() || null,
                                yvisiteuradresse:
                                    visitorData.address.trim() || null,
                                yvisiteurboolacheteurluxe: visitorData.selectedVisitorType === 'acheteurluxe' ? '1' : '0',
                                yvisiteurboolacheteurpro: visitorData.selectedVisitorType === 'acheteurpro' ? '1' : '0',
                                yvisiteurboolartisan: visitorData.selectedVisitorType === 'artisan' ? '1' : '0',
                                yvisiteurboolclientprive: visitorData.selectedVisitorType === 'clientprive' ? '1' : '0',
                                yvisiteurboolcollectionneur: visitorData.selectedVisitorType === 'collectionneur' ? '1' : '0',
                                yvisiteurboolcreateur: visitorData.selectedVisitorType === 'createur' ? '1' : '0',
                                yvisiteurboolculturel: visitorData.selectedVisitorType === 'culturel' ? '1' : '0',
                                yvisiteurboolgrandpublic: visitorData.selectedVisitorType === 'grandpublic' ? '1' : '0',
                                yvisiteurboolinfluenceur: visitorData.selectedVisitorType === 'influenceur' ? '1' : '0',
                                yvisiteurboolinvestisseur: visitorData.selectedVisitorType === 'investisseur' ? '1' : '0',
                                yvisiteurbooljournaliste: visitorData.selectedVisitorType === 'journaliste' ? '1' : '0',
                                yvisiteurboolpressespecialisee: visitorData.selectedVisitorType === 'pressespecialisee' ? '1' : '0',
                                yvisiteurboolvip: visitorData.selectedVisitorType === 'vip' ? '1' : '0',
                            })
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

            {/* Form Card */}
            <div className="transform overflow-hidden rounded-lg border border-slate-200 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleSignUp} className="h-full">
                    <div className="flex h-full max-h-[80vh] flex-col lg:flex-row">
                        {/* Left Side - Registration Form */}
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
                                                className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                    firstName.trim()
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
                                                className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                    lastName.trim()
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
                                            className={`h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                email.trim() &&
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
                                                            <AlertCircle className="h-5 w-5 text-amber-500" />
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
                                                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                                                    req.met
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
                                        type="submit"
                                        disabled={isLoading || !isFormValid}
                                        className="h-11 w-full transform rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>
                                                    {t('auth.creatingAccount')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <span>
                                                    {t('auth.createAccount')}
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

                        {/* Separator - Only visible on desktop */}
                        {showVisitorForm && (
                            <div className="hidden lg:block">
                                <Separator
                                    orientation="vertical"
                                    className="h-full bg-slate-300"
                                />
                            </div>
                        )}

                        {/* Mobile Separator */}
                        {showVisitorForm && (
                            <div className="px-8 lg:hidden">
                                <div className="my-6 flex items-center gap-4">
                                    <Separator className="flex-1 bg-slate-300" />
                                    <div className="flex items-center gap-2 font-medium text-[#063846]">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">
                                            Informations supplémentaires
                                        </span>
                                    </div>
                                    <Separator className="flex-1 bg-slate-300" />
                                </div>
                            </div>
                        )}

                        {/* Right Side - Visitor Form */}
                        {showVisitorForm && (
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-6">
                                    {/* Desktop Header */}
                                    <div className="hidden lg:block">
                                        <div className="mb-4 flex items-center gap-2 font-medium text-[#063846]">
                                            <Users className="h-5 w-5" />
                                            <span className="text-lg">
                                                Informations supplémentaires
                                            </span>
                                        </div>
                                        <p className="mb-6 text-sm text-slate-600">
                                            Aidez-nous à mieux vous connaître
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="phone"
                                                className="text-sm font-medium text-[#05141D]"
                                            >
                                                Téléphone
                                                {visitorData.phone.trim() && (
                                                    <span className="ml-1 text-green-500">
                                                        ✓
                                                    </span>
                                                )}
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={visitorData.phone}
                                                onChange={(e) =>
                                                    setVisitorData((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                className={`h-10 rounded-md border-slate-300 bg-white text-sm text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                    visitorData.phone.trim()
                                                        ? 'border-green-300 focus:border-green-500'
                                                        : ''
                                                }`}
                                                placeholder="Entrez votre numéro de téléphone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="address"
                                                className="text-sm font-medium text-[#05141D]"
                                            >
                                                Adresse
                                                {visitorData.address.trim() && (
                                                    <span className="ml-1 text-green-500">
                                                        ✓
                                                    </span>
                                                )}
                                            </Label>
                                            <Input
                                                id="address"
                                                type="text"
                                                value={visitorData.address}
                                                onChange={(e) =>
                                                    setVisitorData((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                className={`h-10 rounded-md border-slate-300 bg-white text-sm text-[#05141D] transition-colors placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846] ${
                                                    visitorData.address.trim()
                                                        ? 'border-green-300 focus:border-green-500'
                                                        : ''
                                                }`}
                                                placeholder="Entrez votre adresse"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-sm font-medium text-[#05141D]">
                                                    Votre profil
                                                </Label>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Sélectionnez votre profil principal
                                                </p>
                                            </div>

                                            {/* Search for visitor types */}
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Rechercher un type de profil..."
                                                    value={visitorTypeSearch}
                                                    onChange={(e) =>
                                                        setVisitorTypeSearch(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-9 rounded-md border-slate-300 bg-white pl-10 text-sm text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                                                />
                                            </div>

                                            {/* Selected type display */}
                                            {visitorData.selectedVisitorType && (
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-[#063846] text-[#063846]"
                                                    >
                                                        {filteredVisitorTypes.find(type => type.key === visitorData.selectedVisitorType)?.label || visitorData.selectedVisitorType} sélectionné
                                                    </Badge>
                                                </div>
                                            )}

                                            <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3">
                                                {filteredVisitorTypes.length ===
                                                0 ? (
                                                    <p className="py-4 text-center text-sm text-slate-500">
                                                        Aucun profil trouvé pour
                                                        "{visitorTypeSearch}"
                                                    </p>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {filteredVisitorTypes.map(
                                                            ({
                                                                key,
                                                                label,
                                                                category,
                                                            }) => (
                                                                <label
                                                                    key={key}
                                                                    className="group flex cursor-pointer items-center space-x-3 rounded p-2 transition-colors hover:bg-slate-100"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="visitorType"
                                                                        value={key}
                                                                        checked={visitorData.selectedVisitorType === key}
                                                                        onChange={(e) => handleVisitorTypeChange(e.target.value)}
                                                                        className="h-4 w-4 border-slate-300 bg-white text-[#063846] transition-colors focus:ring-1 focus:ring-[#063846]"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="block text-sm font-medium text-slate-700">
                                                                            {
                                                                                label
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-slate-500">
                                                                            {
                                                                                category
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <div className="h-2 w-2 rounded-full bg-[#063846]"></div>
                                                                    </div>
                                                                </label>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
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
