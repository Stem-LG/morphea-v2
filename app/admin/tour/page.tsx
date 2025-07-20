import { Suspense } from 'react'
import TourAdminViewer from '../_components/tour-admin-viewer'

export default function TourAdminPage() {
  return (
    <div className="w-full" style={{ height: 'calc(100vh - 4rem)' }}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading virtual tour admin...</p>
          </div>
        </div>
      }>
        <TourAdminViewer
          height="calc(100vh - 4rem)"
          className="w-full h-full"
        />
      </Suspense>
    </div>
  )
}