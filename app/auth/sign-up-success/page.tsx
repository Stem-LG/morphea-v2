'use client'

import AnimatedBackground from "@/components/animated-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLanguage } from '@/hooks/useLanguage'

export default function Page() {
  const { t } = useLanguage()
  
  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Dark overlay for better form readability */}
      <div className="absolute z-10 inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-20 flex h-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">{t('auth.thankYouForSigningUp')}</CardTitle>
              <CardDescription className="text-gray-300">{t('auth.checkEmailToConfirm')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                {t('auth.signUpSuccessMessage')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatedBackground />
    </div>
  )
}
