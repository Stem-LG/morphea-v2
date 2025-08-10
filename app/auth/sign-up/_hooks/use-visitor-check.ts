import { useState, useEffect } from 'react';
import { createClient } from '@/lib/client';

export function useVisitorCheck() {
  const [hasVisitorData, setHasVisitorData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const checkVisitorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user (should be anonymous)
        const { data: currentUserData } = await supabase.auth.getUser();
        const currentUser = currentUserData?.user;

        if (!currentUser) {
          setHasVisitorData(false);
          setIsLoading(false);
          return;
        }

        // Check if visitor data exists for this user
        const { data, error } = await supabase
          .schema('morpheus')
          .from('yvisiteur')
          .select('yvisiteurid')
          .eq('yuseridfk', currentUser.id)
          .limit(1);

        if (error) {
          console.error('Error checking visitor data:', error);
          setError(error.message);
          setHasVisitorData(false);
          return;
        }

        setHasVisitorData(data && data.length > 0);
      } catch (err) {
        console.error('Error checking visitor data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasVisitorData(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkVisitorData();
  }, [supabase]);

  return {
    hasVisitorData,
    isLoading,
    error
  };
}