"use client";

import { User } from '@supabase/supabase-js';
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface ProfileInfoEditProps {
  user: User;
  onSave: (data: ProfileUpdateData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
}

export function ProfileInfoEdit({ user, onSave, onCancel, isLoading }: ProfileInfoEditProps) {
  const { t } = useLanguage();
  
  // Form state
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: user.user_metadata?.full_name || '',
    email: user.email || ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      name: user.user_metadata?.full_name || '',
      email: user.email || ''
    });
    setErrors({});
  }, [user]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation - required field
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation - required and format
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: user.user_metadata?.full_name || '',
      email: user.email || ''
    });
    setErrors({});
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-morpheus-gold-dark/30">
        <h2 className="text-2xl font-bold text-white mb-2">
          Edit Profile Information
        </h2>
        <p className="text-gray-300">
          Update your account details and information
        </p>
      </div>

      {/* Edit Form */}
      <div className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light border border-slate-700 p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-lg font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              required
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
              disabled={isSubmitting || isLoading}
            />
            {errors.name && (
              <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-lg font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-12 text-lg focus:border-morpheus-gold-light focus:ring-morpheus-gold-light rounded-none"
              disabled={isSubmitting || isLoading}
            />
            {errors.email && (
              <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email}
              </div>
            )}
            {formData.email !== user.email && (
              <div className="text-morpheus-gold-light text-sm mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Changing your email will require confirmation via email
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <img src="/loading.gif" alt="Loading" className="h-5 w-5" />
                  Saving Changes...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white h-12 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Information Note */}
      <div className="bg-slate-700/30 border border-slate-600 p-4 rounded-none">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-morpheus-gold-light mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-gray-300 text-sm">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1 text-xs">
              <li>• Changes to your email address will require verification</li>
              <li>• You will receive a confirmation email at your new address</li>
              <li>• Your name will be updated immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}