"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountDeletionSectionProps {
  onDeleteAccount: (password: string) => Promise<void>;
  isLoading?: boolean;
}

export function AccountDeletionSection({ onDeleteAccount, isLoading = false }: AccountDeletionSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setError(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPassword("");
    setConfirmationText("");
    setError(null);
  };

  const handleConfirmDelete = async () => {
    // Validate inputs
    if (!password.trim()) {
      setError("Password is required to delete your account");
      return;
    }

    if (confirmationText !== "DELETE") {
      setError("Please type 'DELETE' to confirm account deletion");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onDeleteAccount(password);
    } catch (error: any) {
      setError(error.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (!showConfirmation) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            Danger Zone
          </h2>
          <p className="text-gray-300">
            Permanently delete your account and all associated data
          </p>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 p-6 space-y-4">
          <div className="flex items-center justify-center gap-3 text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-9 2a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
            <span className="font-semibold">Warning: This action cannot be undone</span>
          </div>
          
          <p className="text-gray-300 text-sm">
            Deleting your account will permanently remove:
          </p>
          
          <ul className="text-gray-300 text-sm space-y-1 text-left max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              Your profile information and preferences
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              Your wishlist and cart items
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              Your account history and activity
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              All associated data and settings
            </li>
          </ul>
        </div>
        
        <Button
          onClick={handleDeleteClick}
          disabled={isLoading}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold font-parisienne bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
          Confirm Account Deletion
        </h2>
        <p className="text-gray-300">
          This action cannot be undone. Please confirm your decision.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-100 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-red-900/20 border border-red-500/30 p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-password" className="text-white font-semibold">
              Enter your password to confirm
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your current password"
              disabled={isDeleting}
              className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/50 text-white placeholder-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light/20 rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation" className="text-white font-semibold">
              {"Type \"DELETE\" to confirm"}
            </Label>
            <Input
              id="delete-confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE here"
              disabled={isDeleting}
              className="bg-morpheus-blue-dark/50 border-morpheus-gold-dark/50 text-white placeholder-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light/20 rounded-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleCancel}
            disabled={isDeleting}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting || !password.trim() || confirmationText !== "DELETE"}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 rounded-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isDeleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                Deleting Account...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Permanently Delete Account
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}