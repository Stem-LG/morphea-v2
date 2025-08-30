'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/footer'
import NavBar from '../_components/nav_bar'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export default function OriginePage() {
    const supabase = createClient()
    const router = useRouter()
    const [visibleCards, setVisibleCards] = useState<number[]>([])
    const [visibleMissionCards, setVisibleMissionCards] = useState<number[]>([])
    const [visibleValueCards, setVisibleValueCards] = useState<number[]>([])
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const missionCardRefs = useRef<(HTMLDivElement | null)[]>([])
    const valueCardRefs = useRef<(HTMLDivElement | null)[]>([])

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

                        if (cardType === 'adn') {
                            setVisibleCards((prev) => {
                                if (!prev.includes(cardIndex)) {
                                    return [...prev, cardIndex].sort(
                                        (a, b) => a - b
                                    )
                                }
                                return prev
                            })
                        } else if (cardType === 'mission') {
                            setVisibleMissionCards((prev) => {
                                if (!prev.includes(cardIndex)) {
                                    return [...prev, cardIndex].sort(
                                        (a, b) => a - b
                                    )
                                }
                                return prev
                            })
                        } else if (cardType === 'value') {
                            setVisibleValueCards((prev) => {
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
        cardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })
        missionCardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })
        valueCardRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className="relative min-h-screen w-full bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] px-8 py-32">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <h1 className="font-recia mb-12 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                        À l'origine de Morphea
                    </h1>
                    <p className="font-supreme mx-auto max-w-5xl text-xl leading-relaxed font-light text-white/90 md:text-2xl">
                        L'univers Morphea est ainsi né comme un écrin pour
                        traduire ces expériences en un espace immersif qui
                        révèle des talents et des savoir-faire d'exception,
                        entre héritage et innovation.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 h-24 w-24 rounded-full border border-white/20"></div>
                <div className="absolute right-10 bottom-20 h-16 w-16 rounded-full border border-white/20"></div>
                <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-white/10"></div>
            </section>

            {/* Main Content Section */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl">
                    {/* Identity & DNA Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 px-8 py-32">
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
                                <div className="space-y-12 lg:col-span-7">
                                    {/* Title with Modern Typography */}
                                    <div className="relative">
                                        <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 -left-4 h-24 w-1 bg-gradient-to-b"></div>
                                        <h3 className="font-recia text-4xl leading-tight font-bold text-gray-900 lg:text-5xl xl:text-6xl">
                                            Notre identité
                                            <br />
                                            <span className="text-morpheus-blue-dark">
                                                et notre ADN
                                            </span>
                                        </h3>
                                    </div>

                                    {/* Content Cards */}
                                    <div className="space-y-8">
                                        {/* Morpheus Card */}
                                        <div
                                            ref={(el) => {
                                                cardRefs.current[0] = el
                                            }}
                                            data-card-index="0"
                                            data-card-type="adn"
                                            className={cn(
                                                'group relative rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl',
                                                visibleCards.includes(0)
                                                    ? 'translate-x-0 opacity-100'
                                                    : '-translate-x-12 opacity-0'
                                            )}
                                            style={{
                                                transitionDelay:
                                                    visibleCards.includes(0)
                                                        ? '0ms'
                                                        : '0ms',
                                            }}
                                        >
                                            <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r"></div>
                                            <div className="flex items-start space-x-4">
                                                <div className="from-morpheus-blue-dark to-morpheus-blue-light flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
                                                    <span className="text-lg font-bold text-white">
                                                        M
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        <span className="text-morpheus-blue-dark text-xl font-semibold">
                                                            Morpheus
                                                        </span>{' '}
                                                        est le créateur
                                                        d'expériences uniques où
                                                        mode, art de vivre et
                                                        luxe se rencontrent. À
                                                        travers ses événements,
                                                        projets et
                                                        collaborations, Morpheus
                                                        explore l'alliance entre
                                                        héritage et innovation
                                                        pour sublimer les
                                                        talents et les
                                                        savoir-faire
                                                        d'exception.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Morphea Card */}
                                        <div
                                            ref={(el) => {
                                                cardRefs.current[1] = el
                                            }}
                                            data-card-index="1"
                                            data-card-type="adn"
                                            className={cn(
                                                'group relative rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl',
                                                visibleCards.includes(1)
                                                    ? 'translate-x-0 opacity-100'
                                                    : '-translate-x-12 opacity-0'
                                            )}
                                            style={{
                                                transitionDelay:
                                                    visibleCards.includes(1)
                                                        ? '200ms'
                                                        : '0ms',
                                            }}
                                        >
                                            <div className="from-morpheus-gold-light to-morpheus-gold-dark absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r"></div>
                                            <div className="flex items-start space-x-4">
                                                <div className="from-morpheus-gold-dark to-morpheus-gold-light flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
                                                    <span className="text-lg font-bold text-white">
                                                        M
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        <span className="text-morpheus-blue-dark text-xl font-semibold">
                                                            Morphea
                                                        </span>
                                                        , née de l'expertise de
                                                        l'agence événementielle
                                                        Morpheus, la plateforme
                                                        digitale Morphea réunit
                                                        shopping et art de
                                                        vivre. Elle célèbre le
                                                        savoir-faire, la
                                                        création et le fait main
                                                        en proposant à la vente
                                                        des pièces dévoilées
                                                        lors de défilés et
                                                        salons exclusifs.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Heritage Card */}
                                        <div
                                            ref={(el) => {
                                                cardRefs.current[2] = el
                                            }}
                                            data-card-index="2"
                                            data-card-type="adn"
                                            className={cn(
                                                'group from-morpheus-blue-dark/5 to-morpheus-gold-light/5 border-morpheus-gold-light/30 relative rounded-2xl border bg-gradient-to-br p-8 shadow-lg transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl',
                                                visibleCards.includes(2)
                                                    ? 'translate-x-0 opacity-100'
                                                    : '-translate-x-12 opacity-0'
                                            )}
                                            style={{
                                                transitionDelay:
                                                    visibleCards.includes(2)
                                                        ? '400ms'
                                                        : '0ms',
                                            }}
                                        >
                                            <div className="from-morpheus-blue-dark to-morpheus-blue-light absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-gradient-to-r"></div>
                                            <div className="flex items-start space-x-4">
                                                <div className="from-morpheus-blue-light to-morpheus-blue-dark flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br">
                                                    <svg
                                                        className="h-6 w-6 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        Chaque création,
                                                        porteuse de durabilité
                                                        et de respect de
                                                        l'environnement, incarne
                                                        la transmission d'un
                                                        patrimoine vivant et
                                                        d'une élégance
                                                        intemporelle.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Side - Takes 5 columns */}
                                <div className="relative lg:col-span-5">
                                    {/* Main Image with Modern Frame */}
                                    <div className="relative">
                                        {/* Floating Elements */}
                                        <div className="from-morpheus-gold-dark/20 to-morpheus-gold-light/20 absolute -top-8 -left-8 z-50 h-24 w-24 rounded-full bg-gradient-to-br blur-xl"></div>
                                        <div className="from-morpheus-blue-dark/20 to-morpheus-blue-light/20 absolute -right-8 -bottom-8 z-50 h-32 w-32 rounded-full bg-gradient-to-br blur-xl"></div>

                                        {/* Main Video Container */}
                                        <div className="from-morpheus-gold-dark/10 to-morpheus-blue-dark/10 relative aspect-[5/5] overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br via-white">
                                            {/* Video */}
                                            <video
                                                className="absolute inset-0 h-full w-full object-contain"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            >
                                                <source
                                                    src="/vid.mp4"
                                                    type="video/mp4"
                                                />
                                            </video>

                                            {/* Glass Effect Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                                            {/* Decorative Corner Elements */}
                                            <div className="border-morpheus-gold-light/50 absolute top-4 left-4 h-8 w-8 rounded-tl-lg border-t-2 border-l-2"></div>
                                            <div className="border-morpheus-gold-light/50 absolute right-4 bottom-4 h-8 w-8 rounded-br-lg border-r-2 border-b-2"></div>
                                        </div>

                                        {/* Side Accent */}
                                        <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-1/2 -right-4 h-32 w-2 -translate-y-1/2 transform rounded-full bg-gradient-to-b shadow-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="px-8 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                    Notre mission
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        title: 'Valoriser le savoir-faire méditerranéen',
                                        description:
                                            'Faire découvrir des talents artisanaux et leur patrimoine culturel.',
                                        icon: '🏺',
                                    },
                                    {
                                        title: 'Offrir une expérience digitale immersive',
                                        description:
                                            'Allier esthétique, innovation et interactivité pour captiver le public.',
                                        icon: '✨',
                                    },
                                    {
                                        title: 'Créer une plateforme de visibilité',
                                        description:
                                            "Permettre aux créateurs d'atteindre une audience internationale et de vendre leurs créations.",
                                        icon: '🌍',
                                    },
                                    {
                                        title: 'Stimuler la collaboration',
                                        description:
                                            'Renforcer les échanges entre professionnels, passionnés et communautés créatives.',
                                        icon: '🤝',
                                    },
                                ].map((mission, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => {
                                            missionCardRefs.current[index] = el
                                        }}
                                        data-card-index={index}
                                        data-card-type="mission"
                                        className={cn(
                                            'group relative transition-all duration-700',
                                            visibleMissionCards.includes(index)
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-8 opacity-0'
                                        )}
                                        style={{
                                            transitionDelay:
                                                visibleMissionCards.includes(
                                                    index
                                                )
                                                    ? `${index * 150}ms`
                                                    : '0ms',
                                        }}
                                    >
                                        <div className="h-full rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                         
                                            <h4 className="font-recia mb-4 text-xl font-semibold text-gray-900">
                                                {mission.title}
                                            </h4>
                                            <p className="font-supreme leading-relaxed text-gray-600">
                                                {mission.description}
                                            </p>
                                            <div className="from-morpheus-gold-dark/5 to-morpheus-gold-light/5 absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vision Section */}
                    <div className="relative bg-white px-8 py-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                Notre vision
                            </h3>
                            <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto mb-12 h-1 w-24 bg-gradient-to-r"></div>
                            <p className="font-supreme text-xl leading-relaxed text-gray-700 md:text-2xl">
                                Faire de Morphea un véritable pont entre
                                tradition et modernité. Un lieu où les créateurs
                                méditerranéens accèdent à une visibilité
                                mondiale, où le patrimoine et l'innovation se
                                rencontrent, et où chaque visiteur vit une
                                expérience digitale unique, inspirante et
                                mémorable.
                            </p>
                        </div>

                        {/* Vision Image Placeholder */}
                        <div className="relative mt-16">
                            <Image
                                className="w-full"
                                src="/images/about/vision.png"
                                about="vision"
                                alt="vision"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="px-8 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                    Nos valeurs
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        title: 'Excellence',
                                        description:
                                            "Un espace haut de gamme et soigné, reflet de l'exigence Morpheus.",
                                        gradient: 'from-purple-500 to-pink-500',
                                    },
                                    {
                                        title: 'Créativité',
                                        description:
                                            "Encourager l'innovation et l'originalité des créateurs.",
                                        gradient: 'from-blue-500 to-cyan-500',
                                    },
                                    {
                                        title: 'Durabilité',
                                        description:
                                            'Promouvoir des matériaux nobles et le savoir-faire artisanal.',
                                        gradient:
                                            'from-green-500 to-emerald-500',
                                    },
                                    {
                                        title: 'Partage',
                                        description:
                                            "Favoriser l'échange et la collaboration entre professionnels et passionnés.",
                                        gradient: 'from-orange-500 to-red-500',
                                    },
                                ].map((value, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => {
                                            valueCardRefs.current[index] = el
                                        }}
                                        data-card-index={index}
                                        data-card-type="value"
                                        className={cn(
                                            'group relative transition-all duration-700',
                                            visibleValueCards.includes(index)
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-8 opacity-0'
                                        )}
                                        style={{
                                            transitionDelay:
                                                visibleValueCards.includes(
                                                    index
                                                )
                                                    ? `${index * 150}ms`
                                                    : '0ms',
                                        }}
                                    >
                                        <div className="h-full rounded-lg border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                           
                                            <h4 className="font-recia mb-4 text-xl font-semibold text-gray-900">
                                                {value.title}
                                            </h4>
                                            <p className="font-supreme leading-relaxed text-gray-600">
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* What You'll Find Section */}
                    <div className="relative bg-white px-8 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                    Ce que vous trouverez à Morphea
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[
                                    {
                                        title: 'Découvrir les créateurs',
                                        description:
                                            'Explorez des marques et artisans uniques dans un univers digital soigné.',
                                        icon: '🎨',
                                    },
                                    {
                                        title: 'Expériences immersives',
                                        description:
                                            "Ateliers, démonstrations et visites interactives pour plonger dans l'univers des créateurs.",
                                        icon: '🌟',
                                    },
                                    {
                                        title: 'Marketplace & achats',
                                        description:
                                            'Achetez directement les œuvres exposées grâce à un espace sécurisé, pensé pour valoriser chaque création.',
                                        icon: '🛍️',
                                    },
                                    {
                                        title: 'Communauté & networking',
                                        description:
                                            'Connectez-vous avec professionnels, passionnés et créateurs pour partager des idées et créer des collaborations.',
                                        icon: '🌐',
                                    },
                                    {
                                        title: 'Événements exclusifs',
                                        description:
                                            'Défilés, workshops et rencontres digitales pour découvrir les tendances et innovations du secteur.',
                                        icon: (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                enable-background="new 0 0 100 100"
                                                viewBox="0 0 100 100"
                                                width="37"
                                                height="37"
                                            >
                                                <path
                                                    fill="#18c7ef"
                                                    d="M3.5,14.3v77.4c0,1.6,1.3,2.9,2.9,2.9h88.1c1.6,0,2.9-1.3,2.9-2.9V14.3c0-1.6-1.3-2.9-2.9-2.9H6.4
				C4.8,11.4,3.5,12.7,3.5,14.3z"
                                                    className="svgShape color18c7ef-0 selectable"
                                                ></path>
                                                <path
                                                    d="M97.5,14.3v77.4c0,1.6-1.3,2.9-2.9,2.9h-6.2c1.6,0,2.9-1.3,2.9-2.9V14.3c0-1.6-1.3-2.9-2.9-2.9h6.2
				C96.2,11.4,97.5,12.7,97.5,14.3z"
                                                    opacity=".1"
                                                    fill="#000000"
                                                    className="svgShape color000000-1 selectable"
                                                ></path>
                                                <polygon
                                                    fill="#f4f6f8"
                                                    points="92.1 31.6 92.1 74.6 77.2 89.5 8.9 89.5 8.9 31.6"
                                                    className="svgShape colorf4f6f8-2 selectable"
                                                ></polygon>
                                                <polygon
                                                    points="92.1 31.6 92.1 74.6 77.2 89.5 71.8 89.5 86.7 74.6 86.7 31.6"
                                                    opacity=".1"
                                                    fill="#000000"
                                                    className="svgShape color000000-3 selectable"
                                                ></polygon>
                                                <polygon
                                                    fill="#ffb850"
                                                    points="92.1 74.6 77.2 89.5 77.2 74.6"
                                                    className="svgShape colorffb850-4 selectable"
                                                ></polygon>
                                                <circle
                                                    cx="18.4"
                                                    cy="21.5"
                                                    r="3.9"
                                                    fill="#3a3a3a"
                                                    className="svgShape color3a3a3a-5 selectable"
                                                ></circle>
                                                <circle
                                                    cx="39.8"
                                                    cy="21.5"
                                                    r="3.9"
                                                    fill="#3a3a3a"
                                                    className="svgShape color3a3a3a-6 selectable"
                                                ></circle>
                                                <circle
                                                    cx="61.2"
                                                    cy="21.5"
                                                    r="3.9"
                                                    fill="#3a3a3a"
                                                    className="svgShape color3a3a3a-7 selectable"
                                                ></circle>
                                                <circle
                                                    cx="82.6"
                                                    cy="21.5"
                                                    r="3.9"
                                                    fill="#3a3a3a"
                                                    className="svgShape color3a3a3a-8 selectable"
                                                ></circle>
                                                <path
                                                    fill="#303030"
                                                    d="M18.4 22.5c-.6 0-1-.4-1-1V7.4c0-.6.4-1 1-1s1 .4 1 1v14.1C19.4 22 18.9 22.5 18.4 22.5zM39.8 22.5c-.6 0-1-.4-1-1V7.4c0-.6.4-1 1-1s1 .4 1 1v14.1C40.8 22 40.3 22.5 39.8 22.5zM61.2 22.5c-.6 0-1-.4-1-1V7.4c0-.6.4-1 1-1s1 .4 1 1v14.1C62.2 22 61.8 22.5 61.2 22.5zM82.6 22.5c-.6 0-1-.4-1-1V7.4c0-.6.4-1 1-1s1 .4 1 1v14.1C83.6 22 83.2 22.5 82.6 22.5z"
                                                    className="svgShape color303030-9 selectable"
                                                ></path>
                                                <g>
                                                    <path
                                                        fill="#ffb850"
                                                        d="M71.8,60.6c0,11.8-9.5,21.3-21.3,21.3c-11.8,0-21.3-9.5-21.3-21.3c0-11.8,9.5-21.3,21.3-21.3
			C62.3,39.3,71.8,48.8,71.8,60.6z"
                                                        className="svgShape colorffb850-11 selectable"
                                                    ></path>
                                                    <path
                                                        d="M71.8,60.6c0,11.8-9.5,21.3-21.3,21.3c-1,0-1.9-0.1-2.8-0.2c10.4-1.4,18.4-10.3,18.4-21.1
			c0-10.8-8-19.7-18.4-21.1c0.9-0.1,1.9-0.2,2.8-0.2C62.3,39.3,71.8,48.8,71.8,60.6z"
                                                        opacity=".1"
                                                        fill="#000000"
                                                        className="svgShape color000000-12 selectable"
                                                    ></path>
                                                    <path
                                                        fill="#fff"
                                                        d="M51.3,49.8l3,6c0.1,0.3,0.4,0.4,0.7,0.5l6.6,1c0.7,0.1,1,1,0.5,1.5l-4.8,4.7c-0.2,0.2-0.3,0.5-0.3,0.8
				l1.1,6.6c0.1,0.7-0.6,1.3-1.3,0.9l-5.9-3.1c-0.3-0.1-0.6-0.1-0.8,0l-5.9,3.1c-0.7,0.3-1.4-0.2-1.3-0.9l1.1-6.6
				c0-0.3,0-0.6-0.3-0.8l-4.8-4.7c-0.5-0.5-0.2-1.4,0.5-1.5l6.6-1c0.3,0,0.5-0.2,0.7-0.5l3-6C50,49.1,51,49.1,51.3,49.8z"
                                                        className="svgShape colorffffff-13 selectable"
                                                    ></path>
                                                </g>
                                            </svg>
                                        ),
                                    },
                                    {
                                        title: 'Nos partenaires',
                                        description:
                                            "Morphea collabore avec créateurs, designers, artistes, associations d'artisans, médias spécialisés et institutions culturelles.",
                                        icon: (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                enable-background="new 0 0 468 468"
                                                viewBox="0 0 468 380"
                                                width="56"
                                                height="36"
                                            >
                                                <path
                                                    fill="#f9dbaa"
                                                    d="M363.325,289.52c-52.148-54.838-159.38-167.658-159.38-167.658l-12.694-9.682
				c-31.11-23.727-75.85-16.163-97.396,16.466H61.183v186.767h32.671l49.673,55.073c8.194,9.084,21.549,11.363,32.291,5.509l0,0
				c15.059-8.206,18.443-28.355,6.892-41.031l-8.494-9.321l36.075,40.315c7.244,8.096,18.845,10.66,28.824,6.365l0.64-0.276
				c16.502-7.103,21.231-28.146,9.403-41.546c-17.23-19.52-37.373-42.428-37.373-42.428l54.076,60.427
				c8.156,9.114,21.451,11.543,32.303,5.9l0.651-0.339c16.319-8.486,20.111-30.026,7.734-43.485
				c-23.755-25.833-56.122-61.145-56.122-61.145s49.731,53.076,73.472,78.427c7.435,7.939,18.984,10.479,29.063,6.39l0.686-0.278
				C371.694,326.649,376.682,303.566,363.325,289.52z"
                                                    className="svgShape colorf9dbaa-0 selectable"
                                                ></path>
                                                <path
                                                    fill="#52c1ff"
                                                    d="M49.529,332.915H14c-7.732,0-14-6.268-14-14v-192.69c0-7.732,6.268-14,14-14h35.529
				c7.732,0,14,6.268,14,14v192.69C63.529,326.647,57.261,332.915,49.529,332.915z"
                                                    className="svgShape color52c1ff-1 selectable"
                                                ></path>
                                                <path
                                                    fill="#f9cd93"
                                                    d="M382.329,310.422h24.488l0.037-175.076h-87.082l-20.794-24.166
				c-23.359-27.146-64.432-30.027-91.365-6.409l-71.354,62.572c-16.485,14.456-17.91,39.589-3.164,55.809l0,0
				c14.332,15.764,38.646,17.237,54.783,3.318l62.225-54.263L382.329,310.422z"
                                                    className="svgShape colorf9cd93-2 selectable"
                                                ></path>
                                                <path
                                                    fill="#4c97e3"
                                                    d="M418.471,332.617H454c7.732,0,14-6.268,14-14v-192.69c0-7.732-6.268-14-14-14h-35.529
				c-7.732,0-14,6.268-14,14v192.69C404.471,326.349,410.739,332.617,418.471,332.617z"
                                                    className="svgShape color4c97e3-3 selectable"
                                                ></path>
                                            </svg>
                                        ),
                                    },
                                ].map((feature, index) => (
                                    <div key={index} className="group">
                                        <div
                                            className={cn(
                                                'h-full rounded-lg border border-gray-100 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
                                                {
                                                    'bg-gradient-to-br from-white to-gray-50':
                                                        index % 2 === 0,
                                                    'from-morpheus-blue-dark to-morpheus-blue-light bg-gradient-to-br':
                                                        index % 2 !== 0,
                                                }
                                            )}
                                        >
                                            <h4
                                                className={cn(
                                                    'font-recia mb-4 text-xl font-semibold',
                                                    {
                                                        'text-gray-900':
                                                            index % 2 === 0,
                                                        'text-gray-200':
                                                            index % 2 !== 0,
                                                    }
                                                )}
                                            >
                                                {feature.title}
                                            </h4>
                                            <p
                                                className={cn(
                                                    'font-supreme leading-relaxed',
                                                    {
                                                        'text-gray-600':
                                                            index % 2 === 0,
                                                        'text-gray-400':
                                                            index % 2 !== 0,
                                                    }
                                                )}
                                            >
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Why Join Us Section */}
                    <div className="px-8 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                    Pourquoi nous rejoindre
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[
                                    'Exposer vos créations à une audience internationale.',
                                    'Participer à des événements immersifs et workshops.',
                                    'Accéder à une marketplace sécurisée pour vendre vos œuvres.',
                                    'Rejoindre une communauté dynamique de professionnels et de passionnés.',
                                    'Concevoir et organiser vos événements, stratégies marketing et campagnes de communication.',
                                ].map((benefit, index) => (
                                    <div key={index} className="group">
                                        <div className="h-full rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                            <div className="from-morpheus-gold-dark to-morpheus-gold-light mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white">
                                                {index + 1}
                                            </div>
                                            <p className="font-supreme leading-relaxed font-medium text-gray-700">
                                                {benefit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Promise Section */}
                    <div className="relative bg-white px-8 py-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                Notre promesse
                            </h3>
                            <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto mb-12 h-1 w-24 bg-gradient-to-r"></div>
                            <p className="font-supreme text-xl leading-relaxed text-gray-700 md:text-2xl">
                                Morphea n'est pas seulement un mall virtuel :
                                c'est un lieu vivant où tradition et modernité
                                s'entrelacent, où chaque création raconte une
                                histoire et où chaque visiteur devient acteur de
                                l'expérience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
