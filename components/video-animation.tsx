'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { useIsMobile } from '@/hooks/use-mobile'
import { useHomeSettings } from '@/hooks/use-home-settings'
import Link from 'next/link'

export default function VideoAnimation() {
    const containerRef = useRef(null)
    const textRef = useRef(null)

    // Trigger animations when elements come into view
    const isContainerInView = useInView(containerRef, {
        once: true,
        margin: '-20% 0px -20% 0px',
    })
    const isTextInView = useInView(textRef, {
        once: true,
        margin: '-30% 0px -30% 0px',
    })

    const isMobile = useIsMobile()

    const { language } = useLanguage()
    const { data: homeSettings } = useHomeSettings()

    // Get text content from settings with fallbacks
    const title =
        homeSettings?.videoAnimation.title[language] ||
        (language === 'fr' ? "À L'origine de Morphea" : 'The Origin of Morphea')

    const description =
        homeSettings?.videoAnimation.description[language] ||
        (language === 'fr'
            ? "A l'origine de Morphea, cet espace dédié à la mode de luxe, il y a Morpheus le Créateur d'expériences uniques où mode, art de vivre et luxe se rencontrent et révèlent des talents et des savoir-faire d'exception qui allient héritages et innovation."
            : 'At the origin of Morphea, this space dedicated to luxury fashion, there is Morpheus the Creator of unique experiences where fashion, lifestyle and luxury meet and reveal exceptional talents and know-how that combine heritage and innovation.')

    const buttonText =
        homeSettings?.videoAnimation.buttonText[language] ||
        (language === 'fr' ? 'En savoir plus' : 'Learn more')

    const buttonLink =
        homeSettings?.videoAnimation.buttonLink || 'https://morpheus-sa.com/'

    return (
        <section className="relative z-20 bg-white pt-48">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
                <div className="relative min-h-[500px] overflow-hidden bg-white md:min-h-[50vh]">
                    {/* Container that slides to the right - Mobile: less movement */}
                    <motion.div
                        ref={containerRef}
                        className="relative flex h-full min-h-[50vh] flex-col items-center justify-center bg-white md:min-h-[50vh]"
                        initial={{ x: 0 }}
                        animate={{
                            x: isContainerInView && !isMobile ? '30%' : 0,
                        }}
                        transition={{
                            duration: 1.5,
                            ease: 'easeInOut',
                            delay: 0.3,
                        }}
                    >
                        {/* Logo - animates from large at top to small at bottom - Mobile Responsive */}
                        <motion.img
                            src="/images/morph_logo.webp"
                            alt="Morphea Logo"
                            className="absolute h-[200px] md:h-[300px]"
                            initial={{
                                y: 20,
                                scale: 1,
                            }}
                            animate={{
                                y: isContainerInView
                                    ? 'calc(70vh - 120px)'
                                    : 20,
                                scale: isContainerInView ? 0.3 : 1,
                                opacity: 0,
                            }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />

                        {/* Video - stays in same position - Mobile Responsive */}
                        <video
                            src="/morpheus.webm"
                            autoPlay
                            muted
                            playsInline
                            className="absolute top-[40px] max-w-[200px] md:top-[80px] md:max-w-[300px]"
                        />
                    </motion.div>

                    {/* Text content that fades in from the left - Mobile: Different layout */}
                    <motion.div
                        ref={textRef}
                        className="absolute top-0 left-0 flex h-full w-full items-center justify-center px-4 md:w-4/7 md:pl-16 lg:pl-24"
                        initial={{
                            opacity: 0,
                            x: -50,
                        }}
                        animate={{
                            opacity: isTextInView ? 1 : 0,
                            x: isTextInView ? 0 : -50,
                            y: isTextInView && isMobile ? 120 : 0,
                        }}
                        transition={{
                            duration: 1.2,
                            ease: 'easeOut',
                            delay: 0.8,
                        }}
                    >
                        <div className="flex max-w-3xl flex-col gap-3 md:gap-6">
                            <h2 className="font-recia text-center text-xl leading-tight font-extrabold text-[#053340] sm:text-2xl md:text-4xl lg:text-5xl">
                                {title}
                            </h2>
                            <p className="font-supreme text-center text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg lg:text-xl">
                                {description}
                            </p>
                            <div className="mt-3 flex justify-center md:mt-6">
                                <Link
                                    href={buttonLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-supreme w-fit rounded-[30px] bg-gradient-to-r from-[#053340] to-[#0E4D66] px-5 py-2.5 text-base font-semibold text-white transition-all duration-300 hover:from-[#042a35] hover:to-[#0a3d52] md:px-6 md:py-3 md:text-lg lg:text-xl"
                                >
                                    {buttonText}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
