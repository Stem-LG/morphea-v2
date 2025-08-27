"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useCallback } from "react";

export interface ProductFilters {
    event?: string | null;
    mall?: string | null;
    boutique?: string | null;
    category?: string | null;
    search?: string | null;
    visibility?: string | null;
}

export interface ProductPagination {
    page: number;
    perPage: number;
}

export function useProductFilters() {
    // Filter state
    const [event, setEvent] = useQueryState('event', parseAsString);
    const [mall, setMall] = useQueryState('mall', parseAsString);
    const [boutique, setBoutique] = useQueryState('boutique', parseAsString);
    const [category, setCategory] = useQueryState('category', parseAsString);
    const [search, setSearch] = useQueryState('search', parseAsString);
    const [visibility, setVisibility] = useQueryState('visibility', parseAsString);

    // Pagination state
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const [perPage, setPerPage] = useQueryState('perPage', parseAsInteger.withDefault(10));

    const filters: ProductFilters = {
        event: event || undefined,
        mall: mall || undefined,
        boutique: boutique || undefined,
        category: category || undefined,
        search: search || undefined,
        visibility: visibility || undefined,
    };

    const pagination: ProductPagination = {
        page,
        perPage,
    };

    const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
        if (newFilters.event !== undefined) setEvent(newFilters.event);
        if (newFilters.mall !== undefined) setMall(newFilters.mall);
        if (newFilters.boutique !== undefined) setBoutique(newFilters.boutique);
        if (newFilters.category !== undefined) setCategory(newFilters.category);
        if (newFilters.search !== undefined) setSearch(newFilters.search);
        if (newFilters.visibility !== undefined) setVisibility(newFilters.visibility);
        
        // Reset to first page when filters change
        setPage(1);
    }, [setEvent, setMall, setBoutique, setCategory, setSearch, setVisibility, setPage]);

    const resetFilters = useCallback(() => {
        setEvent(null);
        setMall(null);
        setBoutique(null);
        setCategory(null);
        setSearch(null);
        setVisibility(null);
        setPage(1);
    }, [setEvent, setMall, setBoutique, setCategory, setSearch, setVisibility, setPage]);

    const updatePagination = useCallback((newPagination: Partial<ProductPagination>) => {
        if (newPagination.page !== undefined) setPage(newPagination.page);
        if (newPagination.perPage !== undefined) setPerPage(newPagination.perPage);
    }, [setPage, setPerPage]);

    return {
        filters,
        pagination,
        updateFilters,
        resetFilters,
        updatePagination,
    };
}