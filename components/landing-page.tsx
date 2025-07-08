'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {

    return (
        <div className="relative w-full h-screen overflow-hidden">
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
                        <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 text-white dark:text-white drop-shadow-2xl tracking-tight font-parisienne w-full">
                            Bienvenue à <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent w-full px-4">Morpheus Mall</span>
                        </h1>
                        <p className="text-2xl sm:text-3xl text-white dark:text-gray-200 mb-8 font-medium">
                            Découvrez le shopping dans une nouvelle dimension.<br />
                            Explorez notre centre commercial virtuel avec des <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-semibold">produits 3D</span> interactifs.
                        </p>
                        <div className="flex flex-col w-full gap-6">
                            <Link href="/auth/sign-up" className="w-full">
                                <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white shadow-2xl text-2xl py-5 transition-all rounded-none">
                                    Commencer
                                </Button>
                            </Link>
                            <Link href="/auth/login" className="w-full">
                                <Button
                                    variant="outline"
                                    className="w-full border-white/30 bg-white/20 text-white dark:text-white hover:bg-white/30 text-2xl py-5 transition-all rounded-none"
                                >
                                    Connexion
                                </Button>
                            </Link>
                            <Link href="/protected" className="w-full">
                                <Button
                                    variant="ghost"
                                    className="w-full text-white dark:text-white text-2xl py-5 transition-all hover:bg-white/10 hover:text-white dark:hover:text-white rounded-none"
                                >
                                    Explorer en tant qu'invité
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
