"use client";

import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PoweredBy } from "@/components/powered-by";
import Footer from "@/components/footer";
import NavBar from "./_components/nav_bar";
import ExpandableCategories from "@/components/expandable-categories";
import { ThreeDPhotoCarousel } from "@/components/three-d-photo-carousel";

export default function Home() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == "PASSWORD_RECOVERY") {
                router.push("/auth/update-password");
            }
        });
    }, [router, supabase.auth]);

    const [hovered, setHovered] = useState<'none' | 'left' | 'right'>('none');
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
        };
        
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
        };
        
        const categoriesData = {
            category1: {
                image: '/pp1.jpg',
                title: 'Haute Couture',
                subtitle: '',
                link: '#'
            },
            category2: {
                image: '/pp2.jpg',
                title: 'Bijoux',
                subtitle: 'Créations artisanales et pièces d\'exception',
                link: '#'
            },
            category3: {
                image: '/pp3.jpg',
                title: 'Accessoires',
                subtitle: '',
                link: '#'
            }
        };

        const creatorsData = {
            images: [
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
                '/lg4.jpg'
            ]
        };
    return (
        <div className="relative w-full min-h-[calc(100svh)]">
            {/* Fullscreen video background with fade animation */}
            <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
                    <video
                        key={videoData.side1.src}
                        src={videoData.side1.src}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${hovered === 'right' ? 'opacity-0' : 'opacity-100'}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    <video
                        key={videoData.side2.src}
                        src={videoData.side2.src}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${hovered === 'right' ? 'opacity-100' : 'opacity-0'}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    {/* Bottom center overlay text for each video */}
                    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
                        <div
                            className={`transition-opacity duration-700 ${hovered === 'right' ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <div className="text-center">
                                <div className="text-2xl font-medium tracking-widest mb-4 text-white/80">{videoData.side1.topText}</div>
                                <div className="text-5xl font-serif font-medium text-white mb-8">{videoData.side1.mainText}</div>
                                <a href="#" className="text-2xl font-bold underline text-white">Découvrir</a>
                            </div>
                            <div className="flex flex-row max-w-36 items-center justify-center m-auto gap-2 mt-20">
                                <div className="h-2 w-[50%] bg-[#D9D9D9] rounded-2xl" />
                                <div className="h-2 w-[50%] bg-[#7A7676] rounded-2xl" />
                            </div>
                        </div>
                        <div
                            className={`transition-opacity duration-700 absolute left-1/2 -translate-x-1/2 w-full ${hovered === 'right' ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div className="text-center">
                                <div className="text-2xl font-medium tracking-widest mb-4 text-white/80">{videoData.side2.topText}</div>
                                <div className="text-5xl font-serif font-medium text-white mb-8">{videoData.side2.mainText}</div>
                                <a href="#" className="text-2xl font-bold underline text-white">Découvrir</a>
                            </div>
                            <div className="flex flex-row max-w-36 items-center justify-center m-auto gap-2 mt-20">
                                <div className="h-2 w-[50%] bg-[#7A7676] rounded-2xl" />
                                <div className="h-2 w-[50%] bg-[#D9D9D9] rounded-2xl" />
                            </div>
                        </div>
                    </div>
            </div>
            <NavBar />
            <div className="flex flex-row h-screen relative z-10">
                {/* Trigger Divs */}
                <div
                    className="w-[50vw] h-full cursor-pointer"
                    onMouseEnter={() => setHovered('left')}
                    onMouseLeave={() => setHovered('none')}
                />
                <div
                    className="w-[50vw] h-full cursor-pointer"
                    onMouseEnter={() => setHovered('right')}
                    onMouseLeave={() => setHovered('none')}
                />
            </div>
            
            {/* Second Section - Collection Cards */}
            <section className="relative z-20 bg-white py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-[#053340] mb-6 ">
                            Découvrez Nos Défilé
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Plongez dans l'univers exclusif de nos collections à travers des présentations exceptionnelles
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {collectionData.card1 && (
                            <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
                                <img 
                                    src={collectionData.card1.image} 
                                    alt={collectionData.card1.title}
                                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-3xl font-serif font-extrabold mb-2">{collectionData.card1.title}</h3>
                                    <p className="text-lg opacity-90">{collectionData.card1.subtitle}</p>
                                </div>
                            </div>
                        )}
                        
                        {collectionData.card2 && (
                            <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
                                <img 
                                    src={collectionData.card2.image} 
                                    alt={collectionData.card2.title}
                                    className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-3xl font-serif font-extrabold mb-2">{collectionData.card2.title}</h3>
                                    <p className="text-lg opacity-90">{collectionData.card2.subtitle}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Third Section - Expandable Categories */}
            <ExpandableCategories data={categoriesData} />

            {/* Fourth Section - 3D Photo Carousel */}
            <section className="relative z-20 bg-white py-20">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif text-[#053340] font-extrabold mb-6">
                            Nos Créateurs
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez nos espaces d'exception boutique en Tunisie
                        </p>
                    </div>
                    <ThreeDPhotoCarousel 
                        images={[
                            "/lg1.jpg",
                            "/lg2.png", 
                            "/lg3.jpg",
                            "/lg4.jpg",
                            "/lg1.jpg",
                            "/lg2.png", 
                            "/lg3.jpg",
                            "/lg4.jpg",
                            "/lg1.jpg",
                            "/lg2.png", 
                            "/lg3.jpg",
                            "/lg4.jpg"
                        ]}
                        autoRotateSpeed={0.05}
                        height={600}
                        cylinderWidth={2000}
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}
