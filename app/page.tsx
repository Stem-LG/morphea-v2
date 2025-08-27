'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Footer from '@/components/footer'
import NavBar from './_components/nav_bar'
import ExpandableCategories from '@/components/expandable-categories'
import { ThreeDPhotoCarousel } from '@/components/three-d-photo-carousel'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

export default function Home() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

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

    // Video and overlay data in JSON format for future API integration
    const videoData = {
        side1: {
            src: '/v1.mp4',
            topText: 'MODE',
            mainText: 'PRÉ-COLLECTION 2026/27',
        },
        side2: {
            src: '/v2.mp4',
            topText: 'PRÉ-COLLECTION 2026/27',
            mainText: 'COLLECTION ÉTÉ 2026',
        },
    }

    const collectionData = {
        card1: {
            image: '/p1.jpg',
            title: 'Collection Automne 2025',
            subtitle: 'Une symphonie de couleurs automnales',
        },
        card2: {
            image: '/p2.jpg',
            title: 'Collection Automne 2025',
            subtitle: 'Une symphonie de couleurs automnales',
        },
    }

    const categoriesData = {
        category1: {
            image: '/pp1.jpg',
            title: 'Haute Couture',
            subtitle: '',
            link: '#',
        },
        category2: {
            image: '/pp2.jpg',
            title: 'Bijoux',
            subtitle: "Créations artisanales et pièces d'exception",
            link: '#',
        },
        category3: {
            image: '/pp3.jpg',
            title: 'Accessoires',
            subtitle: '',
            link: '#',
        },
    }

    // const creatorsData = {
    //     images: [
    //         '/lg1.jpg',
    //         '/lg2.png',
    //         '/lg3.jpg',
    //         '/lg4.jpg',
    //         '/lg1.jpg',
    //         '/lg2.png',
    //         '/lg3.jpg',
    //         '/lg4.jpg',
    //         '/lg1.jpg',
    //         '/lg2.png',
    //         '/lg3.jpg',
    //         '/lg4.jpg'
    //     ]
    // };
    return (
        <div className="relative min-h-[calc(100svh)] w-full">
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

                {/* Bottom center overlay text for each video */}
                <div className="absolute bottom-16 left-1/2 z-10 flex w-full -translate-x-1/2 transform justify-center">
                    <div
                        className={`transition-opacity duration-700 ${hovered === 'right' ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <div className="text-center">
                            <div className="font-supreme pointer-events-auto mb-2 text-2xl font-medium text-white uppercase select-text text-shadow-md">
                                {videoData.side1.topText}
                            </div>
                            <div className="font-recia pointer-events-auto mb-10 text-5xl font-medium text-white uppercase select-text text-shadow-md">
                                {videoData.side1.mainText}
                            </div>
                            <a
                                href="#"
                                className="font-supreme pointer-events-auto text-2xl font-bold tracking-widest text-white underline"
                            >
                                Découvrir
                            </a>
                        </div>
                        <div className="m-auto mt-14 flex max-w-24 flex-row items-center justify-center gap-2">
                            <div className="h-[5px] w-[50%] rounded-2xl bg-[#D9D9D9]" />
                            <div className="h-[5px] w-[50%] rounded-2xl bg-[#7A7676]" />
                        </div>
                    </div>
                    <div
                        className={`absolute left-1/2 w-full -translate-x-1/2 transition-opacity duration-700 ${hovered === 'right' ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="text-center">
                            <div className="font-supreme pointer-events-auto mb-2 text-2xl font-medium text-white uppercase select-text text-shadow-md">
                                {videoData.side2.topText}
                            </div>
                            <div className="font-recia pointer-events-auto mb-10 text-5xl font-medium text-white uppercase select-text text-shadow-md">
                                {videoData.side2.mainText}
                            </div>
                            <a
                                href="#"
                                className="font-supreme pointer-events-auto text-2xl font-bold tracking-widest text-white underline"
                            >
                                Découvrir
                            </a>
                        </div>
                        <div className="m-auto mt-14 flex max-w-24 flex-row items-center justify-center gap-2">
                            <div className="h-[5px] w-[50%] rounded-2xl bg-[#7A7676]" />
                            <div className="h-[5px] w-[50%] rounded-2xl bg-[#D9D9D9]" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative z-0 flex h-svh flex-row">
                {/* Trigger Divs */}
                <div
                    className="pointer-events-auto h-full w-[50vw]"
                    onMouseEnter={() => setHovered('left')}
                />
                <div
                    className="pointer-events-auto h-full w-[50vw]"
                    onMouseEnter={() => setHovered('right')}
                />
                {/* Video Control Buttons */}
                <div className="absolute bottom-40 left-0 z-50 flex w-full justify-between px-14">
                    <button
                        onClick={togglePlayPause}
                        className="flex h-12 w-12 items-center justify-center"
                        aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    >
                        {isPlaying ? (
                            <Pause className="size-7 text-white" />
                        ) : (
                            <Play className="size-7 text-white" />
                        )}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="flex h-12 w-12 items-center justify-center"
                        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                        {isMuted ? (
                            <VolumeX className="size-7 text-white" />
                        ) : (
                            <Volume2 className="size-7 text-white" />
                        )}
                    </button>
                </div>
            </div>

            {/* Second Section - Collection Cards */}
            <section className="relative z-20 bg-white pt-20">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="mb-16 text-center">
                        <h2 className="font-recia mb-14 text-5xl font-extrabold text-[#053340] md:text-5xl">
                            Découvrez Nos Défilé
                        </h2>
                        <p className="font-supreme mx-auto max-w-4xl text-2xl text-gray-600">
                            {
                                "Plongez dans l'univers exclusif de nos collections à travers des présentations exceptionnelles"
                            }
                        </p>
                    </div>

                    <div className="flex justify-center gap-16">
                        {collectionData.card1 && (
                            <div className="group relative w-[500px] cursor-pointer overflow-hidden rounded-2xl">
                                <img
                                    src={collectionData.card1.image}
                                    alt={collectionData.card1.title}
                                    className="h-[600px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="font-recia mb-2 text-4xl font-extrabold">
                                        {collectionData.card1.title}
                                    </h3>
                                    <p className="font-supreme text-2xl font-semibold opacity-90">
                                        {collectionData.card1.subtitle}
                                    </p>
                                </div>
                            </div>
                        )}

                        {collectionData.card2 && (
                            <div className="group relative w-[500px] cursor-pointer overflow-hidden rounded-2xl">
                                <img
                                    src={collectionData.card2.image}
                                    alt={collectionData.card2.title}
                                    className="h-[600px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="font-recia mb-2 text-4xl font-extrabold">
                                        {collectionData.card2.title}
                                    </h3>
                                    <p className="font-supreme text-xl opacity-90">
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

            {/* Fourth Section - 3D Photo Carousel */}
            <section className="relative z-20 bg-white pt-16 pb-44">
                <div className="mx-auto max-w-7xl px-8">
                    <div className="mb-10 text-center">
                        <h2 className="mb-11 font-recia text-5xl font-extrabold text-[#053340]">
                            Nos Créateurs
                        </h2>
                        <p className="mx-auto font-supreme max-w-2xl text-2xl text-gray-600">
                            {
                                "Découvrez nos espaces d'exception boutique en Tunisie"
                            }
                        </p>
                    </div>
                    <ThreeDPhotoCarousel
                        images={[
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
                        ]}
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
