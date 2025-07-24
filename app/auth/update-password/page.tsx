import AnimatedBackground from "@/components/animated-background";
import { UpdatePasswordForm } from '@/components/update-password-form'

export default function Page() {
  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Dark overlay for better form readability */}
      <div className="absolute z-10 inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-20 flex h-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <UpdatePasswordForm />
        </div>
      </div>

      <AnimatedBackground />
    </div>
  )
}
