"use client";

import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileInfoDisplay } from "@/components/profile-info-display";
import { ProfileInfoEdit } from "@/components/profile-info-edit";
import { PasswordChangeForm } from "@/components/password-change-form";
import { ActivitySummary } from "@/components/activity-summary";
import { PreferencesManagement } from "@/components/preferences-management";
import { AccountDeletionSection } from "@/components/account-deletion-section";
import { profileService, ProfileUpdateData } from "@/lib/profile-service";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
    const { data: currentUser, isLoading, refetch } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Component state
    const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security' | 'preferences'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showAccountDeletion, setShowAccountDeletion] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !currentUser) {
            router.push("/auth/login");
        }
    }, [currentUser, isLoading, router]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Handle profile save
    const handleProfileSave = async (data: ProfileUpdateData) => {
        setIsUpdating(true);
        setMessage(null);

        try {
            const result = await profileService.updateProfile(data);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setIsEditing(false);

                // Refresh user data to show updated information
                await refetch();

                // Also invalidate the auth query to ensure fresh data
                queryClient.invalidateQueries({ queryKey: ['authUser'] });
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error: any) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: 'An unexpected error occurred while updating your profile.' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle edit cancel
    const handleEditCancel = () => {
        setIsEditing(false);
        setMessage(null);
    };

    // Handle edit mode toggle
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setShowPasswordChange(false);
        setMessage(null);
    };

    // Handle password change success
    const handlePasswordChangeSuccess = () => {
        setMessage({
            type: 'success',
            text: 'Password changed successfully. You will need to sign in again with your new password.'
        });
        setShowPasswordChange(false);

        // Sign out user after successful password change
        setTimeout(() => {
            router.push('/auth/login');
        }, 2000);
    };

    // Handle password change error
    const handlePasswordChangeError = (error: string) => {
        setMessage({ type: 'error', text: error });
    };

    // Handle password change toggle
    const handlePasswordChangeToggle = () => {
        setShowPasswordChange(!showPasswordChange);
        setShowAccountDeletion(false);
        setIsEditing(false);
        setMessage(null);
    };

    // Handle account deletion toggle
    const handleAccountDeletionToggle = () => {
        setShowAccountDeletion(!showAccountDeletion);
        setShowPasswordChange(false);
        setIsEditing(false);
        setMessage(null);
    };

    // Handle account deletion
    const handleAccountDeletion = async (password: string) => {
        try {
            const result = await profileService.deleteAccount(password);

            if (result.success) {
                setMessage({ type: 'success', text: result.message });

                // Sign out and redirect to home page after successful deletion
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Account deletion error:', error);
            throw new Error(error.message || 'Failed to delete account');
        }
    };

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="h-screen w-full relative overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
                {/* Dark overlay for better readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Loading Content */}
                <div className="relative z-10 flex h-full items-center justify-center p-6">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full mx-auto"></div>
                        <p className="text-white text-lg">{t("nav.loading")}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen w-full relative overflow-auto" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            {/* Dark overlay for better readability */}
            <div className="absolute inset-0 bg-black/90" />

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-10">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Profile Header */}
                    <div className="text-center space-y-3 sm:space-y-4 mb-4 sm:mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                            <span className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                User Profile
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 px-2 sm:px-4 max-w-2xl mx-auto">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    {/* Success/Error Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-none border ${message.type === 'success'
                                ? 'bg-green-900/50 border-green-500 text-green-100'
                                : 'bg-red-900/50 border-red-500 text-red-100'
                            }`}>
                            <div className="flex items-center gap-3">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <span className="font-medium">{message.text}</span>
                                <button
                                    onClick={() => setMessage(null)}
                                    className="ml-auto text-current hover:opacity-70"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="mb-8">
                        {/* Mobile Tab Navigation - Dropdown Style */}
                        <div className="md:hidden mb-4">
                            <select
                                value={activeTab}
                                onChange={(e) => {
                                    const newTab = e.target.value as 'profile' | 'activity' | 'security' | 'preferences';
                                    setActiveTab(newTab);
                                    setIsEditing(false);
                                    setShowPasswordChange(false);
                                    setShowAccountDeletion(false);
                                    setMessage(null);
                                }}
                                className="w-full bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 text-white p-4 text-lg font-semibold backdrop-blur-sm focus:border-morpheus-gold-light focus:ring-morpheus-gold-light/20 rounded-none"
                            >
                                <option value="profile" className="bg-morpheus-blue-dark text-white">👤 Profile</option>
                                <option value="activity" className="bg-morpheus-blue-dark text-white">📊 Activity</option>
                                <option value="security" className="bg-morpheus-blue-dark text-white">🔒 Security</option>
                                <option value="preferences" className="bg-morpheus-blue-dark text-white">⚙️ Preferences</option>
                            </select>
                        </div>

                        {/* Desktop Tab Navigation - Button Style */}
                        <div className="hidden md:block">
                            <div className="flex flex-wrap justify-center gap-2 bg-gradient-to-br from-morpheus-blue-dark/60 to-morpheus-blue-light/40 border border-morpheus-gold-dark/30 p-2 backdrop-blur-sm">
                                <button
                                    onClick={() => {
                                        setActiveTab('profile');
                                        setIsEditing(false);
                                        setShowPasswordChange(false);
                                        setShowAccountDeletion(false);
                                        setMessage(null);
                                    }}
                                    className={`px-4 lg:px-6 py-3 font-semibold transition-all duration-300 text-sm lg:text-base ${activeTab === 'profile'
                                            ? 'bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-morpheus-gold-dark/20'
                                        }`}
                                >
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="hidden sm:inline">Profile</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('activity');
                                        setIsEditing(false);
                                        setShowPasswordChange(false);
                                        setShowAccountDeletion(false);
                                        setMessage(null);
                                    }}
                                    className={`px-4 lg:px-6 py-3 font-semibold transition-all duration-300 text-sm lg:text-base ${activeTab === 'activity'
                                            ? 'bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-morpheus-gold-dark/20'
                                        }`}
                                >
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="hidden sm:inline">Activity</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('security');
                                        setIsEditing(false);
                                        setShowPasswordChange(false);
                                        setShowAccountDeletion(false);
                                        setMessage(null);
                                    }}
                                    className={`px-4 lg:px-6 py-3 font-semibold transition-all duration-300 text-sm lg:text-base ${activeTab === 'security'
                                            ? 'bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-morpheus-gold-dark/20'
                                        }`}
                                >
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="hidden sm:inline">Security</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('preferences');
                                        setIsEditing(false);
                                        setShowPasswordChange(false);
                                        setShowAccountDeletion(false);
                                        setMessage(null);
                                    }}
                                    className={`px-4 lg:px-6 py-3 font-semibold transition-all duration-300 text-sm lg:text-base ${activeTab === 'preferences'
                                            ? 'bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-morpheus-gold-dark/20'
                                        }`}
                                >
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="hidden sm:inline">Preferences</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gradient-to-br from-morpheus-blue-dark/90 to-morpheus-blue-light/80 border border-morpheus-gold-dark/30 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-sm">
                        {activeTab === 'profile' && (
                            <>
                                {!isEditing ? (
                                    <>
                                        <ProfileInfoDisplay user={currentUser} />

                                        {/* Action Buttons */}
                                        <div className="mt-8 pt-6 border-t border-morpheus-gold-dark/30">
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button
                                                    onClick={handleEditToggle}
                                                    disabled={isUpdating}
                                                    className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Profile
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <ProfileInfoEdit
                                        user={currentUser}
                                        onSave={handleProfileSave}
                                        onCancel={handleEditCancel}
                                        isLoading={isUpdating}
                                    />
                                )}
                            </>
                        )}

                        {activeTab === 'activity' && (
                            <ActivitySummary />
                        )}

                        {activeTab === 'security' && (
                            <>
                                {!showPasswordChange && !showAccountDeletion ? (
                                    <div className="text-center space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
                                                Security Settings
                                            </h2>
                                            <p className="text-gray-300">
                                                Manage your account security and password
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Password Change Section */}
                                            <div className="bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 p-6 space-y-4">
                                                <div className="flex items-center justify-center gap-3 text-morpheus-gold-light">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                                    </svg>
                                                    <span className="font-semibold text-lg">Password Security</span>
                                                </div>
                                                <p className="text-gray-300 text-sm">
                                                    Update your password to keep your account secure
                                                </p>
                                                <Button
                                                    onClick={handlePasswordChangeToggle}
                                                    disabled={isUpdating}
                                                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                                                    </svg>
                                                    Change Password
                                                </Button>
                                            </div>

                                            {/* Account Deletion Section */}
                                            <div className="bg-red-900/20 border border-red-500/30 p-6 space-y-4">
                                                <div className="flex items-center justify-center gap-3 text-red-400">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-9 2a9 9 0 1118 0 9 9 0 01-18 0z" />
                                                    </svg>
                                                    <span className="font-semibold text-lg">Account Deletion</span>
                                                </div>
                                                <p className="text-gray-300 text-sm">
                                                    Permanently delete your account and all associated data
                                                </p>
                                                <Button
                                                    onClick={handleAccountDeletionToggle}
                                                    disabled={isUpdating}
                                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Account
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : showPasswordChange ? (
                                    <>
                                        <PasswordChangeForm
                                            onSuccess={handlePasswordChangeSuccess}
                                            onError={handlePasswordChangeError}
                                        />

                                        {/* Back Button */}
                                        <div className="mt-8 pt-6 border-t border-morpheus-gold-dark/30">
                                            <div className="flex justify-center">
                                                <Button
                                                    onClick={handlePasswordChangeToggle}
                                                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                    </svg>
                                                    Back to Security
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : showAccountDeletion ? (
                                    <>
                                        <AccountDeletionSection
                                            onDeleteAccount={handleAccountDeletion}
                                            isLoading={isUpdating}
                                        />

                                        {/* Back Button */}
                                        <div className="mt-8 pt-6 border-t border-morpheus-gold-dark/30">
                                            <div className="flex justify-center">
                                                <Button
                                                    onClick={handleAccountDeletionToggle}
                                                    className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                                    </svg>
                                                    Back to Security
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : <></>}
                            </>
                        )}

                        {activeTab === 'preferences' && (
                            <PreferencesManagement
                                onSuccess={(message) => setMessage({ type: 'success', text: message })}
                                onError={(error) => setMessage({ type: 'error', text: error })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}