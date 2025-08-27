'use client'

import { Button } from "@/components/ui/button"
import { useLanguage } from '@/hooks/useLanguage'
import Link from "next/link"

export default function Page() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
          {/* Welcome header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#05141D] to-[#063846] rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-recia text-4xl md:text-5xl font-extrabold text-[#05141D] mb-4 leading-tight">
              {t('auth.thankYouForSigningUp')}
            </h1>
            <p className="font-supreme text-lg text-[#063846] max-w-md mx-auto mb-8">
              {t('auth.checkEmailToConfirm')}
            </p>
            
            <Button asChild className="bg-gradient-to-r from-[#05141D] to-[#063846] hover:from-[#04111a] hover:to-[#052d37] text-white h-11 px-8 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl rounded-md transform hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/main">
                Continue to Morpheus Mall
              </Link>
            </Button>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-slate-500 hover:text-[#05141D] transition-colors inline-flex items-center gap-2"
            >
              {t("auth.backToMorpheusMall") || "← Back to Morpheus Mall"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
