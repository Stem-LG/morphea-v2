import React, { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnDef,
    flexRender,
    RowSelectionState,
} from "@tanstack/react-table";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Delete, Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationEllipsis,
    PaginationLink,
    PaginationNext,
} from "@/components/ui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";

interface DataTableProps<T> {
    data?: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    manualSorting?: {
        sorting: SortingState;
        onSortingChange: (state: SortingState) => void;
    };
    serverFilters?: boolean;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    actions?: React.ReactNode;
    filters?: React.ReactNode;
    onRowClick?: (row: T) => void;
    pagination?: {
        total: number;
        perPage: number;
        pages: number;
        currentPage: number;
        onPageChange: (page: number) => void;
        maxVisiblePages?: number;
    };
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    getRowId?: (row: T) => string;
}

export function DataTable<T extends object>({
    data,
    columns,
    isLoading,
    manualSorting,
    serverFilters = false,
    globalFilter: externalGlobalFilter,
    onGlobalFilterChange,
    actions,
    filters,
    onRowClick,
    pagination,
    enableRowSelection = false,
    rowSelection,
    onRowSelectionChange,
    getRowId,
}: DataTableProps<T>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>("");
    const globalFilter = externalGlobalFilter ?? internalGlobalFilter;
    const handleGlobalFilterChange = onGlobalFilterChange ?? setInternalGlobalFilter;

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "auto",
        onSortingChange: manualSorting
            ? (updater) => {
                if (typeof updater === "function") {
                    const newSorting = updater(manualSorting.sorting);
                    manualSorting.onSortingChange(newSorting);
                }
            }
            : setSorting,
        manualFiltering: serverFilters,
        manualSorting: !!manualSorting,
        enableGlobalFilter: !serverFilters,
        enableRowSelection: enableRowSelection,
        onRowSelectionChange: onRowSelectionChange,
        getRowId: getRowId,
        state: {
            sorting: manualSorting?.sorting ?? sorting,
            globalFilter,
            rowSelection: rowSelection || {},
            pagination: pagination
                ? {
                    pageIndex: pagination.currentPage,
                    pageSize: pagination.perPage,
                }
                : undefined,
        },
        ...(pagination
            ? {
                manualPagination: true,
                onPaginationChange: (updater) => {
                    if (typeof updater === "function") {
                        const newPagination = updater({
                            pageIndex: pagination.currentPage,
                            pageSize: pagination.perPage,
                        });

                        console.log(newPagination);

                        pagination.onPageChange(newPagination.pageIndex);
                    }
                },
                rowCount: pagination.total,
            }
            : {}),
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin-slow size-12 text-blue-600" />
                <div className="text-lg font-semibold text-gray-900">Please wait</div>
            </div>
        );
    }

    return (
        <div>
            {/* Toolbar: filters, actions & global search */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative max-w-80 w-full">
                        <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
                        <Input
                            placeholder="Search"
                            className="w-full px-8 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                            value={globalFilter}
                            onChange={(e) => handleGlobalFilterChange(e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100 text-gray-500"
                            onClick={() => handleGlobalFilterChange("")}
                        >
                            <Delete className="h-4 w-4" />
                        </Button>
                    </div>
                    {filters}
                </div>
                <div>{actions}</div>
            </div>
            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b bg-gray-50/50">
                                {headerGroup.headers.map((header, index) => (
                                    <TableHead
                                        key={header.id}
                                        className={index === 0 ? "text-center py-4 text-gray-900 font-semibold" : "py-4 text-gray-900 font-semibold"}
                                        onClick={() => header.column.toggleSorting()}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: <span className="inline-block transform rotate-0 text-blue-600">▲</span>,
                                            desc: <span className="inline-block transform rotate-180 text-blue-600">▲</span>,
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                                    onClick={() => onRowClick && onRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            key={cell.id}
                                            className={index === 0 ? "text-center py-4 px-2 text-gray-900" : "py-4 px-2 text-gray-900"}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <PaginationControl
                    currentPage={pagination.currentPage}
                    totalPages={pagination.pages}
                    onPageChange={pagination.onPageChange}
                    maxVisiblePages={pagination.maxVisiblePages}
                />
            )}
        </div>
    );
}

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}

export function PaginationControl({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 4,
}: PaginationControlProps) {
    const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
    const [pageInputValue, setPageInputValue] = useState<string>("");

    const paginationItems = useMemo(() => {
        const items: any = [];
        const sidePages = Math.floor((maxVisiblePages - 1) / 2); // Pages to show on each side of current page

        if (totalPages <= maxVisiblePages) {
            // If total pages is less than max visible, show all pages
            for (let i = 1; i <= totalPages; i++) {
                items.push(i);
            }
        } else {
            // Always add first page
            items.push(1);

            // Calculate the range around current page
            let rangeStart = currentPage - sidePages;
            let rangeEnd = currentPage + sidePages;

            // Adjust range if it goes out of bounds
            if (rangeStart <= 2) {
                rangeStart = 2;
                rangeEnd = Math.min(totalPages - 1, maxVisiblePages);
            } else if (rangeEnd >= totalPages - 1) {
                rangeEnd = totalPages - 1;
                rangeStart = Math.max(2, totalPages - maxVisiblePages + 1);
            }

            // Add ellipsis after first page if needed
            if (rangeStart > 2) {
                items.push("ellipsis-start");
            }

            // Add pages in range
            for (let i = rangeStart; i <= rangeEnd; i++) {
                items.push(i);
            }

            // Add ellipsis before last page if needed
            if (rangeEnd < totalPages - 1) {
                items.push("ellipsis-end");
            }

            // Always add last page
            if (totalPages > 1) {
                items.push(totalPages);
            }
        }

        return items;
    }, [currentPage, totalPages, maxVisiblePages]);

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => onPageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>

                {paginationItems.map((item: string | number, index: number) => {
                    if (item === "ellipsis-start" || item === "ellipsis-end") {
                        const popoverId = `${item}-${index}`;
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <Popover
                                    open={openPopoverId === popoverId}
                                    onOpenChange={(open) => {
                                        if (!open) setOpenPopoverId(null);
                                        else setOpenPopoverId(popoverId);
                                    }}
                                >
                                    <PopoverTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenPopoverId(openPopoverId === popoverId ? null : popoverId);
                                            }}
                                            className="inline-flex h-10 items-center justify-center"
                                        >
                                            <PaginationEllipsis />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-16 p-0" onClick={(e) => e.stopPropagation()}>
                                        <Input
                                            type="text"
                                            value={pageInputValue}
                                            onChange={(e) => setPageInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    onPageChange(Number(pageInputValue));
                                                }
                                            }}
                                            placeholder={`1-${totalPages}`}
                                            className="h-8 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            autoFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={`page-${item}`}>
                            <PaginationLink
                                href="#"
                                onClick={(e: any) => {
                                    e.preventDefault();
                                    onPageChange(Number(item));
                                }}
                                isActive={currentPage === item}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => onPageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
