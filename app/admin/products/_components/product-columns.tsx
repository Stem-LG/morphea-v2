"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import { ProductWithDetails } from "../_hooks/use-approved-products";
import { useLanguage } from "@/hooks/useLanguage";

export const useProductColumns = (onViewProduct?: (product: ProductWithDetails) => void): ColumnDef<ProductWithDetails>[] => {
    const { t } = useLanguage();

    return [
        {
            accessorKey: "yprodcode",
            header: t("admin.productCode") || "Product Code",
            cell: ({ row }) => {
                const code = row.getValue("yprodcode") as string;
                return (
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-morpheus-gold-light" />
                        <span className="font-mono text-sm">{code}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "yprodintitule",
            header: t("admin.productName") || "Product Name",
            cell: ({ row }) => {
                const title = row.getValue("yprodintitule") as string;
                return (
                    <div className="max-w-[200px]">
                        <div className="font-medium text-white truncate">{title}</div>
                        <div className="text-sm text-gray-400 truncate">
                            {row.original.yprodinfobulle}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "designer",
            header: t("admin.designer") || "Designer",
            cell: ({ row }) => {
                const designer = row.original.designer;
                if (!designer) return <span className="text-gray-500">N/A</span>;
                return (
                    <div>
                        <div className="font-medium text-white">{designer.ydesignnom}</div>
                        <div className="text-sm text-gray-400">{designer.ydesignmarque}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: t("admin.category") || "Category",
            cell: ({ row }) => {
                const category = row.original.category;
                if (!category) return <span className="text-gray-500">N/A</span>;
                return (
                    <Badge variant="outline" className="text-morpheus-gold-light border-morpheus-gold-light/30">
                        {category.xcategprodintitule}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "yprodstatut",
            header: t("admin.status") || "Status",
            cell: ({ row }) => {
                const status = row.getValue("yprodstatut") as string;
                
                const getStatusColor = (status: string) => {
                    switch (status) {
                        case "approved":
                            return "bg-green-500/20 text-green-400 border-green-400/30";
                        case "not_approved":
                            return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
                        case "rejected":
                            return "bg-red-500/20 text-red-400 border-red-400/30";
                        default:
                            return "bg-gray-500/20 text-gray-400 border-gray-400/30";
                    }
                };

                const getStatusLabel = (status: string) => {
                    switch (status) {
                        case "approved":
                            return t("admin.approved") || "Approved";
                        case "not_approved":
                            return t("admin.pending") || "Pending";
                        case "rejected":
                            return t("admin.rejected") || "Rejected";
                        default:
                            return status;
                    }
                };

                return (
                    <Badge className={`${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "events",
            header: t("admin.allEvents") || "Events",
            cell: ({ row }) => {
                const events = row.original.events;
                if (!events || events.length === 0) {
                    return <span className="text-gray-500">No events</span>;
                }
                
                return (
                    <div className="max-w-[150px]">
                        {events.slice(0, 2).map((event, index) => (
                            <div key={index} className="text-sm">
                                <div className="font-medium text-white truncate">
                                    {event.yeventintitule}
                                </div>
                                {event.mall && (
                                    <div className="text-gray-400 truncate">
                                        {event.mall.ymallintitule}
                                    </div>
                                )}
                                {event.boutique && (
                                    <div className="text-gray-400 truncate">
                                        {event.boutique.yboutiqueintitule}
                                    </div>
                                )}
                            </div>
                        ))}
                        {events.length > 2 && (
                            <div className="text-xs text-gray-500">
                                +{events.length - 2} more
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: t("admin.actions") || "Actions",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() => {
                                if (onViewProduct) {
                                    onViewProduct(row.original);
                                } else {
                                    console.log("View product:", row.original.yprodid);
                                }
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
};