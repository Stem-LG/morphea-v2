'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function LogoutButton() {
  const router = useRouter()
  const { refetch } = useAuth()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    await refetch() // Refresh auth state
    router.push('/auth/login')
  }

  return (
    <Button 
      onClick={logout}
      className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all rounded-none"
    >
      Logout
    </Button>
  )
}
