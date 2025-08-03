"use client";

import VirtualTour from "./_components/virtual-tour";

export default function MainPage() {
    // Allow both authenticated users and guests to access the virtual tour
    return (
        <div className="w-full">
            {/* Virtual Tour - accessible to both authenticated users and guests */}
            <VirtualTour
                height="100vh"
                width="100%"
                startingScene="15"
                showNavbar={true}
                accountForNavbar={true}
                startingPitch={0}
                startingYaw={-1.57}
            />
        </div>
    );
}
