import { SignUpForm } from '@/components/sign-up-form'

export default function Page() {
  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Dark overlay for better form readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
