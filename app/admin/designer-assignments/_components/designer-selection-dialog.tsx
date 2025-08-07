"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Credenza,
    CredenzaContent,
    CredenzaDescription,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
    CredenzaFooter,
    CredenzaClose,
} from "@/components/ui/credenza";
import { DataTable } from "@/components/data-table";
import { useDesignersPaginated, useDesignersSearch } from "../_hooks/use-designers-paginated";
import { useDesignerAssignment } from "../_hooks/use-designer-assignment";
import { ColumnDef } from "@tanstack/react-table";
import { User, Mail, MapPin, Palette, CheckCircle } from "lucide-react";

interface DesignerSelectionDialogProps {
    eventId: number;
    mallId: number;
    boutiqueId: number;
    boutiqueName: string;
    children: React.ReactNode;
    onAssignmentComplete?: () => void;
}

interface Designer {
    ydesignid: number;
    ydesignnom: string;
    ydesignmarque: string;
    ydesignspecialite: string;
    ydesignpays: string;
    ydesigncontactemail: string;
    ydesigncontactpersonne: string;
    ydesigncontacttelephone: string;
    isAssigned?: boolean;
}

export function DesignerSelectionDialog({
    eventId,
    mallId,
    boutiqueId,
    boutiqueName,
    children,
    onAssignmentComplete
}: DesignerSelectionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
    
    const { search, page, setPage, setSearch } = useDesignersSearch();
    const { assignDesigner, isAssigning } = useDesignerAssignment();

    const { data: designersData, isLoading } = useDesignersPaginated({
        eventId,
        mallId
    });

    const handleAssignDesigner = async () => {
        if (!selectedDesigner) return;

        try {
            await assignDesigner.mutateAsync({
                eventId,
                mallId,
                boutiqueId,
                designerId: selectedDesigner.ydesignid
            });
            setIsOpen(false);
            setSelectedDesigner(null);
            onAssignmentComplete?.();
        } catch (error) {
            console.error("Assignment error:", error);
        }
    };

    const columns: ColumnDef<Designer>[] = [
        {
            id: "select",
            header: "",
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <input
                        type="radio"
                        name="designer-selection"
                        checked={selectedDesigner?.ydesignid === row.original.ydesignid}
                        onChange={() => !row.original.isAssigned && setSelectedDesigner(row.original)}
                        disabled={row.original.isAssigned}
                        className={`h-4 w-4 text-morpheus-gold-light focus:ring-morpheus-gold-light ${
                            row.original.isAssigned ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    />
                </div>
            ),
        },
        {
            accessorKey: "ydesignnom",
            header: "Designer",
            cell: ({ row }) => (
                <div className={`flex items-center gap-3 ${row.original.isAssigned ? 'opacity-50' : ''}`}>
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-r from-morpheus-purple to-morpheus-blue flex items-center justify-center ${
                        row.original.isAssigned ? 'opacity-60' : ''
                    }`}>
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className={`font-medium ${row.original.isAssigned ? 'text-gray-400' : 'text-white'}`}>
                            {row.original.ydesignnom}
                            {row.original.isAssigned && (
                                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                    Already Assigned
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-400">{row.original.ydesigncontactpersonne}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "ydesignmarque",
            header: "Brand",
            cell: ({ row }) => (
                <div className={`flex flex-col ${row.original.isAssigned ? 'opacity-50' : ''}`}>
                    <span className={`font-medium ${row.original.isAssigned ? 'text-gray-400' : 'text-white'}`}>
                        {row.original.ydesignmarque}
                    </span>
                    <span className="text-sm text-gray-400">{row.original.ydesignspecialite}</span>
                </div>
            ),
        },
        {
            accessorKey: "ydesignpays",
            header: "Location",
            cell: ({ row }) => (
                <div className={`flex items-center gap-2 ${row.original.isAssigned ? 'opacity-50' : ''}`}>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className={`${row.original.isAssigned ? 'text-gray-400' : 'text-white'}`}>
                        {row.original.ydesignpays}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "ydesigncontactemail",
            header: "Contact",
            cell: ({ row }) => (
                <div className={`flex flex-col gap-1 ${row.original.isAssigned ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${row.original.isAssigned ? 'text-gray-400' : 'text-white'}`}>
                            {row.original.ydesigncontactemail}
                        </span>
                    </div>
                    {row.original.ydesigncontacttelephone && (
                        <div className="text-sm text-gray-400">
                            {row.original.ydesigncontacttelephone}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                {children}
            </CredenzaTrigger>
            <CredenzaContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light">
                <CredenzaHeader>
                    <CredenzaTitle className="text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-morpheus-gold-light" />
                        Select Designer for {boutiqueName}
                    </CredenzaTitle>
                    <CredenzaDescription className="text-gray-300">
                        Choose a designer to assign to this boutique. Only available designers are shown.
                    </CredenzaDescription>
                </CredenzaHeader>

                <div className="px-6 py-4 flex-1 overflow-hidden">
                    <DataTable
                        data={designersData?.designers || []}
                        columns={columns}
                        isLoading={isLoading}
                        globalFilter={search}
                        onGlobalFilterChange={setSearch}
                        serverFilters={true}
                        pagination={{
                            total: designersData?.pagination.total || 0,
                            perPage: designersData?.pagination.perPage || 5,
                            pages: designersData?.pagination.totalPages || 1,
                            currentPage: page,
                            onPageChange: setPage,
                        }}
                        onRowClick={(designer) => !designer.isAssigned && setSelectedDesigner(designer)}
                    />
                </div>

                <CredenzaFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {selectedDesigner && (
                            <Badge className="bg-morpheus-gold-light/20 text-morpheus-gold-light">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {selectedDesigner.ydesignnom} selected
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <CredenzaClose asChild>
                            <Button variant="outline" className="border-gray-600 text-gray-300">
                                Cancel
                            </Button>
                        </CredenzaClose>
                        <Button
                            onClick={handleAssignDesigner}
                            disabled={!selectedDesigner || isAssigning}
                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white"
                        >
                            {isAssigning ? "Assigning..." : "Assign Designer"}
                        </Button>
                    </div>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
}