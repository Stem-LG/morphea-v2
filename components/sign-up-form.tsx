'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/hooks/useLanguage'
import { useVisitorData } from '@/hooks/useVisitorData'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const { visitorData, isLoading: isLoadingVisitor } = useVisitorData()

  // Prefill form with visitor data when available
  useEffect(() => {
    if (visitorData && !isLoadingVisitor) {
      if (visitorData.yvisiteurnom && !name) {
        setName(visitorData.yvisiteurnom)
      }
      if (visitorData.yvisiteuremail && !email) {
        setEmail(visitorData.yvisiteuremail)
      }
    }
  }, [visitorData, isLoadingVisitor, name, email])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      setIsLoading(false)
      return
    }

    if (!name.trim()) {
      setError(t('auth.nameRequired'))
      setIsLoading(false)
      return
    }

    try {
      // Get current user (should be anonymous)
      const { data: currentUserData } = await supabase.auth.getUser()
      const currentUser = currentUserData?.user

      // Sign up with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/main`,
          data: {
            full_name: name.trim()
          }
        },
      })

      if (signUpError) throw signUpError

      // If we had visitor data and a current anonymous user, update the visitor record
      if (visitorData && currentUser && signUpData.user) {
        try {
          await supabase
            .schema('morpheus')
            .from('yvisiteur')
            .update({
              yuseridfk: signUpData.user.id,
              yvisiteurnom: name.trim(),
              yvisiteuremail: email
            })
            .eq('yvisiteurid', visitorData.yvisiteurid)
        } catch (updateError) {
          console.error('Error updating visitor record:', updateError)
          // Don't fail the signup if visitor update fails
        }
      }

      router.push('/auth/sign-up-success')
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
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{t('auth.signUp')}</h2>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-lg font-medium">{t('auth.name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('auth.namePlaceholder')}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-lg font-medium">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-lg font-medium">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.createPasswordPlaceholder')}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-white text-lg font-medium">{t('auth.confirmPassword')}</Label>
            <Input
              id="repeat-password"
              type="password"
              placeholder={t('auth.repeatPasswordPlaceholder')}
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
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
                {t('auth.creatingAccount')}
              </div>
            ) : (
              t('auth.createAccount')
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
          {t('auth.backToHome')}
        </Link>
      </div>
    </div>
  )
}
