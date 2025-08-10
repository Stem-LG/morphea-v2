"use client";

import AnimatedBackground from "@/components/animated-background";
import { SignUpForm } from "@/components/sign-up-form";
import { EnhancedSignupWithVisitor } from "./_components/enhanced-signup-with-visitor";
import { useVisitorCheck } from "./_hooks/use-visitor-check";

export default function Page() {
    const { hasVisitorData, isLoading } = useVisitorCheck();

    // Show loading state while checking visitor data
    if (isLoading) {
        return (
            <div className="h-screen w-full relative overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
                <div className="absolute z-10 inset-0 bg-black/40" />
                <div className="relative z-20 flex h-full items-center justify-center p-6 md:p-10">
                    <div className="text-white text-lg">Loading...</div>
                </div>
                <AnimatedBackground />
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
            {/* Dark overlay for better form readability */}
            <div className="absolute z-10 inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-20 flex h-full items-center justify-center p-6 md:p-10 overflow-y-auto">
                {hasVisitorData ? (
                    <div className="w-full max-w-md">
                        <SignUpForm />
                    </div>
                ) : (
                    <EnhancedSignupWithVisitor showVisitorForm={true} />
                )}
            </div>

            <AnimatedBackground />
        </div>
    );
}
