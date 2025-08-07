"use client";

import { createClient } from "@/lib/client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";

interface UseDesignersPaginatedParams {
    eventId: number;
    mallId: number;
}

export function useDesignersPaginated({
    eventId,
    mallId,
}: UseDesignersPaginatedParams) {
    const supabase = createClient();

    // Use nuqs for URL state management
    const [{ page, search }] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(""),
    });

    const perPage = 5;

    return useQuery({
        queryKey: ["designers-paginated", eventId, mallId, page, search],
        queryFn: async () => {
            const offset = (page - 1) * perPage;

            // Single query with LEFT JOIN to get designers and their assignment status
            let query = supabase
                .schema("morpheus")
                .from("ydesign")
                .select(`
                    ydesignid,
                    ydesigncode,
                    ydesignnom,
                    ydesignmarque,
                    ydesignspecialite,
                    ydesignpays,
                    ydesigncontactpersonne,
                    ydesigncontactemail,
                    ydesigncontacttelephone,
                    ydetailsevent!left(
                        ydetailseventid,
                        yeventidfk,
                        ymallidfk,
                        yboutiqueidfk
                    )
                `, { count: 'exact' });

            // Apply search filter
            if (search.trim()) {
                query = query.or(`ydesignnom.ilike.%${search}%,ydesigncontactemail.ilike.%${search}%,ydesignmarque.ilike.%${search}%`);
            }

            // Apply pagination and ordering
            const { data: designers, error: designersError, count } = await query
                .order("ydesignnom")
                .range(offset, offset + perPage - 1);

            if (designersError) {
                throw new Error(`Failed to fetch designers: ${designersError.message}`);
            }

            // Process the data to mark assigned designers
            const designersWithStatus = (designers || []).map(designer => {
                // Check if this designer is assigned to any boutique in this specific event and mall
                const isAssigned = designer.ydetailsevent?.some((detail: any) =>
                    detail.yeventidfk === eventId &&
                    detail.ymallidfk === mallId &&
                    detail.yboutiqueidfk !== null
                ) || false;

                return {
                    ydesignid: designer.ydesignid,
                    ydesigncode: designer.ydesigncode,
                    ydesignnom: designer.ydesignnom,
                    ydesignmarque: designer.ydesignmarque,
                    ydesignspecialite: designer.ydesignspecialite,
                    ydesignpays: designer.ydesignpays,
                    ydesigncontactpersonne: designer.ydesigncontactpersonne,
                    ydesigncontactemail: designer.ydesigncontactemail,
                    ydesigncontacttelephone: designer.ydesigncontacttelephone,
                    isAssigned
                };
            });

            const totalPages = Math.ceil((count || 0) / perPage);

            return {
                designers: designersWithStatus,
                pagination: {
                    currentPage: page,
                    perPage,
                    total: count || 0,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            };
        },
        enabled: !!eventId && !!mallId,
        placeholderData: keepPreviousData
    });
}

export function useDesignersSearch() {
    const [{ page, search }, setQueryState] = useQueryStates({
        page: parseAsInteger.withDefault(1),
        search: parseAsString.withDefault(""),
    });

    const resetSearch = () => {
        setQueryState({ search: "", page: 1 });
    };

    const handleSearchChange = (newSearch: string) => {
        setQueryState({ search: newSearch, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        // DataTable passes 0-based index, but we store 1-based in URL
        setQueryState({ page: newPage + 1 });
    };

    return {
        search,
        page,
        setPage: handlePageChange,
        setSearch: handleSearchChange,
        resetSearch
    };
}