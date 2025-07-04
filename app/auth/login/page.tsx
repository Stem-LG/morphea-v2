import { LoginForm } from '@/components/login-form'
import PhotoSphereViewer from '@/components/photo-sphere-viewer'

export default function Page() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* 360° Background */}
      <div className="absolute inset-0">
        <PhotoSphereViewer
          src="/landing.png"
          height="100vh"
          width="100%"
          showNavbar={false}
        />
      </div>

      {/* Dark overlay for better form readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
