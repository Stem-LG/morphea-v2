'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/footer'
import NavBar from '../_components/nav_bar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useHomeSettings } from '@/hooks/use-home-settings'
import { useLanguage } from '@/hooks/useLanguage'

export default function OriginePage() {
    const supabase = createClient()
    const router = useRouter()
    const { t, translations } = useLanguage()
    const { data: homeSettings } = useHomeSettings()
    const [visibleCards, setVisibleCards] = useState<number[]>([])
    const [visibleMissionCards, setVisibleMissionCards] = useState<number[]>([])
    const [visibleValueCards, setVisibleValueCards] = useState<number[]>([])
    const [visibleFounderItems, setVisibleFounderItems] = useState<number[]>([])
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const missionCardRefs = useRef<(HTMLDivElement | null)[]>([])
    const valueCardRefs = useRef<(HTMLDivElement | null)[]>([])
    const founderRefs = useRef<(HTMLDivElement | null)[]>([])

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
                        } else if (cardType === 'founder') {
                            setVisibleFounderItems((prev) => {
                                if (!prev.includes(cardIndex)) {
                                    return [...prev, cardIndex].sort((a, b) => a - b)
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
        founderRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className="relative min-h-screen w-full bg-white">
            <NavBar />

            {/* Hero Section */}
            <section className="-top-14 relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] px-8 py-32">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <h1 className="font-recia mb-12 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                        {t('morpheaOrigin.hero.title')}
                    </h1>
                    <p className="font-supreme mx-auto max-w-5xl text-xl leading-relaxed font-light text-white/90 md:text-2xl">
                        {t('morpheaOrigin.hero.subtitle')}
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


                        <div className="relative z-10 mx-auto max-w-7xl">
                            {/* Modern Layout with Asymmetric Design */}
                            <div className="grid items-center gap-16 lg:grid-cols-12">
                                {/* Content Side - Takes 7 columns */}
                                <div className="space-y-12 lg:col-span-7">
                                    {/* Title with Modern Typography */}
                                    <div className="relative">
                                        <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 -left-4 h-24 w-1 bg-gradient-to-b"></div>
                                        <h3 className="font-recia text-4xl leading-tight font-bold text-gray-900 lg:text-5xl xl:text-6xl">
                                            {t('morpheaOrigin.identity.title')}
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
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        <span className="text-morpheus-blue-dark text-xl font-semibold uppercase">
                                                            {t(
                                                                'morpheaOrigin.identity.morpheus.name'
                                                            )}
                                                        </span>{' '}
                                                        {t(
                                                            'morpheaOrigin.identity.morpheus.description'
                                                        )}
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
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        <span className="text-morpheus-blue-dark text-xl font-semibold uppercase">
                                                            {t(
                                                                'morpheaOrigin.identity.morphea.name'
                                                            )}
                                                        </span>
                                                        {t(
                                                            'morpheaOrigin.identity.morphea.description'
                                                        )}
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
                                                <div className="flex-1">
                                                    <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                        <span className="text-morpheus-blue-dark text-xl font-semibold uppercase">
                                                            {t(
                                                                'morpheaOrigin.identity.heritage.name'
                                                            )}
                                                        </span>
                                                        {t(
                                                            'morpheaOrigin.identity.heritage.description'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Side - Takes 5 columns */}
                                <div className="relative  md:top-10 lg:col-span-5">
                                    {/* Main Video with Modern Frame */}
                                    <div className="relative">
                                        {/* Main Video Container */}
                                        <div className="relative aspect-[5/5] overflow-hidden rounded-3xl border border-white/50">
                                            {/* Video */}
                                            <video
                                                className="absolute inset-0 h-full w-full object-contain"
                                                autoPlay
                                                muted
                                                playsInline
                                            >
                                                <source
                                                    src="/vid.mp4"
                                                    type="video/mp4"
                                                />
                                            </video>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Founder Section */}
                    <div className="relative bg-white px-8 py-24">
                        <div className="mx-auto max-w-7xl">
                            <div className="relative mb-16">
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light absolute top-0 -left-4 h-12 w-1 bg-gradient-to-b"></div>
                                <h3 className="font-recia text-4xl font-bold text-gray-900 md:text-5xl">
                                    {t('morpheaOrigin.founder.title')}
                                </h3>
                            </div>
                            <div className="grid items-center gap-16 lg:grid-cols-12">
                                {/* Text Side */}
                                <div className="lg:col-span-6">
                                    <div
                                        ref={(el) => {
                                            founderRefs.current[0] = el
                                        }}
                                        data-card-index="0"
                                        data-card-type="founder"
                                        className={cn(
                                            'transition-all duration-1000',
                                            visibleFounderItems.includes(0)
                                                ? 'translate-x-0 opacity-100'
                                                : '-translate-x-12 opacity-0'
                                        )}
                                        style={{
                                            transitionTimingFunction:
                                                'cubic-bezier(0.22, 1, 0.36, 1)',
                                        }}
                                    >


                                        <div className="space-y-6">
                                            <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                {t('morpheaOrigin.founder.bio')}
                                            </p>
                                            <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                {t('morpheaOrigin.founder.bio2')}
                                            </p>
                                            <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                {t('morpheaOrigin.founder.journey')}
                                            </p>
                                            <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                {t('morpheaOrigin.founder.vision')}
                                            </p>
                                            <p className="font-supreme text-lg leading-relaxed text-gray-700">
                                                {t('morpheaOrigin.founder.conclusion')}
                                            </p>
                                            <p className="font-supreme mt-6 text-base tracking-wide text-morpheus-blue-dark">
                                                — {t('morpheaOrigin.founder.name')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Side */}
                                <div className="lg:col-span-6">
                                    <div
                                        ref={(el) => {
                                            founderRefs.current[1] = el
                                        }}
                                        data-card-index="1"
                                        data-card-type="founder"
                                        className={cn(
                                            'transition-all duration-1000',
                                            visibleFounderItems.includes(1)
                                                ? 'translate-x-0 opacity-100'
                                                : 'translate-x-12 opacity-0'
                                        )}
                                        style={{
                                            transitionTimingFunction:
                                                'cubic-bezier(0.22, 1, 0.36, 1)',
                                        }}
                                    >
                                        <div className="relative aspect-[5/5] top-3 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-lg">
                                            {homeSettings?.morpheaOriginFounder?.imageUrl ? (
                                                <Image
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    src={homeSettings.morpheaOriginFounder.imageUrl}
                                                    alt={t('morpheaOrigin.founder.name')}
                                                    width={1200}
                                                    height={1200}
                                                />
                                            ) : (
                                                <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-gray-300"></div>
                                            )}
                                        </div>
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
                                    {t('morpheaOrigin.mission.title')}
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {(
                                    translations?.morpheaOrigin?.mission
                                        ?.items || []
                                ).map((mission: any, index: number) => (
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
                                {t('morpheaOrigin.vision.title')}
                            </h3>
                            <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto mb-12 h-1 w-24 bg-gradient-to-r"></div>
                            <p className="font-supreme text-xl leading-relaxed text-gray-700 md:text-2xl">
                                {t('morpheaOrigin.vision.description')}
                            </p>
                        </div>

                        {/* Vision Images */}
                        <div className="relative mt-16">
                            {homeSettings?.morpheaOriginVision.images &&
                                homeSettings.morpheaOriginVision.images.length >
                                0 ? (
                                <div className="flex h-[450px] gap-2">
                                    {homeSettings.morpheaOriginVision.images.map(
                                        (imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative flex-1"
                                            >
                                                <Image
                                                    className="h-full w-full object-cover"
                                                    src={imageUrl}
                                                    alt={`${t('morpheaOrigin.vision.imageAlt')} ${index + 1}`}
                                                    width={1000}
                                                    height={1000}
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-96 gap-4">
                                    <div className="relative flex-1">
                                        <Image
                                            className="h-full w-full rounded-lg object-cover"
                                            src="/images/about/vision.png"
                                            alt={t(
                                                'morpheaOrigin.vision.defaultImageAlt'
                                            )}
                                            width={1000}
                                            height={1000}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Values Section */}
                    <div className="px-8 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h3 className="font-recia mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
                                    {t('morpheaOrigin.values.title')}
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="gap-8 flex justify-center flex-wrap">
                                {(
                                    translations?.morpheaOrigin?.values
                                        ?.items || []
                                ).map((value: any, index: number) => (
                                    <div
                                        key={index}
                                        ref={(el) => {
                                            valueCardRefs.current[index] = el
                                        }}
                                        data-card-index={index}
                                        data-card-type="value"
                                        className={cn(
                                            'group relative transition-all duration-700 w-[100%] md:w-[40%] lg:w-[30%]',
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
                                    {t('morpheaOrigin.features.title')}
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {[
                                    {
                                        title: t(
                                            'morpheaOrigin.features.items.0.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.0.description'
                                        ),
                                        icon: '🎨',
                                    },
                                    {
                                        title: t(
                                            'morpheaOrigin.features.items.1.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.1.description'
                                        ),
                                        icon: '🌟',
                                    },
                                    {
                                        title: t(
                                            'morpheaOrigin.features.items.2.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.2.description'
                                        ),
                                        icon: '🛍️',
                                    },
                                    {
                                        title: t(
                                            'morpheaOrigin.features.items.3.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.3.description'
                                        ),
                                        icon: '🌐',
                                    },
                                    {
                                        title: t(
                                            'morpheaOrigin.features.items.4.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.4.description'
                                        ),
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
                                        title: t(
                                            'morpheaOrigin.features.items.5.title'
                                        ),
                                        description: t(
                                            'morpheaOrigin.features.items.5.description'
                                        ),
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
                                    {t('morpheaOrigin.benefits.title')}
                                </h3>
                                <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto h-1 w-24 bg-gradient-to-r"></div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-8">
                                {(
                                    translations?.morpheaOrigin?.benefits
                                        ?.items || []
                                ).map((benefit: any, index: number) => (
                                    <div
                                        key={index}
                                        className="group max-w-[350px] min-w-[280px] flex-1"
                                    >
                                        <div className="h-full rounded-lg border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                            <div className="from-morpheus-blue-light to-morpheus-blue-dark mb-4 inline-block h-12 w-12 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                                                {index + 1}
                                            </div>
                                            <p className="font-supreme leading-relaxed font-medium text-gray-700">
                                                {benefit.description}
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
                                {t('morpheaOrigin.promise.title')}
                            </h3>
                            <div className="from-morpheus-gold-dark to-morpheus-gold-light mx-auto mb-12 h-1 w-24 bg-gradient-to-r"></div>
                            <p className="font-supreme text-xl leading-relaxed text-gray-700 md:text-2xl">
                                {t('morpheaOrigin.promise.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
