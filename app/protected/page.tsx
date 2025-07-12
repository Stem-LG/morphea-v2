"use client";
import { useRouter } from "next/navigation";

import VirtualTour from "@/components/virtual-tour";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedPage() {
    const router = useRouter();
    const { data: user, error, isLoading, isFetching } = useAuth();

    if (!(isLoading || isFetching) && (error || !user)) {
        router.push("/auth/login");
    }

    return (
        <div className="w-full">
            {/* Virtual Tour */}
            <VirtualTour height="100vh" width="100%" startingScene="a1" showNavbar={true} accountForNavbar={true} startingPitch={0} startingYaw={-1.57} />
        </div>
    );
}
