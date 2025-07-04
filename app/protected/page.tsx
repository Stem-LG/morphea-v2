import { redirect } from 'next/navigation'

import { createClient } from '@/lib/server'
import VirtualTour from '@/components/virtual-tour'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen w-full">
      {/* Virtual Tour */}
      <VirtualTour 
        height="100vh"
        width="100%"
        startingScene="0-key-biscayne-2"
        showNavbar={true}
        disableAutorotate={true}
      />
    </div>
  )
}
