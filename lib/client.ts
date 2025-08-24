import { createBrowserClient } from '@supabase/ssr'
import { Database } from './supabase'

// Singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createBrowserClient<Database, "morpheus">> | null = null

export function createClient() {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance and store it
  supabaseInstance = createBrowserClient<Database, "morpheus">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseInstance
}