import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { createClient } from "@/lib/client";
import { Database } from "@/lib/supabase";

const VISITOR_FORM_STORAGE_KEY = "morpheus_visitor_form_skipped";

export type VisitorFormData = {
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

export function useVisitorForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const { data: currentUser } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    // Check if user has already skipped the form or submitted it
    const hasSkipped = localStorage.getItem(VISITOR_FORM_STORAGE_KEY);
    
    // Only show dialog if user hasn't skipped and we have a user
    if (!hasSkipped && currentUser && !hasSubmitted) {
      // Add a small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, hasSubmitted]);

  const handleSkip = () => {
    localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const submitVisitorForm = async (formData: VisitorFormData) => {
    if (!currentUser || !formData.name.trim()) {
      throw new Error("User not authenticated or name is required");
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
        throw error;
      }

      // Mark as completed so they don't see it again
      localStorage.setItem(VISITOR_FORM_STORAGE_KEY, "true");
      setHasSubmitted(true);
      setIsOpen(false);
      
      return { success: true };
      
    } catch (error) {
      console.error("Error submitting visitor form:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkIfUserHasVisitorRecord = async () => {
    if (!currentUser) return false;

    try {
      const { data, error } = await supabase
        .schema("morpheus")
        .from("yvisiteur")
        .select("yvisiteurid")
        .eq("yuseridfk", currentUser.id)
        .limit(1);

      if (error) {
        console.error("Error checking visitor record:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking visitor record:", error);
      return false;
    }
  };

  return {
    isOpen,
    setIsOpen,
    isSubmitting,
    hasSubmitted,
    handleSkip,
    submitVisitorForm,
    checkIfUserHasVisitorRecord,
  };
}