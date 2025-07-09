'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

export default function LandingPage() {
    const { t } = useLanguage();

    return (
        <div className="relative w-full overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Overlay Content */}
            <div
                className="landing-overlay w-full h-full absolute inset-0 z-10 flex items-center justify-center opacity-100 transition-all duration-1000"
                style={{
                    background: 'linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 100%)',
                    boxShadow: 'inset -40px 0 80px -20px rgba(0,0,0,0.5), inset 40px 0 80px -20px rgba(0,0,0,0.5)'
                }}
            >
                {/* Keep original desktop layout, improve mobile */}
                <div className="flex flex-col md:flex-row justify-center md:justify-start items-center w-full h-full px-4 sm:px-8 md:pl-16">
                    <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto md:mx-0">
                        {/* Main content wrapper */}
                        <div className="text-center md:text-left space-y-4 sm:space-y-6 md:space-y-8 py-8 md:py-0 md:p-16 md:rounded-3xl">
                            {/* Main heading - keep original desktop sizing */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white dark:text-white drop-shadow-2xl tracking-tight font-parisienne leading-tight md:mb-6">
                                <span className="block mb-2 md:mb-0 md:inline">
                                    {t('landing.welcomeTo')}
                                </span>{' '}
                                <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent block md:inline md:px-4">
                                    Morpheus Mall
                                </span>
                            </h1>
                            
                            {/* Subtitle - keep original desktop sizing */}
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white dark:text-gray-200 font-medium leading-relaxed md:mb-8">
                                {t('landing.discoverShopping')}
                                <br className="hidden sm:block" />
                                <span className="block sm:inline mt-2 sm:mt-0">
                                    {t('landing.exploreVirtual')} <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent font-semibold">{t('landing.products3d')}</span> interactifs.
                                </span>
                            </p>
                            
                            {/* Button layout - mobile responsive, desktop original */}
                            <div className="flex flex-col gap-4 sm:gap-6 w-full">
                                <Link href="/auth/sign-up" className="w-full">
                                    <Button className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white shadow-2xl text-lg sm:text-xl md:text-2xl py-4 md:py-5 transition-all rounded-none font-semibold">
                                        {t('landing.getStarted')}
                                    </Button>
                                </Link>
                                <Link href="/auth/login" className="w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full border-white/30 bg-white/20 text-white dark:text-white hover:bg-white/30 text-lg sm:text-xl md:text-2xl py-4 md:py-5 transition-all rounded-none font-semibold"
                                    >
                                        {t('landing.login')}
                                    </Button>
                                </Link>
                                <Link href="/protected" className="w-full">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-white dark:text-white text-lg sm:text-xl md:text-2xl py-4 md:py-5 transition-all hover:bg-white/10 hover:text-white dark:hover:text-white rounded-none font-medium"
                                    >
                                        {t('landing.exploreAsGuest')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
