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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">View Mode</h3>
            <p className="text-sm text-blue-600">
              Navigate through scenes and interact with infospots as users would experience the tour.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Edit Mode</h3>
            <p className="text-sm text-green-600">
              Click on the panorama to add new infospots and scene links. Click existing markers to edit them.
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <a 
                href="/admin/scenes" 
                className="block text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Manage Scenes
              </a>
              <a 
                href="/admin/infospots" 
                className="block text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Manage InfoSpots
              </a>
              <a 
                href="/admin/scene-links" 
                className="block text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Manage Scene Links
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}