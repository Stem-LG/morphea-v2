'use client'

import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/footer";
import NavBar from "../_components/nav_bar";

export default function OriginePage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    return (
        <div className="relative w-full min-h-screen bg-white">
            <NavBar />
            
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#053340] via-[#0a4c5c] to-[#053340] py-32 px-8">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-white mb-6 tracking-tight">
                        À l'origine de Morphea
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                        Découvrez l'histoire et la vision qui ont donné naissance à notre plateforme unique
                    </p>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-24 h-24 border border-white/20 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/20 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full"></div>
            </section>

            {/* Main Content Section */}
            <section className="py-20 px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    {/* Content will be added here */}
                    <div className="text-center text-gray-500">
                        <p className="text-lg">Le contenu sera ajouté prochainement...</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}