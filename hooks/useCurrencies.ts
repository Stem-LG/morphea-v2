import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/lib/supabase";

type Currency = Database['morpheus']['Tables']['xdevise']['Row'];
type CurrencyInsert = Database['morpheus']['Tables']['xdevise']['Insert'];
type CurrencyUpdate = Database['morpheus']['Tables']['xdevise']['Update'];

// Hook to fetch all currencies
export function useCurrencies() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['currencies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdeviseintitule", { ascending: true });

            if (error) {
                console.error("Error fetching currencies:", error);
                throw error;
            }

            return data as Currency[];
        },
    });
}

// Hook to get a single currency by ID
export function useCurrency(currencyId: number | null) {
    const supabase = createClient();

    return useQuery({
        queryKey: ['currency', currencyId],
        queryFn: async () => {
            if (!currencyId) return null;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .eq("xdeviseid", currencyId)
                .single();

            if (error) {
                console.error("Error fetching currency:", error);
                throw error;
            }

            return data as Currency;
        },
        enabled: !!currencyId,
    });
}

// Hook to create a new currency
export function useCreateCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (currencyData: Omit<CurrencyInsert, 'xdeviseid' | 'sysdate' | 'sysaction' | 'sysuser' | 'sysadresseip'>) => {
            const currentTime = new Date().toISOString();
            
            // Convert boolean string to single character for database
            const convertedData = {
                ...currencyData,
                xdeviseboolautorisepaiement: currencyData.xdeviseboolautorisepaiement === "true" ? "Y" : "N"
            };
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .insert({
                    ...convertedData,
                    sysdate: currentTime,
                    sysaction: 'insert',
                    sysuser: 'admin', // This should be replaced with actual user
                    sysadresseip: null
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating currency:", error);
                throw error;
            }

            return data as Currency;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
        },
    });
}

// Hook to update a currency
export function useUpdateCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async ({ currencyId, updates }: { currencyId: number; updates: Partial<CurrencyUpdate> }) => {
            const currentTime = new Date().toISOString();
            
            // Convert boolean string to single character for database if present
            const convertedUpdates = { ...updates };
            if (convertedUpdates.xdeviseboolautorisepaiement !== undefined) {
                convertedUpdates.xdeviseboolautorisepaiement = convertedUpdates.xdeviseboolautorisepaiement === "true" ? "Y" : "N";
            }
            
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .update({
                    ...convertedUpdates,
                    sysdate: currentTime,
                    sysaction: 'update',
                    sysuser: 'admin', // This should be replaced with actual user
                })
                .eq("xdeviseid", currencyId)
                .select()
                .single();

            if (error) {
                console.error("Error updating currency:", error);
                throw error;
            }

            return data as Currency;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            queryClient.invalidateQueries({ queryKey: ['currency', data.xdeviseid] });
        },
    });
}

// Hook to delete a currency
export function useDeleteCurrency() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (currencyId: number) => {
            const { error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .delete()
                .eq("xdeviseid", currencyId);

            if (error) {
                console.error("Error deleting currency:", error);
                throw error;
            }

            return currencyId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
        },
    });
}

// Hook to get currencies that allow payments
export function usePaymentCurrencies() {
    const supabase = createClient();

    return useQuery({
        queryKey: ['payment-currencies'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .eq("xdeviseboolautorisepaiement", "Y")
                .order("xdeviseintitule", { ascending: true });

            if (error) {
                console.error("Error fetching payment currencies:", error);
                throw error;
            }

            return data as Currency[];
        },
    });
}