import { ForgotPasswordForm } from '@/components/forgot-password-form'

export default function Page() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 md:p-10" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
