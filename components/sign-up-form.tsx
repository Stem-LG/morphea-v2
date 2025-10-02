'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/hooks/useLanguage'
import { useVisitorData } from '@/hooks/useVisitorData'
import { useWebsiteUrl } from '@/hooks/use-website-url'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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

type PasswordRequirement = {
    label: string
    met: boolean
}

export function SignUpForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<'div'>) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { t } = useLanguage()
    const { visitorData, isLoading: isLoadingVisitor } = useVisitorData()
    const { data: websiteUrl, isLoading: isLoadingWebsiteUrl } = useWebsiteUrl()

    // Prefill form with visitor data when available
    useEffect(() => {
        if (visitorData && !isLoadingVisitor) {
            if (visitorData.yvisiteurnom && !firstName && !lastName) {
                const nameParts = visitorData.yvisiteurnom.trim().split(' ')
                if (nameParts.length >= 2) {
                    setFirstName(nameParts[0])
                    setLastName(nameParts.slice(1).join(' '))
                } else {
                    setFirstName(visitorData.yvisiteurnom)
                }
            }
            if (visitorData.yvisiteuremail && !email) {
                setEmail(visitorData.yvisiteuremail)
            }
        }
    }, [visitorData, isLoadingVisitor, firstName, lastName, email])

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
    const isFormValid =
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        isPasswordValid &&
        passwordsMatch &&
        acceptedTerms

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
                        },
                    },
                })

            if (signUpError) throw signUpError

            // If we had visitor data and a current anonymous user, update the visitor record
            if (visitorData && currentUser && signUpData.user) {
                try {
                    await supabase
                        .schema('morpheus')
                        .from('yvisiteur')
                        .update({
                            yuseridfk: signUpData.user.id,
                            yvisiteurnom: `${firstName.trim()} ${lastName.trim()}`,
                            yvisiteuremail: email,
                        })
                        .eq('yvisiteurid', visitorData.yvisiteurid)
                } catch (updateError) {
                    console.error('Error updating visitor record:', updateError)
                    // Don't fail the signup if visitor update fails
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
            className={cn('mx-auto flex max-w-lg flex-col gap-8', className)}
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
            <div className="rounded-lg border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="text-xs text-slate-500">{t('auth.allFieldsRequiredNote')}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="firstName"
                                className="text-sm font-medium text-[#05141D]"
                            >
                                {t('auth.firstName')}
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder={t('auth.firstNamePlaceholder')}
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="lastName"
                                className="text-sm font-medium text-[#05141D]"
                            >
                                {t('auth.lastName')}
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                placeholder={t('auth.lastNamePlaceholder')}
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="text-sm font-medium text-[#05141D]"
                        >
                            {t('auth.email')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.emailPlaceholder')}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 rounded-md border-slate-300 bg-white text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
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
                                type="password"
                                placeholder={t(
                                    'auth.createPasswordPlaceholder'
                                )}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 rounded-md border-slate-300 bg-white pr-12 text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                            />

                            {/* Password validation icon */}
                            {password.length > 0 && (
                                <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                    {isPasswordValid ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                {t(
                                                    'auth.passwordRequirementsMet'
                                                )}
                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <AlertCircleGradient className="h-5 w-5" />
                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 max-w-xs rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                <div className="mb-1 text-xs font-medium">
                                                    {t(
                                                        'auth.passwordRequirements'
                                                    )}
                                                    :
                                                </div>
                                                <ul className="space-y-1">
                                                    {passwordRequirements.map(
                                                        (
                                                            requirement,
                                                            index
                                                        ) => (
                                                            <li
                                                                key={index}
                                                                className="flex items-center gap-2 text-xs"
                                                            >
                                                                <span
                                                                    className={`flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full ${
                                                                        requirement.met
                                                                            ? 'bg-green-500 text-white'
                                                                            : 'bg-slate-600 text-gray-400'
                                                                    }`}
                                                                >
                                                                    {requirement.met
                                                                        ? '✓'
                                                                        : '○'}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        requirement.met
                                                                            ? 'text-green-400'
                                                                            : 'text-gray-400'
                                                                    }
                                                                >
                                                                    {
                                                                        requirement.label
                                                                    }
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
                                type="password"
                                placeholder={t(
                                    'auth.repeatPasswordPlaceholder'
                                )}
                                required
                                value={repeatPassword}
                                onChange={(e) =>
                                    setRepeatPassword(e.target.value)
                                }
                                className="h-11 rounded-md border-slate-300 bg-white pr-12 text-base text-[#05141D] placeholder:text-slate-400 focus:border-[#063846] focus:ring-[#063846]"
                            />

                            {/* Password confirmation icon */}
                            {repeatPassword.length > 0 && (
                                <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                    {passwordsMatch ? (
                                        <div className="group relative">
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                {t('auth.passwordsMatch')}
                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                            <div className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 rounded bg-slate-900 px-3 py-2 text-sm whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                {t(
                                                    'auth.passwordsDoNotMatchTooltip'
                                                )}
                                                <div className="absolute top-full right-4 h-0 w-0 border-t-4 border-r-4 border-l-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={(checked) =>
                                    setAcceptedTerms(!!checked)
                                }
                                className="mt-1 border-slate-300 focus-visible:ring-[#063846]/50 data-[state=checked]:border-[#063846] data-[state=checked]:bg-[#063846]"
                            />
                            
                            <Label
                                htmlFor="terms"
                                className="cursor-pointer text-sm leading-relaxed text-slate-600"
                            >
                                {t('auth.agreeToTerms')}{' '}
                            </Label>
                            <Link
                                href="/terms-and-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm w-fit font-semibold text-[#063846] underline underline-offset-2 transition-colors hover:text-[#05141D]"
                            >
                                {t('auth.termsAndConditions')}
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading || !isFormValid}
                        onClick={(e) => {
                            if (!isFormValid && !isLoading) {
                                e.preventDefault()
                                setError(t('auth.pleaseCompleteAllFields'))
                            }
                        }}
                        className="mt-6 h-11 w-full rounded-md bg-gradient-to-r from-[#05141D] to-[#063846] text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-[#04111a] hover:to-[#052d37] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <img
                                    src="/loading.gif"
                                    alt="Loading"
                                    className="h-5 w-5"
                                />
                                {/* {t('auth.creatingAccount')} */}
                            </div>
                        ) : (
                            t('auth.createAccount')
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
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
