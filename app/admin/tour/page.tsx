import { Suspense } from 'react'
import TourAdminViewer from '../_components/tour-admin-viewer'

export default function TourAdminPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Virtual Tour Admin</h1>
        <p className="text-gray-600 mt-2">
          Manage your virtual tour with integrated viewer and editing capabilities
        </p>
      </div>
      
      <div className="space-y-6">
        <Suspense fallback={
          <div className="border rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-100" style={{ height: '80vh' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading virtual tour admin...</p>
            </div>
          </div>
        }>
          <TourAdminViewer
            height="80vh"
            className="border rounded-lg overflow-hidden shadow-lg"
          />
        </Suspense>
      </div>
    </div>
  )
}