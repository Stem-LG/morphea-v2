import AnimatedBackground from "@/components/animated-background";
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export default function Page() {
  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>

      {/* Content */}
      <div className="relative z-20 flex h-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
