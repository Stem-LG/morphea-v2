"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Package, EyeOff } from "lucide-react";
import { ProductWithDetails } from "../_hooks/use-approved-products";
import { useLanguage } from "@/hooks/useLanguage";
import { useProductVisibility } from "../_hooks/use-product-visibility";

export const useProductColumns = (onViewProduct?: (product: ProductWithDetails) => void): ColumnDef<ProductWithDetails>[] => {
    const { t } = useLanguage();
    const { updateSingleVisibility, isUpdatingSingle } = useProductVisibility();

    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected()
                            ? true
                            : table.getIsSomePageRowsSelected()
                            ? "indeterminate"
                            : false
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label={t("admin.selectAll") || "Select all"}
                    className="border-gray-400 data-[state=checked]:bg-morpheus-gold-light data-[state=checked]:border-morpheus-gold-light"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t("admin.selectRow") || "Select row"}
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "yprodcode",
            header: t("admin.productCode") || "Product Code",
            cell: ({ row }) => {
                const code = row.getValue("yprodcode") as string;
                return (
                    <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-mono text-sm text-gray-900">{code}</span>
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
                            <div className="font-medium text-gray-900 truncate">{title}</div>
                            <div className="text-sm text-gray-600 truncate">
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
                        <div className="font-medium text-gray-900">{designer.ydesignnom}</div>
                        <div className="text-sm text-gray-600">{designer.ydesignmarque}</div>
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
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
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
                            return "bg-green-100 text-green-800 border-green-200";
                        case "not_approved":
                            return "bg-yellow-100 text-yellow-800 border-yellow-200";
                        case "rejected":
                            return "bg-red-100 text-red-800 border-red-200";
                        default:
                            return "bg-gray-100 text-gray-700 border-gray-200";
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
            accessorKey: "yestvisible",
            header: t("admin.visibility") || "Visibility",
            cell: ({ row }) => {
                const isVisible = row.getValue("yestvisible") as boolean;
                const productId = row.original.yprodid;
                
                return (
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={isVisible}
                            disabled={isUpdatingSingle}
                            onCheckedChange={(checked) => {
                                updateSingleVisibility.mutate({
                                    productId,
                                    yestvisible: checked,
                                });
                            }}
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                        />
                        <div className="flex items-center gap-1">
                            {isVisible ? (
                                <>
                                    <Eye className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">{t("admin.visible") || "Visible"}</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">{t("admin.hidden") || "Hidden"}</span>
                                </>
                            )}
                        </div>
                    </div>
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
                                <div className="font-medium text-gray-900 truncate">
                                    {event.yeventintitule}
                                </div>
                                {event.mall && (
                                    <div className="text-gray-600 truncate">
                                        {event.mall.ymallintitule}
                                    </div>
                                )}
                                {event.boutique && (
                                    <div className="text-gray-600 truncate">
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
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
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