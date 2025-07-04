import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import VirtualTour from '@/components/virtual-tour'

export default async function VirtualToursPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen w-full">
      {/* Page Header */}
      <div className="absolute top-20 left-4 right-4 z-20">
        <div className="bg-black/70 text-white px-6 py-4 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">360° World Tour</h1>
          <p className="text-gray-300">
            Explore Key Biscayne through immersive 360° panoramic views
          </p>
        </div>
      </div>

      {/* Virtual Tour */}
      <VirtualTour 
        height="100vh"
        width="100%"
        startingScene="0-key-biscayne-2"
        showNavbar={true}
      />
    </div>
  )
}
