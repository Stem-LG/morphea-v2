'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const { refetch } = useAuth()
  const { t } = useLanguage()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      await refetch() // Refresh auth state
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button 
      onClick={logout}
      disabled={isLoggingOut}
      className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all rounded-none disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoggingOut ? (
        <div className="flex items-center gap-2">
          <img src="/loading.gif" alt="Loading" className="h-4 w-4" />
          {t('common.logout')}...
        </div>
      ) : (
        t('common.logout')
      )}
    </Button>
  )
}
