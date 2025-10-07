'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'

export default function ComingSoonPage() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    // Email validation function
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('Email is required')
            return
        }

        if (!isValidEmail(email)) {
            toast.error('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)

        try {
            // Generate a unique unsubscription token
            const unsubscriptionToken = crypto.randomUUID()

            // Upsert into xnewsletter table in morpheus schema
            await supabase.schema('morpheus').from('xnewsletter').upsert({
                email: email.trim().toLowerCase(),
                subscribed: true,
                unsubscription_token: unsubscriptionToken,
            }, {
                onConflict: 'email'
            })

            toast.success('Merci pour votre inscription!')
            setEmail('')
        } catch (error) {
            toast.success('Merci pour votre inscription!')
            setEmail('')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5" />
            
            {/* Content Container */}
            <div className="max-w-3xl mx-auto text-center relative z-10">
                {/* Logo Section */}
                <div className="mb-16">
                    <Image
                        src="/images/morph_logo.webp"
                        alt="Morphea"
                        width={300}
                        height={96}
                        className="mx-auto h-24 w-auto object-contain"
                        priority
                    />
                </div>

                {/* Main Content */}
                <div className="mb-12 space-y-12">
                

                    {/* Main Message */}
                        <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-wide">
                            Un monde de raffinement s'apprête à s'ouvrir
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                            Un accès privilégié, pensé pour celles et ceux qui recherchent l'exclusivité et l'élégance.
                        </p>

                        {/* Elegant Divider */}
                        <div className="flex items-center justify-center space-x-4">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-800" />
                            <span className="text-xl uppercase tracking-[0.3em] text-gray-900">Morphea sera dévoilée à 22H</span>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-800" />
                        </div>
                </div>

                {/* Newsletter Form */}
                <div className="max-w-md mx-auto">
                    <p className="mb-8 text-gray-600 font-light">
                        Soyez parmi les premiers à découvrir notre collection exclusive.
                    </p>
                    <form onSubmit={onSubmit} className="relative group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Votre email"
                            disabled={isSubmitting}
                            className="w-full h-14 px-6 pr-14 rounded-full border-2 border-gray-200 text-base transition-all outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 bg-white/80 backdrop-blur"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-slate-900 via-sky-900 to-cyan-950 text-white transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 group-hover:scale-105"
                        >
                            {isSubmitting ? (
                                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}