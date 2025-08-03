"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { DesignerForm, DesignerFormData } from "./designer-form";
import { useHasDesigner, useUpdateDesigner } from "../_hooks/use-designer";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Briefcase, Palette, Edit, Store as StoreIcon, Search } from "lucide-react";
import { Store, UserRole } from "@/lib/types/user";

interface DesignerDetailsModalProps {
    userId: string | null;
    userEmail: string;
    isOpen: boolean;
    onClose: () => void;
    canEdit?: boolean; // Whether the current user can edit the designer details
    user?: UserRole; // Full user object with store details
    onUserUpdate?: () => void; // Callback to refresh user data
}

export function DesignerDetailsModal({
    userId,
    userEmail,
    isOpen,
    onClose,
    canEdit = false,
    user,
    onUserUpdate
}: DesignerDetailsModalProps) {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [designerData, setDesignerData] = useState<DesignerFormData | null>(null);
    const [isDesignerFormValid, setIsDesignerFormValid] = useState(false);
    const [isEditingStores, setIsEditingStores] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [localUser, setLocalUser] = useState<UserRole | undefined>(user);
    
    const { hasDesigner, designer, isLoading } = useHasDesigner(userId);
    const updateDesignerMutation = useUpdateDesigner();
    const { fetchStores, assignStores, loading: storeLoading } = useUserManagement();

    const loadStores = useCallback(async () => {
        try {
            const storesData = await fetchStores();
            setStores(storesData);
        } catch (error) {
            console.error("Error loading stores:", error);
        }
    }, [fetchStores]);

    useEffect(() => {
        if (designer) {
            setDesignerData(designer);
        }
    }, [designer]);

    useEffect(() => {
        setLocalUser(user);
        if (user) {
            setSelectedStoreIds(user.assigned_stores || []);
        }
    }, [user]);

    // Load stores when modal opens
    useEffect(() => {
        if (isOpen) {
            loadStores();
        }
    }, [isOpen, loadStores]);

    const handleDesignerFormChange = (data: DesignerFormData, isValid: boolean) => {
        setDesignerData(data);
        setIsDesignerFormValid(isValid);
    };

    const handleSave = async () => {
        if (!designerData || !userId || !isDesignerFormValid || !designer) return;

        try {
            await updateDesignerMutation.mutateAsync({
                designerId: designer.ydesignid,
                designerData,
                userId
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating designer:", error);
        }
    };

    const handleCancel = () => {
        setDesignerData(designer || null);
        setIsEditing(false);
        setIsEditingStores(false);
        setSelectedStoreIds(localUser?.assigned_stores || []);
    };

    const handleStoreAssignment = async () => {
        if (!localUser) return;
        
        try {
            const response = await assignStores(localUser.email, selectedStoreIds);
            setIsEditingStores(false);
            
            // Update the local user state with the new store assignments
            setLocalUser(prev => prev ? {
                ...prev,
                assigned_stores: response.user.assigned_stores,
                store_details: response.user.store_details
            } : undefined);
            
            if (onUserUpdate) {
                onUserUpdate();
            }
        } catch (error) {
            console.error("Error assigning stores:", error);
        }
    };

    const toggleStore = (storeId: number) => {
        setSelectedStoreIds((prev) =>
            prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
        );
    };

    const selectAllStores = () => {
        setSelectedStoreIds(filteredStores.map((store) => store.id));
    };

    const clearAllStores = () => {
        setSelectedStoreIds([]);
    };

    const filteredStores = stores.filter(
        (store) =>
            store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.designerDetails")} - {userEmail}
                    </h2>
                    <div className="flex items-center gap-2">
                        {canEdit && hasDesigner && !isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                {t("admin.users.editDesigner")}
                            </Button>
                        )}
                        <Button
                            onClick={onClose}
                            variant="outline"
                            size="sm"
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                            {t("common.loading")}
                        </div>
                    ) : !hasDesigner ? (
                        <div className="text-center text-gray-600 dark:text-gray-300 py-8">
                            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>{t("admin.users.noDesignerProfile")}</p>
                        </div>
                    ) : isEditing ? (
                        <div className="space-y-6">
                            <DesignerForm
                                userEmail={userEmail}
                                onFormChange={handleDesignerFormChange}
                                initialData={designerData || undefined}
                                disabled={updateDesignerMutation.isPending}
                                step="basic"
                            />
                            <DesignerForm
                                userEmail={userEmail}
                                onFormChange={handleDesignerFormChange}
                                initialData={designerData || undefined}
                                disabled={updateDesignerMutation.isPending}
                                step="additional"
                            />
                        </div>
                    ) : (
                        <DesignerDetailsView
                            designer={designer!}
                            user={localUser}
                            isEditingStores={isEditingStores}
                            selectedStoreIds={selectedStoreIds}
                            searchTerm={searchTerm}
                            filteredStores={filteredStores}
                            onEditStores={() => setIsEditingStores(true)}
                            onCancelStoreEdit={() => {
                                setIsEditingStores(false);
                                setSelectedStoreIds(localUser?.assigned_stores || []);
                            }}
                            onSaveStores={handleStoreAssignment}
                            onToggleStore={toggleStore}
                            onSelectAllStores={selectAllStores}
                            onClearAllStores={clearAllStores}
                            onSearchChange={setSearchTerm}
                            storeLoading={storeLoading}
                            canEdit={canEdit}
                        />
                    )}
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            disabled={updateDesignerMutation.isPending}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isDesignerFormValid || updateDesignerMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updateDesignerMutation.isPending ? t("common.saving") : t("common.save")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

interface DesignerDetailsViewProps {
    designer: DesignerFormData;
    user?: UserRole;
    isEditingStores: boolean;
    selectedStoreIds: number[];
    searchTerm: string;
    filteredStores: Store[];
    onEditStores: () => void;
    onCancelStoreEdit: () => void;
    onSaveStores: () => void;
    onToggleStore: (storeId: number) => void;
    onSelectAllStores: () => void;
    onClearAllStores: () => void;
    onSearchChange: (term: string) => void;
    storeLoading: boolean;
    canEdit: boolean;
}

function DesignerDetailsView({
    designer,
    user,
    isEditingStores,
    selectedStoreIds,
    searchTerm,
    filteredStores,
    onEditStores,
    onCancelStoreEdit,
    onSaveStores,
    onToggleStore,
    onSelectAllStores,
    onClearAllStores,
    onSearchChange,
    storeLoading,
    canEdit
}: DesignerDetailsViewProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.stepper.basicInfo")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.name")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignnom || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.contactPerson")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontactpersonne || "N/A"}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.email")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontactemail || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.phone")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesigncontacttelephone || "N/A"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-morpheus-gold-light" />
                        {t("admin.users.stepper.additionalInfo")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.brand")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignmarque || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                                {t("admin.users.designer.country")}
                            </label>
                            <p className="text-white mt-1">{designer.ydesignpays || "N/A"}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">
                            {t("admin.users.designer.specialty")}
                        </label>
                        <p className="text-white mt-1">{designer.ydesignspecialite || "N/A"}</p>
                    </div>
                    
                    {/* Color Preferences */}
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                            {t("admin.users.designer.colorPreferences")}
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((num) => {
                                const colorHex = designer[`ydesigncouleur${num}codehexa` as keyof DesignerFormData] as string;
                                const colorDesc = designer[`ydesigncouleur${num}dsg` as keyof DesignerFormData] as string;
                                
                                if (!colorHex && !colorDesc) return null;
                                
                                return (
                                    <div key={num} className="flex items-center gap-3">
                                        <div 
                                            className="w-8 h-8 rounded border border-gray-600"
                                            style={{ backgroundColor: colorHex || "#000000" }}
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {t("admin.users.designer.color")} {num}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {colorDesc || colorHex || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Designer Code */}
                    {designer.ydesigncode && (
                        <div>
                            <label className="text-sm font-medium text-gray-300">
                                {t("admin.users.designer.designerCode")}
                            </label>
                            <p className="text-white mt-1 font-mono">{designer.ydesigncode}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Assigned Stores */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <StoreIcon className="h-5 w-5 text-morpheus-gold-light" />
                            {t("admin.users.assignedStores")}
                        </CardTitle>
                        {canEdit && !isEditingStores && (
                            <Button
                                onClick={onEditStores}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                {t("admin.users.manageStores")}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditingStores ? (
                        <div className="space-y-4">
                            <div className="mb-4">
                                <p className="text-sm text-gray-300 mb-4">
                                    {selectedStoreIds.length} {t("admin.users.selected")}
                                </p>
                            </div>

                            {/* Search and bulk actions */}
                            <div className="mb-4 space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={t("admin.users.searchBoutiques")}
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={onSelectAllStores}
                                        className="text-sm bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded transition-colors"
                                    >
                                        {t("admin.users.selectAll")} ({filteredStores.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClearAllStores}
                                        className="text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded transition-colors"
                                    >
                                        {t("admin.users.clearAll")}
                                    </button>
                                </div>
                            </div>

                            {/* Store list */}
                            <div className="max-h-64 overflow-y-auto border border-gray-600 rounded-md p-3 space-y-2 bg-gray-800">
                                {filteredStores.length === 0 ? (
                                    <div className="text-center text-gray-400 py-4">
                                        {searchTerm
                                            ? t("admin.users.noBoutiquesFound")
                                            : t("admin.users.noBoutiquesAvailable")}
                                    </div>
                                ) : (
                                    filteredStores.map((store) => (
                                        <label
                                            key={store.id}
                                            className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedStoreIds.includes(store.id)
                                                    ? "bg-blue-900/20 border-blue-700"
                                                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStoreIds.includes(store.id)}
                                                onChange={() => onToggleStore(store.id)}
                                                className="mt-1 rounded text-blue-600 focus:ring-blue-500 bg-gray-600 border-gray-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-white truncate">
                                                        {store.name}
                                                    </h4>
                                                    <span className="text-sm text-gray-400 font-mono">
                                                        {store.code}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 mt-1">
                                                    {store.address}
                                                </p>
                                                {store.mallId && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Mall ID: {store.mallId}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    onClick={onCancelStoreEdit}
                                    variant="outline"
                                    disabled={storeLoading}
                                >
                                    {t("common.cancel")}
                                </Button>
                                <Button
                                    onClick={onSaveStores}
                                    disabled={storeLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {storeLoading ? t("admin.users.processing") : t("admin.users.assignStores")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {user?.store_details && user.store_details.length > 0 ? (
                                <div className="space-y-3">
                                    {user.store_details.map((store) => (
                                        <div key={store.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-white">
                                                        {store.name}
                                                    </h4>
                                                    <span className="text-sm text-gray-400 font-mono">
                                                        {store.code}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 mt-1">
                                                    {store.address}
                                                </p>
                                                {store.mallId && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Mall ID: {store.mallId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-8">
                                    <StoreIcon className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                                    <p>{t("admin.users.noStoresAssigned")}</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}