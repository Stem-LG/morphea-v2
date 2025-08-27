import { UpdatePasswordForm } from '@/components/update-password-form'

export default function Page() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
