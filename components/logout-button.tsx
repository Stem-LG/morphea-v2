'use client'

import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button 
      onClick={logout}
      className="bg-gradient-to-r from-[#785730] to-[#e9d079] hover:from-[#695029] hover:to-[#d4c066] text-white px-4 py-2 transition-all rounded-none"
    >
      Logout
    </Button>
  )
}
