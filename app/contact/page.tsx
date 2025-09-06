'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from '@/components/footer'
import NavBar from '../_components/nav_bar'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Send, Clock, Users } from 'lucide-react'

export default function ContactPage() {
    const { t } = useLanguage()
    const supabase = createClient()
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        subject: '',
        country: '',
        message: ''
    })
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        // Simulate form submission (no API connection for now)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
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
                message: ''
            })
        }, 3000)
    }

    const isFormValid = formData.firstName.trim() && 
                       formData.lastName.trim() && 
                       formData.subject.trim() && 
                       formData.message.trim()

    return (
        <div className="relative min-h-screen w-full bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] px-8 py-32">
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

            {/* Main Content */}
            <section className="bg-white px-8 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-16">
                        {/* Contact Form */}
                        <div>
                            <Card className="w-1/2 border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-xl">
                                <CardHeader className="pb-6">
                                    <CardTitle className="flex items-center gap-3 font-serif text-3xl font-bold text-[#053340]">
                                        <Send className="h-8 w-8" />
                                        {t('contact.form.title')}
                                    </CardTitle>
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
                                                                e.target.value
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
                                                                e.target.value
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

                                            {/* Subject */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="subject"
                                                    className="font-medium text-gray-700"
                                                >
                                                    {t('contact.form.subject')}{' '}
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

                                            {/* Country */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="country"
                                                    className="font-medium text-gray-700"
                                                >
                                                    Country
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
                                                    placeholder="Enter your country"
                                                    className="h-12 border-gray-300 bg-white text-gray-900 focus:border-[#053340] focus:ring-[#053340]"
                                                />
                                            </div>

                                            {/* Message */}
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="message"
                                                    className="font-medium text-gray-700"
                                                >
                                                    {t('contact.form.message')}{' '}
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
                                                    !isFormValid || isSubmitting
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
                                                        {t('contact.form.send')}
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-8">
                           

                            {/* Contact Cards */}
                            <div className="flex flex-row flex-wrap gap-6">
                                {/* Email */}
                                <Card className="min-w-[300px] flex-1 border border-gray-200 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <CardContent className="p-6">
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
                                    </CardContent>
                                </Card>

                                {/* Phone */}
                                <Card className="min-w-[300px] flex-1 border border-gray-200 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <CardContent className="p-6">
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
                                    </CardContent>
                                </Card>

                                {/* Address */}
                                <Card className="min-w-[300px] flex-1 border border-gray-200 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <CardContent className="p-6">
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
                                                    123 Avenue Habib Bourguiba
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
            </section>

            <Footer />
        </div>
    )
}
