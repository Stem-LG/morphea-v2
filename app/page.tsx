"use client";

import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PoweredBy } from "@/components/powered-by";
import NavBar from "./_components/nav_bar";

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
        <div className="relative w-full min-h-[calc(100svh)]">
            <NavBar />
            <div className="h-96 w-full bg-black/80"></div>

            <PoweredBy />
        </div>
    );
}
