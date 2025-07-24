'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/main')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('auth.errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>
      {/* Header */}
      <div className="text-center space-y-4">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-extrabold text-white font-parisienne">
            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">{t('auth.morpheusMall')}</span>
          </h1>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 font-parisienne">{t('auth.resetYourPassword')}</h2>
          <p className="text-lg text-gray-300">{t('auth.pleaseEnterNewPassword')}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-lg font-medium">{t('auth.newPassword')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.newPasswordPlaceholder')}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <img src="/loading.gif" alt="Loading" className="h-5 w-5" />
                {t('auth.saving')}
              </div>
            ) : (
              t('auth.saveNewPassword')
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-300">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/login"
              className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Back to home */}
      <div className="text-center">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
        >
          {t('auth.backToMorpheusMall')}
        </Link>
      </div>
    </div>
  )
}
