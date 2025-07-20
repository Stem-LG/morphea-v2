"use client";

import LandingPage from "@/components/landing-page";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                router.push("/auth/update-password");
            }
        });
    }, []);

    return (
        <section className="relative w-full">
            {/* Landing page as background */}
            <LandingPage />
        </section>
    );
}
