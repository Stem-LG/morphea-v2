'use client';

import PhotoSphereViewer from '@/components/photo-sphere-viewer';
import { usePathname } from 'next/navigation';

export default function AnimatedBackground() {
    const pathname = usePathname();
    
    // Show background only on landing page and auth pages
    const showBackground = pathname === '/' || pathname.startsWith('/auth/');
    
    if (!showBackground) return null;
    
    return (
        <div className="fixed inset-0 z-0">
            <PhotoSphereViewer
                src="https://b8cfjlonmr.ufs.sh/f/kMrcl2nedu5fW3AV98q5ZqWdC1TvExe80rLJOnRX4Hc7liaF"
                height="100vh"
                width="100%"
                className="absolute inset-0"
                showNavbar={false}
            />
        </div>
    );
}
