'use client'

import { createClient } from '@/lib/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PoweredBy } from '@/components/powered-by'

export default function Home() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event == 'PASSWORD_RECOVERY') {
                router.push('/auth/update-password')
            }
        })
    }, [router, supabase.auth])

    return (
        <div className="relative -mt-24 min-h-[calc(100svh)] w-full">
            <div className="h-96 w-full bg-black/80"></div>

            <PoweredBy />
        </div>
    )
}
