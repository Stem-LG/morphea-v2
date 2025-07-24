import { createClient } from '@/lib/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const _next = searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error && data.user) {
      // Ensure user metadata is properly set after email confirmation
      if (data.user.user_metadata?.full_name) {
        try {
          await supabase.auth.updateUser({
            data: { full_name: data.user.user_metadata.full_name }
          })
        } catch (updateError) {
          console.error('Error updating user metadata after confirmation:', updateError)
          // Don't fail the confirmation process if metadata update fails
        }
      }
      
      // redirect user to specified redirect URL or root of app
      redirect(next)
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`)
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`)
}
