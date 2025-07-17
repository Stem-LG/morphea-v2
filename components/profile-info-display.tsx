"use client";

import { User } from '@supabase/supabase-js';
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileInfoDisplayProps {
  user: User;
}

export function ProfileInfoDisplay({ user }: ProfileInfoDisplayProps) {
  const { t } = useLanguage();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center pb-6 border-b border-morpheus-gold-dark/30">
        <h2 className="text-2xl font-bold text-white mb-2">
          Profile Information
        </h2>
        <p className="text-gray-300">
          Your account details and information
        </p>
      </div>

      {/* User Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Address */}
        <div className="space-y-2">
          <label className="text-white text-lg font-medium">
            Email Address
          </label>
          <div className="bg-slate-700/50 border border-slate-600 text-white p-4 rounded-none">
            <div className="flex items-center gap-3">
              <svg 
                className="w-5 h-5 text-morpheus-gold-light" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                />
              </svg>
              <span className="text-lg">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Account Created */}
        <div className="space-y-2">
          <label className="text-white text-lg font-medium">
            Account Created
          </label>
          <div className="bg-slate-700/50 border border-slate-600 text-white p-4 rounded-none">
            <div className="flex items-center gap-3">
              <svg 
                className="w-5 h-5 text-morpheus-gold-light" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" 
                />
              </svg>
              <span className="text-lg">{formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Last Login */}
        <div className="space-y-2">
          <label className="text-white text-lg font-medium">
            Last Login
          </label>
          <div className="bg-slate-700/50 border border-slate-600 text-white p-4 rounded-none">
            <div className="flex items-center gap-3">
              <svg 
                className="w-5 h-5 text-morpheus-gold-light" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="text-lg">{formatDate(user.last_sign_in_at)}</span>
            </div>
          </div>
        </div>

        {/* User ID (for reference) */}
        <div className="space-y-2">
          <label className="text-white text-lg font-medium">
            User ID
          </label>
          <div className="bg-slate-700/50 border border-slate-600 text-white p-4 rounded-none">
            <div className="flex items-center gap-3">
              <svg 
                className="w-5 h-5 text-morpheus-gold-light" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" 
                />
              </svg>
              <span className="text-sm font-mono break-all">{user.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional User Metadata (if available) */}
      {(user.user_metadata && Object.keys(user.user_metadata).length > 0) && (
        <div className="space-y-2">
          <label className="text-white text-lg font-medium">
            Additional Information
          </label>
          <div className="bg-slate-700/50 border border-slate-600 text-white p-4 rounded-none">
            <div className="space-y-2">
              {user.user_metadata.full_name && (
                <div className="flex items-center gap-3">
                  <svg 
                    className="w-5 h-5 text-morpheus-gold-light" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  <span>
                    <span className="text-gray-300">Name:</span> {user.user_metadata.full_name}
                  </span>
                </div>
              )}
              {user.user_metadata.avatar_url && (
                <div className="flex items-center gap-3">
                  <svg 
                    className="w-5 h-5 text-morpheus-gold-light" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <span>
                    <span className="text-gray-300">Avatar:</span> Available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}