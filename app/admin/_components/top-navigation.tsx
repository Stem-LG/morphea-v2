"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    Menu, 
    Bell, 
    User, 
    LogOut, 
    Settings,
    ChevronDown
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TopNavigationProps {
    user: any;
    onMenuToggle: () => void;
}

export function TopNavigation({ user, onMenuToggle }: TopNavigationProps) {
    const { t } = useLanguage();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const userMetadata = user?.app_metadata as { roles?: string[] };
    const roles = userMetadata?.roles || [];
    const userRole = roles.includes('admin') ? 'admin' : 'store_admin';

    return (
        <header className="bg-gradient-to-r from-morpheus-blue-dark/80 to-morpheus-blue-light/80 backdrop-blur-sm border-b border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
                {/* Left side - Mobile menu button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuToggle}
                        className="lg:hidden text-white hover:bg-slate-700/50"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    
                    {/* Breadcrumb or page title could go here */}
                    <div className="hidden lg:block">
                        <h2 className="text-lg font-semibold text-white">
                            {t('admin.dashboard')}
                        </h2>
                        <p className="text-sm text-gray-300 capitalize">
                            {userRole.replace('_', ' ')} {t('admin.panel')}
                        </p>
                    </div>
                </div>

                {/* Right side - Actions and user menu */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-700/50 relative"
                    >
                        <Bell className="h-5 w-5" />
                        {/* Notification badge */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full text-xs flex items-center justify-center">
                        </span>
                    </Button>

                    {/* User Menu */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="text-white hover:bg-slate-700/50 flex items-center gap-2 px-3"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="hidden lg:block text-left">
                                <div className="text-sm font-medium">
                                    {user?.email?.split('@')[0] || 'User'}
                                </div>
                                <div className="text-xs text-gray-300 capitalize">
                                    {userRole.replace('_', ' ')}
                                </div>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </Button>

                        {/* Dropdown Menu */}
                        {userMenuOpen && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 z-10"
                                    onClick={() => setUserMenuOpen(false)}
                                />
                                
                                {/* Menu */}
                                <div className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700/50 shadow-2xl z-20">
                                    <div className="p-3 border-b border-slate-700/50">
                                        <div className="text-sm font-medium text-white">
                                            {user?.email}
                                        </div>
                                        <div className="text-xs text-gray-300 capitalize">
                                            {userRole.replace('_', ' ')} {t('admin.account')}
                                        </div>
                                    </div>
                                    
                                    <div className="p-2">
                                        <Link href="/admin/profile">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start text-white hover:bg-slate-700/50"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                {t('admin.profileSettings')}
                                            </Button>
                                        </Link>
                                        
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="w-full justify-start text-white hover:bg-red-600/20 hover:text-red-300"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            {t('auth.signOut')}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}