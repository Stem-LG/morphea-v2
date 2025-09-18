'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from '@/components/footer'
import NavBar from '../_components/nav_bar'
import { useLanguage } from '@/hooks/useLanguage'
import { useHomeSettings } from '@/hooks/use-home-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Send, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ContactPage() {
    const { t } = useLanguage()
    const { data: homeSettings } = useHomeSettings()
    const supabase = createClient()
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        subject: '',
        country: '',
        message: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const [visibleFormCards, setVisibleFormCards] = useState<number[]>([])
    const [visibleInfoCards, setVisibleInfoCards] = useState<number[]>([])
    const formCardRefs = useRef<(HTMLDivElement | null)[]>([])
    const infoCardRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const cardIndex = parseInt(
                            entry.target.getAttribute('data-card-index') || '0'
                        )
                        const cardType =
                            entry.target.getAttribute('data-card-type')

                        if (cardType === 'contact') {
                            setVisibleFormCards((prev) => {
                                if (!prev.includes(cardIndex)) {
                                    return [...prev, cardIndex].sort(
                                        (a, b) => a - b
                                    )
                                }
                                return prev
                            })
                        } else if (cardType === 'info') {
                            setVisibleInfoCards((prev) => {
                                if (!prev.includes(cardIndex)) {
                                    return [...prev, cardIndex].sort(
                                        (a, b) => a - b
                                    )
                                }
                                return prev
                            })
                        }
                    }
                })
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -100px 0px',
            }
        )

        // Observe all card types
        formCardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })
        infoCardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission (no API connection for now)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setIsSubmitted(true)
        setIsSubmitting(false)

        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false)
            setFormData({
                firstName: '',
                lastName: '',
                subject: '',
                country: '',
                message: '',
            })
        }, 3000)
    }

    const isFormValid =
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.subject.trim() &&
        formData.message.trim()

    return (
        <div className="relative min-h-screen w-full bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative -top-18 bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] px-8 py-32">
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 h-24 w-24 rounded-full border border-white/20"></div>
                <div className="absolute right-10 bottom-20 h-16 w-16 rounded-full border border-white/20"></div>
                <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-white/10"></div>

                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 font-serif text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                        {t('contact.title')}
                    </h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed font-light text-white/90 md:text-2xl">
                        {t('contact.subtitle')}
                    </p>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 px-8 py-32">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="border-morpheus-gold-light absolute top-20 left-20 h-96 w-96 rounded-full border"></div>
                    <div className="border-morpheus-blue-light absolute right-20 bottom-20 h-64 w-64 rounded-full border"></div>
                    <div className="border-morpheus-gold-dark/20 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 transform rounded-full border"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl">
                    {/* Modern Layout with Asymmetric Design */}
                    <div className="grid items-center gap-16 lg:grid-cols-12">
                        {/* Content Side - Takes 7 columns */}
                        <div className="space-y-8 lg:col-span-7">
                            {/* Title with Modern Typography */}
                            <div className="relative">
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 -left-4 h-18 w-1 bg-gradient-to-b"></div>
                                <h3 className="font-recia text-2xl leading-tight font-bold text-gray-900 lg:text-5xl xl:text-5xl">
                                    {t('contact.form.title')}
                                </h3>
                            </div>

                            {/* Contact Form Card */}
                            <div
                                ref={(el) => {
                                    formCardRefs.current[0] = el
                                }}
                                data-card-index="0"
                                data-card-type="contact"
                                className={cn(
                                    'group relative rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl',
                                    visibleFormCards.includes(0)
                                        ? 'translate-x-0 opacity-100'
                                        : '-translate-x-12 opacity-0'
                                )}
                                style={{
                                    transitionDelay: visibleFormCards.includes(
                                        0
                                    )
                                        ? '0ms'
                                        : '0ms',
                                }}
                            >
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r"></div>
                                <Card className="border-0 bg-transparent shadow-none">
                                    <CardHeader className="pb-6">
                                        <p className="mt-2 text-lg text-gray-600">
                                            {t('contact.form.description')}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {isSubmitted ? (
                                            <div className="py-12 text-center">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                                    <Send className="h-8 w-8 text-green-600" />
                                                </div>
                                                <h3 className="mb-2 text-2xl font-bold text-green-600">
                                                    {t(
                                                        'contact.form.success.title'
                                                    )}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {t(
                                                        'contact.form.success.message'
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <form
                                                onSubmit={handleSubmit}
                                                className="space-y-6"
                                            >
                                                {/* Name Fields */}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="firstName"
                                                            className="font-medium text-gray-700"
                                                        >
                                                            {t(
                                                                'contact.form.firstName'
                                                            )}{' '}
                                                            *
                                                        </Label>
                                                        <Input
                                                            id="firstName"
                                                            value={
                                                                formData.firstName
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    'firstName',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'contact.form.firstNamePlaceholder'
                                                            )}
                                                            className="h-12 border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="lastName"
                                                            className="font-medium text-gray-700"
                                                        >
                                                            {t(
                                                                'contact.form.lastName'
                                                            )}{' '}
                                                            *
                                                        </Label>
                                                        <Input
                                                            id="lastName"
                                                            value={
                                                                formData.lastName
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    'lastName',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'contact.form.lastNamePlaceholder'
                                                            )}
                                                            className="h-12 border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Country */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="country"
                                                        className="font-medium text-gray-700"
                                                    >
                                                        {t('contact.form.country')}
                                                    </Label>
                                                    <Input
                                                        id="country"
                                                        value={formData.country}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'country',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={t('contact.form.countryPlaceholder')}
                                                        className="h-12 border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                    />
                                                </div>

                                                {/* Subject */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="subject"
                                                        className="font-medium text-gray-700"
                                                    >
                                                        {t(
                                                            'contact.form.subject'
                                                        )}{' '}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="subject"
                                                        value={formData.subject}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'subject',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={t(
                                                            'contact.form.subjectPlaceholder'
                                                        )}
                                                        className="h-12 border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                        required
                                                    />
                                                </div>

                                                {/* Message */}
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="message"
                                                        className="font-medium text-gray-700"
                                                    >
                                                        {t(
                                                            'contact.form.message'
                                                        )}{' '}
                                                        *
                                                    </Label>
                                                    <Textarea
                                                        id="message"
                                                        value={formData.message}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                'message',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder={t(
                                                            'contact.form.messagePlaceholder'
                                                        )}
                                                        className="h-12 min-h-[120px] border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                        rows={5}
                                                        required
                                                    />
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        !isFormValid ||
                                                        isSubmitting
                                                    }
                                                    className="h-12 w-full bg-[#053340] py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#0a4c5c] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                                            {t(
                                                                'contact.form.sending'
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Send className="h-5 w-5" />
                                                            {t(
                                                                'contact.form.send'
                                                            )}
                                                        </div>
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Visual Side - Takes 5 columns */}
                        <div className="relative top-16 lg:col-span-5">
                            {/* Contact Info Cards */}
                            <div className="space-y-6">
                                <div
                                    ref={(el) => {
                                        infoCardRefs.current[0] = el
                                    }}
                                    data-card-index="0"
                                    data-card-type="info"
                                    className={cn(
                                        'group relative rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl',
                                        visibleInfoCards.includes(0)
                                            ? 'translate-x-0 opacity-100'
                                            : 'translate-x-12 opacity-0'
                                    )}
                                    style={{
                                        transitionDelay:
                                            visibleInfoCards.includes(0)
                                                ? '0ms'
                                                : '0ms',
                                    }}
                                >
                                    <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r"></div>
                                    <Card className="border-0 bg-transparent shadow-none">
                                        <CardContent className="space-y-10 p-0">
                                            {/* Email section */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#053340]">
                                                    <Mail className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-[#053340]">
                                                        {t(
                                                            'contact.info.email.title'
                                                        )}
                                                    </h3>
                                                    <p className="mb-2 text-gray-600">
                                                        {t(
                                                            'contact.info.email.description'
                                                        )}
                                                    </p>
                                                    <a
                                                        href="mailto:contact@morpheus-sa.com"
                                                        className="font-medium text-[#053340] hover:underline"
                                                    >
                                                        contact@morpheus-sa.com
                                                    </a>
                                                </div>
                                            </div>
                                            {/* Phone section */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#053340]">
                                                    <Phone className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-[#053340]">
                                                        {t(
                                                            'contact.info.phone.title'
                                                        )}
                                                    </h3>
                                                    <p className="mb-2 text-gray-600">
                                                        {t(
                                                            'contact.info.phone.description'
                                                        )}
                                                    </p>
                                                    <a
                                                        href="tel:+21671234567"
                                                        className="font-medium text-[#053340] hover:underline"
                                                    >
                                                        +216 71 234 567
                                                    </a>
                                                </div>
                                            </div>
                                            {/* Address section */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#053340]">
                                                    <MapPin className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-[#053340]">
                                                        {t(
                                                            'contact.info.address.title'
                                                        )}
                                                    </h3>
                                                    <p className="mb-2 text-gray-600">
                                                        {t(
                                                            'contact.info.address.description'
                                                        )}
                                                    </p>
                                                    <address className="font-medium text-[#053340] not-italic">
                                                        123 Avenue Habib
                                                        Bourguiba
                                                        <br />
                                                        1000 Tunis, Tunisia
                                                    </address>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
