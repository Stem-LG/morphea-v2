import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/client';
import { Database } from '@/lib/supabase';

type VisitorData = {
  yvisiteurid: number;
  yvisiteurnom: string;
  yvisiteuremail: string | null;
  yvisiteurtelephone: string | null;
  yvisiteuradresse: string | null;
};

export function useVisitorData() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { data: currentUser } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchVisitorData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .schema('morpheus')
          .from('yvisiteur')
          .select('yvisiteurid, yvisiteurnom, yvisiteuremail, yvisiteurtelephone, yvisiteuradresse')
          .eq('yuseridfk', currentUser.id)
          .order('yvisiteurid', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching visitor data:', error);
          setError(error.message);
          return;
        }

        if (data && data.length > 0) {
          setVisitorData(data[0]);
        }
      } catch (err) {
        console.error('Error fetching visitor data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorData();
  }, [currentUser, supabase]);

  return {
    visitorData,
    isLoading,
    error,
    hasVisitorData: !!visitorData
  };
}