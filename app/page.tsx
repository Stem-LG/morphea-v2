"use client";

import AnimatedBackground from "@/components/animated-background";
import LandingPage from "@/components/landing-page";
import { PoweredBy } from "@/components/powered-by";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

    return (
        <section className="relative w-full">
            <LandingPage />
            {/* Animated 360° Background */}
            <AnimatedBackground />
            {/* Powered By Footer */}
            <PoweredBy />
        </section>
    );
}
