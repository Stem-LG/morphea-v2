'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VideoAnimation() {
    const [isAnimated, setIsAnimated] = useState(false);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Start animation after 2 seconds
        const timer = setTimeout(() => {
            setIsAnimated(true);
        }, 2000);

        // Show text after the container animation completes (2s + 0.5s delay + 1.5s duration = 4s total)
        const textTimer = setTimeout(() => {
            setShowText(true);
        }, 4000);

        return () => {
            clearTimeout(timer);
            clearTimeout(textTimer);
        };
    }, []);

    return (
        <div className="overflow-hidden relative h-[50vh] bg-white">
            {/* Container that slides to the right */}
            <motion.div 
                className="bg-white flex flex-col items-center justify-center relative h-full"
                initial={{ x: 0 }}
                animate={{ x: isAnimated ? "25%" : 0 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            >
                {/* Logo - animates from large at top to small at bottom */}
                <motion.img 
                    src="/images/morph_logo.webp" 
                    alt="Logo" 
                    className="absolute"
                    initial={{ 
                        height: "500px", 
                        top: "-30px" 
                    }}
                    animate={{ 
                        height: isAnimated ? "100px" : "500px",
                        top: isAnimated ? "400px" : "-30px"
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                
                {/* Video - stays in same position */}
                <video 
                    src="/vid.mp4" 
                    autoPlay 
                    loop 
                    muted 
                    className="max-w-[400px] absolute top-[0px]"
                />
            </motion.div>

            {/* Text content that fades in from the left */}
            <motion.div 
                className="absolute left-0 top-0 h-full w-4/7 flex items-center justify-center pl-48"
                initial={{ 
                    opacity: 0, 
                    x: -100 
                }}
                animate={{ 
                    opacity: showText ? 1 : 0, 
                    x: showText ? 0 : -100 
                }}
                transition={{ 
                    duration: 1.2, 
                    ease: "easeOut" 
                }}
            >
                <div className='flex flex-col gap-6'>
                    <p className='text-7xl text-center font-semibold text-[#0E4D66] font-serif'>À L'origine de Morphea</p>
                    <p className='text-4xl text-center text-[#9A9A9A] font-serif'>A l'origine de Morphea, cet espace dédié à la mode de luxe, il y a Morpheus le Créateur d'expériences uniques où mode, art de vivre et luxe se rencontrent et révèlent des talents et des savoir-faire d'exception qui allient héritages et innovation.</p>
                    <div className="flex justify-center">
                        <button className="px-6 py-3 bg-gradient-to-r from-[#0E4D66] to-[#063846] text-white text-xl rounded-[30px] hover:bg-gray-500 hover:bg-none transition w-fit">
                            En savoir plus
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}