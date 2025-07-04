'use client';

import PhotoSphereViewer from '@/components/photo-sphere-viewer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
    const [isExploring, setIsExploring] = useState(false);

    const handleExploreClick = () => {
        // Remove the overlay to reveal the full 360° experience
        const overlay = document.querySelector('.landing-overlay');
        if (overlay) {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.classList.remove('opacity-100');
            setIsExploring(true);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* 360° Background */}
            <PhotoSphereViewer
                src="/landing.png"
                height="100vh"
                width="100%"
                className="absolute inset-0"
                showNavbar={isExploring}
            >
                {/* Overlay Content */}
                <div
                    className="landing-overlay w-full h-[100vh] absolute inset-0 z-10 flex items-center justify-center opacity-100 transition-all duration-1000"
                    style={{
                        background: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 100%)',
                        boxShadow: 'inset -40px 0 80px -20px rgba(0,0,0,0.5), inset 40px 0 80px -20px rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="flex flex-row justify-start items-center w-full h-full pl-16">
                        <div
                            className="max-w-2xl rounded-3xl p-16"
                        >
                            <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 text-white dark:text-white drop-shadow-2xl tracking-tight">
                                Welcome to <span className="text-teal-400">360 Mall</span>
                            </h1>
                            <p className="text-2xl sm:text-3xl text-white dark:text-gray-200 mb-8 font-medium">
                                Experience shopping in a new dimension.<br />
                                Explore our virtual mall with immersive <span className="text-teal-300 font-semibold">360° views</span> and interactive <span className="text-teal-300 font-semibold">3D products</span>.
                            </p>
                            <div className="flex flex-col w-full gap-6">
                                <Link href="/auth/sign-up" className="w-full">
                                    <Button className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white shadow-2xl text-2xl py-5 rounded-xl transition-all">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="/auth/login" className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/30 bg-white/20 text-white dark:text-white hover:bg-white/30 text-2xl py-5 rounded-xl transition-all"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/protected" className="w-full">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-white dark:text-white text-2xl py-5 rounded-xl transition-all hover:bg-white/10 hover:text-white dark:hover:text-white"
                                    >
                                        Explore as Guest
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {/* <div className='w-full items-center flex justify-center'>
                            <button
                                onClick={handleExploreClick}
                                className="group relative p-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
                                aria-label="Explore 360° View"
                            >
                                <img
                                    src="/explore.svg"
                                    alt="Explore 360° Mall"
                                    className='w-32 h-auto transition-transform duration-300 group-hover:rotate-12'
                                />
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Explore 360°
                                </div>
                            </button>
                        </div> */}
                    </div>
                </div>
            </PhotoSphereViewer>

            {/* Navigation Hint - Only show when exploring */}
            {isExploring && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full z-20 animate-fade-in">
                    <span className="hidden sm:inline">Drag to look around • Scroll to zoom • </span>
                    Click and drag to explore
                </div>
            )}
        </div>
    );
}
