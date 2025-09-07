'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Footer from '@/components/footer'
import ExpandableCategories from '@/components/expandable-categories'
import { ThreeDPhotoCarousel } from '@/components/three-d-photo-carousel'
import VideoAnimation from '@/components/video-animation'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { useHomeSettings } from '@/hooks/use-home-settings'
import { PoweredBy } from '@/components/powered-by'

export default function Home() {
    const supabase = createClient()
    const router = useRouter()
    const { t, language } = useLanguage()
    const { data: homeSettings, isLoading: isLoadingSettings } =
        useHomeSettings()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    useEffect(() => {
        // Ensure videos play when ready
        const playIfReady = (video: HTMLVideoElement | null) => {
            if (video && video.readyState >= 3) { // HAVE_FUTURE_DATA
                video.play()
            } else if (video) {
                const handleCanPlay = () => {
                    video.play()
                    video.removeEventListener('canplay', handleCanPlay)
                }
                video.addEventListener('canplay', handleCanPlay)
            }
        }

        playIfReady(video1Ref.current)
        playIfReady(video2Ref.current)
    }, [])


    const [hovered, setHovered] = useState<'left' | 'right'>('left')
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMuted, setIsMuted] = useState(true)
    const video1Ref = useRef<HTMLVideoElement>(null)
    const video2Ref = useRef<HTMLVideoElement>(null)

    // Video control functions
    const togglePlayPause = () => {
        const video1 = video1Ref.current
        const video2 = video2Ref.current

        if (isPlaying) {
            video1?.pause()
            video2?.pause()
        } else {
            video1?.play()
            video2?.play()
        }
        setIsPlaying(!isPlaying)
    }

    const toggleMute = () => {
        const video1 = video1Ref.current
        const video2 = video2Ref.current

        if (video1) video1.muted = !isMuted
        if (video2) video2.muted = !isMuted
        setIsMuted(!isMuted)
    }

    // Video and overlay data - now dynamic from settings
    const videoData = {
        side1: {
            src: homeSettings?.hero.video1.url || '/v1.mp4',
            topText:
                homeSettings?.hero.video1.topText[language] ||
                t('homepage.hero.mode'),
            mainText:
                homeSettings?.hero.video1.mainText[language] ||
                t('homepage.hero.preCollection'),
            discoverLink: homeSettings?.hero.video1.discoverLink || '/main',
        },
        side2: {
            src: homeSettings?.hero.video2.url || '/v2.mp4',
            topText:
                homeSettings?.hero.video2.topText[language] ||
                t('homepage.hero.preCollection'),
            mainText:
                homeSettings?.hero.video2.mainText[language] ||
                t('homepage.hero.summerCollection'),
            discoverLink: homeSettings?.hero.video2.discoverLink || '/main',
        },
    }

    const collectionData = {
        title:
            homeSettings?.collections.title[language] ||
            t('homepage.collections.title'),
        subtitle:
            homeSettings?.collections.subtitle[language] ||
            t('homepage.collections.subtitle'),
        card1: {
            image: homeSettings?.collections.image1Url || '/p1.jpg',
            title:
                homeSettings?.collections.card1?.title[language] ||
                t('homepage.collections.autumnCollection'),
            subtitle:
                homeSettings?.collections.card1?.subtitle[language] ||
                t('homepage.collections.autumnSubtitle'),
            link: homeSettings?.collections.card1?.link || '#',
        },
        card2: {
            image: homeSettings?.collections.image2Url || '/p2.jpg',
            title:
                homeSettings?.collections.card2?.title[language] ||
                t('homepage.collections.autumnCollection'),
            subtitle:
                homeSettings?.collections.card2?.subtitle[language] ||
                t('homepage.collections.autumnSubtitle'),
            link: homeSettings?.collections.card2?.link || '#',
        },
    }

    const categoriesData = {
        title:
            homeSettings?.categories.title[language] ||
            t('homepage.categories.title'),
        subtitle: homeSettings?.categories.title[language]
            ? undefined
            : t('homepage.categories.subtitle'), // Only use fallback if no dynamic title
        category1: {
            image: homeSettings?.categories.category1.imageUrl || '/pp1.jpg',
            title:
                homeSettings?.categories.category1.name ||
                t('homepage.categories.hauteCouture'),
            subtitle:
                homeSettings?.categories.category1.subtitle[language] || '',
            link: homeSettings?.categories.category1.link || '#',
        },
        category2: {
            image: homeSettings?.categories.category2.imageUrl || '/pp2.jpg',
            title:
                homeSettings?.categories.category2.name ||
                t('homepage.categories.jewelry'),
            subtitle:
                homeSettings?.categories.category2.subtitle[language] ||
                t('homepage.categories.jewelrySubtitle'),
            link: homeSettings?.categories.category2.link || '#',
        },
        category3: {
            image: homeSettings?.categories.category3.imageUrl || '/pp3.jpg',
            title:
                homeSettings?.categories.category3.name ||
                t('homepage.categories.accessories'),
            subtitle:
                homeSettings?.categories.category3.subtitle[language] || '',
            link: homeSettings?.categories.category3.link || '#',
        },
    }

    const creatorsData = {
        title:
            homeSettings?.creators.title[language] ||
            t('homepage.creators.title'),
        subtitle:
            homeSettings?.creators.subtitle[language] ||
            t('homepage.creators.subtitle'),
        images:
            homeSettings?.creators.images &&
            homeSettings.creators.images.length > 0
                ? homeSettings.creators.images
                : [
                      '/lg1.jpg',
                      '/lg2.png',
                      '/lg3.jpg',
                      '/lg4.jpg',
                      '/lg1.jpg',
                      '/lg2.png',
                      '/lg3.jpg',
                      '/lg4.jpg',
                      '/lg1.jpg',
                      '/lg2.png',
                      '/lg3.jpg',
                      '/lg4.jpg',
                  ],
    }
    return (
        <div className="relative min-h-[100svh] w-full">
            {/* Fullscreen video background with fade animation */}
            <div className="fixed top-0 left-0 h-full w-full">
                <video
                    ref={video1Ref}
                    key={videoData.side1.src}
                    src={videoData.side1.src}
                    className={`absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-700 ${hovered === 'right' ? 'opacity-0' : 'opacity-100'}`}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                />
                <video
                    ref={video2Ref}
                    key={videoData.side2.src}
                    src={videoData.side2.src}
                    className={`absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-700 ${hovered === 'right' ? 'opacity-100' : 'opacity-0'}`}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                />
            </div>

            {/* Bottom center overlay text for each video - Mobile Responsive - Positioned above hover divs */}
            <div className="pointer-events-none relative top-[calc(100vh-320px)] left-1/2 z-50 flex w-full -translate-x-1/2 transform justify-center px-4 sm:top-[calc(100vh-400px)] md:bottom-16 md:px-0">
                <div
                    className={`transition-opacity duration-700 ${hovered === 'right' ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="text-center">
                        <div className="font-supreme pointer-events-auto mb-2 text-lg font-medium text-white uppercase select-text text-shadow-md md:text-2xl">
                            {videoData.side1.topText}
                        </div>
                        <div className="font-recia pointer-events-auto mb-6 text-3xl leading-tight font-medium text-white uppercase select-text text-shadow-md md:mb-10 md:text-5xl">
                            {videoData.side1.mainText}
                        </div>
                        <a
                            href={videoData.side1.discoverLink}
                            className="font-supreme pointer-events-auto text-lg font-bold tracking-widest text-white underline transition-colors hover:text-gray-200 md:text-2xl"
                        >
                            {t('homepage.hero.discover')}
                        </a>
                    </div>
                    <div className="m-auto mt-8 flex max-w-20 flex-row items-center justify-center gap-2 md:mt-14 md:max-w-24">
                        <div className="h-[4px] w-[50%] rounded-2xl bg-[#D9D9D9] md:h-[5px]" />
                        <div className="h-[4px] w-[50%] rounded-2xl bg-[#7A7676] md:h-[5px]" />
                    </div>
                </div>
                <div
                    className={`absolute left-1/2 w-full -translate-x-1/2 transition-opacity duration-700 ${hovered === 'right' ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div className="text-center">
                        <div className="font-supreme pointer-events-auto mb-2 text-lg font-medium text-white uppercase select-text text-shadow-md md:text-2xl">
                            {videoData.side2.topText}
                        </div>
                        <div className="font-recia pointer-events-auto mb-6 text-3xl leading-tight font-medium text-white uppercase select-text text-shadow-md md:mb-10 md:text-5xl">
                            {videoData.side2.mainText}
                        </div>
                        <a
                            href={videoData.side2.discoverLink}
                            className="font-supreme pointer-events-auto text-lg font-bold tracking-widest text-white underline transition-colors hover:text-gray-200 md:text-2xl"
                        >
                            {t('homepage.hero.discover')}
                        </a>
                    </div>
                    <div className="m-auto mt-8 flex max-w-20 flex-row items-center justify-center gap-2 md:mt-14 md:max-w-24">
                        <div className="h-[4px] w-[50%] rounded-2xl bg-[#7A7676] md:h-[5px]" />
                        <div className="h-[4px] w-[50%] rounded-2xl bg-[#D9D9D9] md:h-[5px]" />
                    </div>
                </div>
            </div>

            <div className="relative z-0 flex h-[calc(100svh-250px)] flex-row sm:h-[calc(100svh-280px)]">
                {/* Trigger Divs - Desktop hover, Mobile touch */}
                <div
                    className="pointer-events-auto h-full w-[50vw]"
                    onMouseEnter={() => setHovered('left')}
                    onTouchStart={() => setHovered('left')}
                />
                <div
                    className="pointer-events-auto h-full w-[50vw]"
                    onMouseEnter={() => setHovered('right')}
                    onTouchStart={() => setHovered('right')}
                />
                {/* Video Control Buttons - Mobile Responsive */}
                <div className="absolute bottom-8 left-0 z-50 flex w-full justify-between px-2 md:bottom-10 md:px-4">
                    <button
                        onClick={togglePlayPause}
                        className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40 md:h-12 md:w-12"
                        aria-label={
                            isPlaying
                                ? t('homepage.controls.pauseVideo')
                                : t('homepage.controls.playVideo')
                        }
                    >
                        {isPlaying ? (
                            <Pause className="size-6 text-white md:size-7" />
                        ) : (
                            <Play className="size-6 text-white md:size-7" />
                        )}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40 md:h-12 md:w-12"
                        aria-label={
                            isMuted
                                ? t('homepage.controls.unmuteVideo')
                                : t('homepage.controls.muteVideo')
                        }
                    >
                        {isMuted ? (
                            <VolumeX className="size-6 text-white md:size-7" />
                        ) : (
                            <Volume2 className="size-6 text-white md:size-7" />
                        )}
                    </button>
                </div>
            </div>

            {/* VideoAnimation Section - Right after hero */}
            <VideoAnimation />

            {/* Second Section - Collection Cards - Mobile Responsive */}
            <section
                className="relative z-20 bg-white pt-12 md:pt-40"
                id="events"
            >
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <div
                        className="mb-12 text-center md:mb-16"
                        id="collections"
                    >
                        <h2 className="font-recia mb-8 text-3xl leading-tight font-extrabold text-[#053340] md:mb-14 md:text-5xl">
                            {collectionData.title}
                        </h2>
                        <p className="font-supreme mx-auto max-w-4xl px-4 text-lg text-gray-600 md:px-0 md:text-2xl">
                            {collectionData.subtitle}
                        </p>
                    </div>

                    <div className="flex flex-col justify-center gap-8 md:flex-row md:gap-16">
                        {collectionData.card1 && (
                            <div
                                className="group relative w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl md:w-[500px]"
                                onClick={() => {
                                    if (
                                        collectionData.card1.link &&
                                        collectionData.card1.link !== '#'
                                    ) {
                                        if (
                                            collectionData.card1.link.startsWith(
                                                'http'
                                            )
                                        ) {
                                            window.open(
                                                collectionData.card1.link,
                                                '_blank'
                                            )
                                        } else {
                                            router.push(
                                                collectionData.card1.link
                                            )
                                        }
                                    }
                                }}
                            >
                                <img
                                    src={collectionData.card1.image}
                                    alt={collectionData.card1.title}
                                    className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105 md:h-[600px]"
                                />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30 group-active:bg-black/30" />
                                <div className="absolute bottom-6 left-6 text-white md:bottom-8 md:left-8">
                                    <h3 className="font-recia mb-2 text-2xl leading-tight font-extrabold md:text-4xl">
                                        {collectionData.card1.title}
                                    </h3>
                                    <p className="font-supreme text-lg font-semibold opacity-90 md:text-2xl">
                                        {collectionData.card1.subtitle}
                                    </p>
                                </div>
                            </div>
                        )}

                        {collectionData.card2 && (
                            <div
                                className="group relative w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl md:w-[500px]"
                                onClick={() => {
                                    if (
                                        collectionData.card2.link &&
                                        collectionData.card2.link !== '#'
                                    ) {
                                        if (
                                            collectionData.card2.link.startsWith(
                                                'http'
                                            )
                                        ) {
                                            window.open(
                                                collectionData.card2.link,
                                                '_blank'
                                            )
                                        } else {
                                            router.push(
                                                collectionData.card2.link
                                            )
                                        }
                                    }
                                }}
                            >
                                <img
                                    src={collectionData.card2.image}
                                    alt={collectionData.card2.title}
                                    className="h-[400px] w-full object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105 md:h-[600px]"
                                />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30 group-active:bg-black/30" />
                                <div className="absolute bottom-6 left-6 text-white md:bottom-8 md:left-8">
                                    <h3 className="font-recia mb-2 text-2xl leading-tight font-extrabold md:text-4xl">
                                        {collectionData.card2.title}
                                    </h3>
                                    <p className="font-supreme text-lg opacity-90 md:text-xl">
                                        {collectionData.card2.subtitle}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Third Section - Expandable Categories */}
            <ExpandableCategories data={categoriesData} />

            {/* Fourth Section - 3D Photo Carousel - Mobile Responsive */}
            <section
                className="relative z-20 bg-white pt-12 pb-16 md:pt-48 md:pb-44"
                id="creators"
            >
                <div className="mx-auto max-w-7xl px-4 md:px-8">
                    <div className="mb-8 text-center md:mb-10">
                        <h2 className="font-recia mb-6 text-3xl leading-tight font-extrabold text-[#053340] md:mb-11 md:text-5xl">
                            {creatorsData.title}
                        </h2>
                        <p className="font-supreme mx-auto max-w-2xl px-4 text-lg text-gray-600 md:px-0 md:text-2xl">
                            {creatorsData.subtitle}
                        </p>
                    </div>
                    <ThreeDPhotoCarousel
                        images={creatorsData.images}
                        creators={homeSettings?.creators.creators || []}
                        autoRotateSpeed={0.05}
                        height={300}
                        cylinderWidth={2000}
                    />
                </div>
            </section>

            <Footer />
        </div>
    )
}
