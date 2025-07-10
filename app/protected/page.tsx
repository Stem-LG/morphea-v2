"use client";
import { redirect } from "next/navigation";

import VirtualTour from "@/components/virtual-tour";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedPage() {
    const { data: user, error, isLoading, isFetching } = useAuth();

    if (!(isLoading || isFetching) && (error || !user)) {
        redirect("/auth/login");
    }

    return (
        <div className="w-full">
            {/* Virtual Tour */}
            <VirtualTour height="100vh" width="100%" startingScene="i1" showNavbar={true} accountForNavbar={true} />
        </div>
    );
}
