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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">

                {/* Message */}
                <div className="mb-12 space-y-4">
                    {/* Logo */}
                    <Image
                        src="/images/morph_logo.webp"
                        alt="Morphea"
                        width={250}
                        height={80}
                        className="mx-auto h-20  w-56 object-cover"
                    />
                  
                    <div className="space-y-2 text-lg md:text-xl text-gray-700 leading-relaxed">
                        <p>Un monde de raffinement s'apprête à s'ouvrir.</p>
                        <p>Un accès privilégié, pensé pour celles et ceux qui recherchent l'exclusivité et l'élégance.</p>
                        <p className="font-semibold">Morphea sera dévoilée à 22H.</p>
                    </div>
                </div>

                {/* Newsletter Form */}
                <div className="max-w-md mx-auto">
                    <p className="mb-6 text-gray-600">
                        Soyez parmi les premiers à découvrir Morphea. Inscrivez-vous pour être notifié.
                    </p>
                    <form onSubmit={onSubmit} className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Votre email"
                            disabled={isSubmitting}
                            className="w-full h-12 px-4 pr-12 rounded-full border border-gray-300 text-base transition outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-slate-900 via-sky-900 to-cyan-950 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
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