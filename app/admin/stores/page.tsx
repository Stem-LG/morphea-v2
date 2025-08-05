"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Store } from "lucide-react";
import { useStores } from "./_hooks/use-stores";
import { useCreateStore, useUpdateStore, useDeleteStore } from "./_hooks/use-store-mutations";
import { StoreCardSkeleton } from "./_components/store_card_skeleton";
import { StoreCard } from "./_components/store_card";
import { StoreDialog } from "./_components/store-dialog";
import { DeleteConfirmationDialog } from "./_components/delete-confirmation-dialog";

interface Store {
    yboutiqueid: number;
    yboutiqueintitule: string;
    yboutiqueadressemall?: string;
    ymallidfk?: number;
}

export default function StoresManagement() {
    const { t } = useLanguage();
    const { data: user } = useAuth();

    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    const isStoreAdmin = user?.app_metadata?.roles?.includes("store_admin");

    const { data: stores, isLoading, isError, error } = useStores();
    const createStoreMutation = useCreateStore();
    const updateStoreMutation = useUpdateStore();
    const deleteStoreMutation = useDeleteStore();

    // Dialog states
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

    // Handlers
    const handleAddStore = () => {
        setEditingStore(null);
        setIsStoreDialogOpen(true);
    };

    const handleEditStore = (store: Store) => {
        setEditingStore(store);
        setIsStoreDialogOpen(true);
    };

    const handleDeleteStore = (store: Store) => {
        setStoreToDelete(store);
        setIsDeleteDialogOpen(true);
    };

    const handleStoreSubmit = async (storeData: {
        yboutiqueintitule: string;
        yboutiqueadressemall?: string;
        ymallidfk: number;
    }) => {
        try {
            if (editingStore) {
                // Update existing store
                await updateStoreMutation.mutateAsync({
                    id: editingStore.yboutiqueid,
                    storeData,
                });
            } else {
                // Create new store
                await createStoreMutation.mutateAsync(storeData);
            }
            setIsStoreDialogOpen(false);
            setEditingStore(null);
        } catch (error) {
            console.error("Error saving store:", error);
            throw error;
        }
    };

    const handleConfirmDelete = async () => {
        if (!storeToDelete) return;

        try {
            await deleteStoreMutation.mutateAsync(storeToDelete.yboutiqueid);
            setIsDeleteDialogOpen(false);
            setStoreToDelete(null);
        } catch (error) {
            console.error("Error deleting store:", error);
        }
    };

    const handleCloseStoreDialog = () => {
        setIsStoreDialogOpen(false);
        setEditingStore(null);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setStoreToDelete(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{t("admin.storeManagement")}</h1>
                    <p className="text-lg text-gray-300">
                        {isAdmin ? t("admin.manageAllStores") : `${stores?.length || 0} ${t("admin.assignedStores")}`}
                    </p>
                </div>

                {isAdmin && (
                    <Button
                        onClick={handleAddStore}
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.addNewStore")}
                    </Button>
                )}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <StoreCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-700/50 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
                                <Store className="h-8 w-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{t("admin.errorLoadingStores")}</h3>
                            <p className="text-gray-400 mb-4">{error?.message || t("common.error")}</p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-red-700/50 text-red-400 hover:bg-red-900/30"
                            >
                                {t("common.retry") || "Retry"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Stores List */}
                {!isLoading && !isError && stores && (
                    <>
                        {stores.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stores.map((store) => (
                                    <StoreCard
                                        key={store.yboutiqueid}
                                        store={store}
                                        onEdit={handleEditStore}
                                        onDelete={handleDeleteStore}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                        <Store className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {t("admin.noStoresFound")}
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        {isAdmin
                                            ? t("admin.noStoresDescription")
                                            : isStoreAdmin
                                            ? "No stores are assigned to you for the current active events."
                                            : t("admin.noAssignedStoresDescription")}
                                    </p>
                                    {isAdmin && (
                                        <Button
                                            onClick={handleAddStore}
                                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t("admin.addNewStore")}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>

            {/* Store Dialog */}
            <StoreDialog
                isOpen={isStoreDialogOpen}
                onClose={handleCloseStoreDialog}
                onSubmit={handleStoreSubmit}
                store={editingStore}
                isLoading={createStoreMutation.isPending || updateStoreMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                storeName={storeToDelete?.yboutiqueintitule || ""}
                isLoading={deleteStoreMutation.isPending}
            />
        </div>
    );
}
