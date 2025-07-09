'use client'

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
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('auth.thankYouForSigningUp')}</CardTitle>
              <CardDescription>{t('auth.checkEmailToConfirm')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('auth.signUpSuccessMessage')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
