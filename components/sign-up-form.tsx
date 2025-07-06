'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
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
            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">Morpheus Mall</span>
          </h1>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 font-parisienne">Join the Future</h2>
          <p className="text-lg text-gray-300">Create your account and explore virtual shopping</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-lg font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-lg font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-white text-lg font-medium">Confirm Password</Label>
            <Input
              id="repeat-password"
              type="password"
              placeholder="Repeat your password"
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
            className="w-full bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-morpheus-gold-light hover:text-[#d4c066] font-semibold underline underline-offset-4 transition-colors"
            >
              Sign In
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
          ← Back to Morpheus Mall
        </Link>
      </div>
    </div>
  )
}
