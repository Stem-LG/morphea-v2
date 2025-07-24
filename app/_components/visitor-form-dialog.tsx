"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { createClient } from "@/lib/client";
import { Database } from "@/lib/supabase";

type VisitorFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  visitorTypes: {
    acheteurluxe: boolean;
    acheteurpro: boolean;
    artisan: boolean;
    clientprive: boolean;
    collectionneur: boolean;
    createur: boolean;
    culturel: boolean;
    grandpublic: boolean;
    influenceur: boolean;
    investisseur: boolean;
    journaliste: boolean;
    pressespecialisee: boolean;
    vip: boolean;
  };
};

const VISITOR_FORM_STORAGE_KEY = "morpheus_visitor_form_skipped";

export default function VisitorFormDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VisitorFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    visitorTypes: {
      acheteurluxe: false,
      acheteurpro: false,
      artisan: false,
      clientprive: false,
      collectionneur: false,
      createur: false,
      culturel: false,
      grandpublic: false,
      influenceur: false,
      investisseur: false,
      journaliste: false,
      pressespecialisee: false,
      vip: false,
    },
  });

  const { data: currentUser } = useAuth();
  const { t } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    // Check if user has already skipped the form
    const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);
    
    // Only show dialog if user hasn't skipped and we have a user
    if (!hasSkipped && currentUser) {
      // Add a small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleSkip = () => {
    localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique visitor code (keep it short to avoid database constraints)
      const visitorCode = `V${Date.now().toString().slice(-8)}`;
      
      // Get the next available ID (simplified approach)
      const { data: existingVisitors } = await supabase
        .schema("morpheus")
        .from("yvisiteur")
        .select("yvisiteurid")
        .order("yvisiteurid", { ascending: false })
        .limit(1);
      
      const nextId = existingVisitors && existingVisitors.length > 0
        ? existingVisitors[0].yvisiteurid + 1
        : 1;

      const visitorData: Database["morpheus"]["Tables"]["yvisiteur"]["Insert"] = {
        yvisiteurid: nextId,
        yuseridfk: currentUser.id,
        yvisiteurcode: visitorCode,
        yvisiteurnom: formData.name.trim(),
        yvisiteuremail: formData.email.trim() || null,
        yvisiteurtelephone: formData.phone.trim() || null,
        yvisiteuradresse: formData.address.trim() || null,
        yvisiteurboolacheteurluxe: formData.visitorTypes.acheteurluxe ? "1" : "0",
        yvisiteurboolacheteurpro: formData.visitorTypes.acheteurpro ? "1" : "0",
        yvisiteurboolartisan: formData.visitorTypes.artisan ? "1" : "0",
        yvisiteurboolclientprive: formData.visitorTypes.clientprive ? "1" : "0",
        yvisiteurboolcollectionneur: formData.visitorTypes.collectionneur ? "1" : "0",
        yvisiteurboolcreateur: formData.visitorTypes.createur ? "1" : "0",
        yvisiteurboolculturel: formData.visitorTypes.culturel ? "1" : "0",
        yvisiteurboolgrandpublic: formData.visitorTypes.grandpublic ? "1" : "0",
        yvisiteurboolinfluenceur: formData.visitorTypes.influenceur ? "1" : "0",
        yvisiteurboolinvestisseur: formData.visitorTypes.investisseur ? "1" : "0",
        yvisiteurbooljournaliste: formData.visitorTypes.journaliste ? "1" : "0",
        yvisiteurboolpressespecialisee: formData.visitorTypes.pressespecialisee ? "1" : "0",
        yvisiteurboolvip: formData.visitorTypes.vip ? "1" : "0",
      };

      const { error } = await supabase
        .schema("morpheus")
        .from("yvisiteur")
        .insert(visitorData);

      if (error) {
        console.error("Error submitting visitor form:", error);
        alert(t("visitorForm.errorSubmitting"));
        return;
      }

      // Mark as completed so they don't see it again
      localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
      setIsOpen(false);
      
      // Show success message
      alert(t("visitorForm.thankYou"));
      
    } catch (error) {
      console.error("Error submitting visitor form:", error);
      alert(t("visitorForm.errorSubmitting"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof Omit<VisitorFormData, 'visitorTypes'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVisitorTypeChange = (type: keyof VisitorFormData['visitorTypes'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      visitorTypes: {
        ...prev.visitorTypes,
        [type]: checked
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div className="relative bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-morpheus-gold-dark/20">
          <h2 className="text-2xl font-bold text-morpheus-gold-light mb-2">
            {t("visitorForm.title")}
          </h2>
          <p className="text-gray-300">
            {t("visitorForm.subtitle")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-morpheus-gold-light">{t("visitorForm.basicInformation")}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("visitorForm.nameRequired")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-morpheus-gold-light focus:border-transparent"
                placeholder={t("visitorForm.namePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("visitorForm.email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-morpheus-gold-light focus:border-transparent"
                placeholder={t("visitorForm.emailPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("visitorForm.phone")}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-morpheus-gold-light focus:border-transparent"
                placeholder={t("visitorForm.phonePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("visitorForm.address")}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-morpheus-blue-dark/50 border border-morpheus-gold-dark/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-morpheus-gold-light focus:border-transparent"
                placeholder={t("visitorForm.addressPlaceholder")}
              />
            </div>
          </div>

          {/* Visitor Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-morpheus-gold-light">{t("visitorForm.visitorTypes")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'grandpublic', labelKey: 'grandpublic' },
                { key: 'clientprive', labelKey: 'clientprive' },
                { key: 'acheteurluxe', labelKey: 'acheteurluxe' },
                { key: 'acheteurpro', labelKey: 'acheteurpro' },
                { key: 'artisan', labelKey: 'artisan' },
                { key: 'createur', labelKey: 'createur' },
                { key: 'collectionneur', labelKey: 'collectionneur' },
                { key: 'investisseur', labelKey: 'investisseur' },
                { key: 'influenceur', labelKey: 'influenceur' },
                { key: 'journaliste', labelKey: 'journaliste' },
                { key: 'pressespecialisee', labelKey: 'pressespecialisee' },
                { key: 'culturel', labelKey: 'culturel' },
                { key: 'vip', labelKey: 'vip' },
              ].map(({ key, labelKey }) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.visitorTypes[key as keyof VisitorFormData['visitorTypes']]}
                    onChange={(e) => handleVisitorTypeChange(key as keyof VisitorFormData['visitorTypes'], e.target.checked)}
                    className="w-4 h-4 text-morpheus-gold-light bg-morpheus-blue-dark border-morpheus-gold-dark/30 rounded focus:ring-morpheus-gold-light focus:ring-2"
                  />
                  <span className="text-gray-300 text-sm">{t(`visitorForm.visitorTypeLabels.${labelKey}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-morpheus-gold-dark/20">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-gray-300 hover:text-white border border-morpheus-gold-dark/30 hover:border-morpheus-gold-light/50 rounded-md transition-all duration-300 disabled:opacity-50"
            >
              {t("visitorForm.skipForNow")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light text-white font-semibold rounded-md hover:from-morpheus-gold-light hover:to-morpheus-gold-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("visitorForm.submitting") : t("visitorForm.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}