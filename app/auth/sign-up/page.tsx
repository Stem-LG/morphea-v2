"use client";

import { SignUpForm } from "@/components/sign-up-form";
import { EnhancedSignupWithVisitor } from "./_components/enhanced-signup-with-visitor";
import { useVisitorCheck } from "./_hooks/use-visitor-check";

export default function Page() {
    const { hasVisitorData, isLoading } = useVisitorCheck();

    // Show loading state while checking visitor data
    if (isLoading) {
        return (
            <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
                <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
                    <div className="text-[#05141D] text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
                {hasVisitorData ? (
                    <div className="w-full max-w-lg">
                        <SignUpForm />
                    </div>
                ) : (
                    <EnhancedSignupWithVisitor showVisitorForm={true} />
                )}
            </div>
        </div>
    );
}
