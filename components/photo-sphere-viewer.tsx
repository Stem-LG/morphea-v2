'use client';

import { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

interface PhotoSphereViewerProps {
  src: string;
  height?: string;
  width?: string;
  className?: string;
  children?: React.ReactNode;
  showNavbar?: boolean;
}

export default function PhotoSphereViewer({
  src,
  height = '100vh',
  width = '100%',
  className = '',
  children,
  showNavbar = true
}: PhotoSphereViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
      if (!containerRef.current) return;

      // Initialize Photo Sphere Viewer with AutorotatePlugin
      viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: src,
          loadingImg: "/loading.gif", // Optional loading image
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
          defaultYaw: 0,
          defaultPitch: 0,
          minFov: 30,
          maxFov: 90,
          navbar: showNavbar ? ["autorotate", "zoom", "fullscreen"] : false,
          plugins: [
              [
                  AutorotatePlugin,
                  {
                      autostartDelay: 2000, // Start auto-rotation after 2 seconds
                      autostartOnIdle: true, // Resume auto-rotation when idle
                      autorotateSpeed: "1rpm", // Slow rotation: 1 revolution per minute
                  },
              ],
          ],
      });

      // Start auto-rotation when the viewer is ready
      viewerRef.current.addEventListener("ready", () => {
          const autorotatePlugin = viewerRef.current?.getPlugin(AutorotatePlugin) as AutorotatePlugin;
          if (autorotatePlugin) {
              autorotatePlugin.start();
          }
      });

      // Cleanup function
      return () => {
          if (viewerRef.current) {
              viewerRef.current.destroy();
          }
      };
  }, [src, showNavbar]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ height, width }}
      />
      {children && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="pointer-events-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
