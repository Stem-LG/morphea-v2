"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PreferencesManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export function PreferencesManagement({ onSuccess, onError }: PreferencesManagementProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageChange = async (newLanguage: 'en' | 'fr') => {
    if (newLanguage === language) return;

    setIsUpdating(true);
    
    try {
      // Update language immediately through the hook
      setLanguage(newLanguage);
      
      // Show success message
      const languageName = newLanguage === 'en' ? 'English' : 'Français';
      onSuccess?.(`Language preference updated to ${languageName}`);
    } catch (error) {
      console.error('Language update error:', error);
      onError?.('Failed to update language preference. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light bg-clip-text text-transparent">
          Preferences
        </h2>
        <p className="text-gray-300">
          Customize your experience and application settings
        </p>
      </div>

      {/* Language Preference Section */}
      <div className="space-y-6">
        <div className="border-b border-morpheus-gold-dark/30 pb-4">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Language Preference
          </h3>
          <p className="text-gray-400 text-sm">
            Choose your preferred language for the interface
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* English Option */}
            <button
              onClick={() => handleLanguageChange('en')}
              disabled={isUpdating}
              className={`flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all duration-300 ${
                language === 'en'
                  ? 'border-morpheus-gold-dark bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-white'
                  : 'border-gray-600 hover:border-morpheus-gold-dark/50 text-gray-300 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <img 
                src="/flags/us.svg" 
                alt="English" 
                className="w-6 h-4 object-cover"
              />
              <span className="font-medium">English</span>
              {language === 'en' && (
                <svg className="w-5 h-5 text-morpheus-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {/* French Option */}
            <button
              onClick={() => handleLanguageChange('fr')}
              disabled={isUpdating}
              className={`flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all duration-300 ${
                language === 'fr'
                  ? 'border-morpheus-gold-dark bg-gradient-to-r from-morpheus-gold-dark/20 to-morpheus-gold-light/20 text-white'
                  : 'border-gray-600 hover:border-morpheus-gold-dark/50 text-gray-300 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <img 
                src="/flags/fr.svg" 
                alt="Français" 
                className="w-6 h-4 object-cover"
              />
              <span className="font-medium">Français</span>
              {language === 'fr' && (
                <svg className="w-5 h-5 text-morpheus-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Current Language Display */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Current language: <span className="text-morpheus-gold-light font-medium">
                {language === 'en' ? 'English' : 'Français'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences Section */}
      <div className="space-y-6">
        <div className="border-b border-morpheus-gold-dark/30 pb-4">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2z" />
            </svg>
            Notification Preferences
          </h3>
          <p className="text-gray-400 text-sm">
            Manage your notification settings and preferences
          </p>
        </div>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-morpheus-blue-dark/30 to-morpheus-blue-light/20 border border-morpheus-gold-dark/20">
            <div className="flex-1">
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-gray-400 text-sm">Receive updates about your account and orders</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="sr-only peer"
                  disabled={true}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-morpheus-gold-dark/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-morpheus-gold-dark"></div>
              </label>
            </div>
          </div>

          {/* Marketing Communications */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-morpheus-blue-dark/30 to-morpheus-blue-light/20 border border-morpheus-gold-dark/20">
            <div className="flex-1">
              <h4 className="text-white font-medium">Marketing Communications</h4>
              <p className="text-gray-400 text-sm">Receive promotional offers and product updates</p>
            </div>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="sr-only peer"
                  disabled={true}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-morpheus-gold-dark/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-morpheus-gold-dark"></div>
              </label>
            </div>
          </div>

          {/* Note about notification preferences */}
          <div className="text-center">
            <p className="text-xs text-gray-500 italic">
              Note: Notification preferences are currently display-only and will be fully functional in a future update.
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isUpdating && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-morpheus-gold-dark border-t-morpheus-gold-light animate-spin rounded-full"></div>
          <span className="ml-2 text-gray-300">Updating preferences...</span>
        </div>
      )}
    </div>
  );
}