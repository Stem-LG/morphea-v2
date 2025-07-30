"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRole, Store } from "@/lib/types/user";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useLanguage } from "@/hooks/useLanguage";
import { DesignerForm, DesignerFormData } from "./_components/designer-form";
import { DesignerDetailsModal } from "./_components/designer-details-modal";
import { useCreateDesigner, useHasDesigner } from "./_hooks/use-designer";

interface StoreAssignmentModalProps {
    user: UserRole | null;
    stores: Store[];
    isOpen: boolean;
    onClose: () => void;
    onAssign: (email: string, storeIds: number[], designerData?: DesignerFormData) => Promise<void>;
    loading: boolean;
}

function StoreAssignmentModal({ user, stores, isOpen, onClose, onAssign, loading }: StoreAssignmentModalProps) {
    const { t } = useLanguage();
    const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [designerData, setDesignerData] = useState<DesignerFormData | null>(null);
    const [isDesignerFormValid, setIsDesignerFormValid] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Check if user already has a designer profile
    const { hasDesigner, designer } = useHasDesigner(user?.id);

    useEffect(() => {
        if (user) {
            setSelectedStoreIds(user.assigned_stores || []);
            // Reset to step 1 when modal opens
            setCurrentStep(1);
        }
    }, [user, isOpen]);

    const handleNext = () => {
        if (currentStep === 1) {
            // Check if this is a first-time assignment requiring designer form
            const isFirstTimeAssignment =
                !hasDesigner && selectedStoreIds.length > 0 && (user?.assigned_stores || []).length === 0;

            if (isFirstTimeAssignment) {
                setCurrentStep(2); // Go to basic designer info
            } else {
                // Skip designer form and go directly to final step
                handleFinalSubmit();
            }
        } else if (currentStep === 2) {
            setCurrentStep(3); // Go to additional designer info
        } else if (currentStep === 3) {
            // Submit the assignment with designer data
            handleFinalSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinalSubmit = async () => {
        if (user) {
            const isFirstTimeAssignment =
                !hasDesigner && selectedStoreIds.length > 0 && (user.assigned_stores || []).length === 0;
            await onAssign(user.email, selectedStoreIds, isFirstTimeAssignment ? designerData || undefined : undefined);
            onClose();
        }
    };

    // Check if all required fields are filled for both basic and additional steps
    const isAllDesignerDataValid = () => {
        if (!designerData) return false;

        // Basic step fields
        const basicValid = !!(
            designerData.ydesignnom?.trim() &&
            designerData.ydesigncontactpersonne?.trim() &&
            designerData.ydesigncontactemail?.trim() &&
            designerData.ydesigncontacttelephone?.trim() &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(designerData.ydesigncontactemail)
        );

        // Additional step fields
        const additionalValid = !!(
            designerData.ydesignmarque?.trim() &&
            designerData.ydesignpays?.trim() &&
            designerData.ydesignspecialite?.trim()
        );

        return basicValid && additionalValid;
    };

    const handleDesignerFormChange = useCallback((data: DesignerFormData, isValid: boolean) => {
        setDesignerData(data);
        setIsDesignerFormValid(isValid);
    }, []);

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

    if (!isOpen || !user) return null;

    const isFirstTimeAssignment =
        !hasDesigner && selectedStoreIds.length > 0 && (user.assigned_stores || []).length === 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t("admin.users.manageStores")} {user.email}
                </h2>

                {/* Stepper */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                                }`}
                            >
                                1
                            </div>
                            <span
                                className={`ml-2 text-sm font-medium ${
                                    currentStep >= 1
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {t("admin.users.selectStores")}
                            </span>
                        </div>

                        <div className="flex-1 h-px bg-gray-300 mx-4"></div>

                        <div className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                                }`}
                            >
                                2
                            </div>
                            <span
                                className={`ml-2 text-sm font-medium ${
                                    currentStep >= 2
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {t("admin.users.stepper.basicInfo")}
                            </span>
                        </div>

                        <div className="flex-1 h-px bg-gray-300 mx-4"></div>

                        <div className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                    currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                                }`}
                            >
                                3
                            </div>
                            <span
                                className={`ml-2 text-sm font-medium ${
                                    currentStep >= 3
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                                {t("admin.users.stepper.additionalInfo")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                        {/* Step 1: Store Selection */}
                        {currentStep === 1 && (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t("admin.users.selectStores")}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        {selectedStoreIds.length} {t("admin.users.selected")}
                                    </p>
                                </div>

                                {/* Search and bulk actions */}
                                <div className="mb-4 space-y-2">
                                    <input
                                        type="text"
                                        placeholder={t("admin.users.searchBoutiques")}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={selectAllStores}
                                            className="text-sm bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 px-3 py-1 rounded transition-colors"
                                        >
                                            {t("admin.users.selectAll")} ({filteredStores.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearAllStores}
                                            className="text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded transition-colors"
                                        >
                                            {t("admin.users.clearAll")}
                                        </button>
                                    </div>
                                </div>

                                {/* Store list */}
                                <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-2 max-h-96 bg-white dark:bg-gray-700">
                                    {filteredStores.length === 0 ? (
                                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
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
                                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                                        : "bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStoreIds.includes(store.id)}
                                                    onChange={() => toggleStore(store.id)}
                                                    className="mt-1 rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                            {store.name}
                                                        </h4>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                            {store.code}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        {store.address}
                                                    </p>
                                                    {store.mallId && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            Mall ID: {store.mallId}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {/* Step 2: Basic Designer Information */}
                        {currentStep === 2 && (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t("admin.users.stepper.basicInfo")}
                                    </h3>
                                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                                            {t("admin.users.designer.firstTimeAssignmentNotice")}
                                        </p>
                                    </div>
                                </div>
                                <DesignerForm
                                    userEmail={user.email}
                                    onFormChange={handleDesignerFormChange}
                                    initialData={designerData || designer || undefined}
                                    disabled={loading}
                                    step="basic"
                                />
                            </div>
                        )}

                        {/* Step 3: Additional Designer Information */}
                        {currentStep === 3 && (
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {t("admin.users.stepper.additionalInfo")}
                                    </h3>
                                </div>
                                <DesignerForm
                                    userEmail={user.email}
                                    onFormChange={handleDesignerFormChange}
                                    initialData={designerData || designer || undefined}
                                    disabled={loading}
                                    step="additional"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                            {/* Back button - show on steps 2 and 3 */}
                            {(currentStep === 2 || currentStep === 3) && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                                >
                                    {t("admin.users.stepper.back")}
                                </button>
                            )}

                            {/* Store count info */}
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {selectedStoreIds.length}{" "}
                                {selectedStoreIds.length !== 1
                                    ? t("admin.users.boutiquesSelected")
                                    : t("admin.users.boutiqueSelected")}{" "}
                                {t("admin.users.selected")}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                            >
                                {t("common.cancel")}
                            </button>

                            {/* Step 1: Next or Direct Assignment */}
                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={selectedStoreIds.length === 0 || loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                                >
                                    {loading
                                        ? t("admin.users.processing")
                                        : isFirstTimeAssignment
                                        ? t("admin.users.stepper.next")
                                        : t("admin.users.assignStores")}
                                </button>
                            )}

                            {/* Step 2: Next to Additional Info */}
                            {currentStep === 2 && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading || !isDesignerFormValid}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                                >
                                    {loading ? t("admin.users.processing") : t("admin.users.stepper.next")}
                                </button>
                            )}

                            {/* Step 3: Complete Assignment */}
                            {currentStep === 3 && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading || !isAllDesignerDataValid()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                                >
                                    {loading ? t("admin.users.processing") : t("admin.users.stepper.complete")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UsersManagementPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserRole[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [showDesignerModal, setShowDesignerModal] = useState(false);
    const [selectedDesignerUser, setSelectedDesignerUser] = useState<UserRole | null>(null);

    const createDesignerMutation = useCreateDesigner();

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [emailFilter, setEmailFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");

    // Server-side pagination state
    const [totalUsers, setTotalUsers] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(0);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const { fetchUsers, fetchStores, assignStores, loading, error, clearError } = useUserManagement();

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [emailFilter, roleFilter]);

    // Fetch paginated users and stores
    const loadData = useCallback(async () => {
        try {
            setIsLoadingUsers(true);
            const [usersResponse, storesData] = await Promise.all([
                fetchUsers({
                    page: currentPage,
                    limit: itemsPerPage,
                    email: emailFilter || undefined,
                    role: roleFilter || undefined,
                }),
                fetchStores(),
            ]);

            setUsers(usersResponse.users);
            setTotalUsers(usersResponse.total);
            setServerTotalPages(usersResponse.totalPages);
            setStores(storesData);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [currentPage, itemsPerPage, emailFilter, roleFilter]);

    // Handle store assignment
    const handleAssignStores = async (email: string, storeIds: number[], designerData?: DesignerFormData) => {
        try {
            // First assign stores
            await assignStores(email, storeIds);

            // If designer data is provided, create designer profile
            if (designerData && selectedUser) {
                await createDesignerMutation.mutateAsync({
                    designerData,
                    userId: selectedUser.id,
                });
            }

            await loadData(); // Refresh data
        } catch (err) {
            console.error("Error assigning stores or creating designer:", err);
            throw err; // Re-throw to show error in UI
        }
    };

    // Open store assignment modal
    const openStoreModal = (user: UserRole) => {
        setSelectedUser(user);
        setShowStoreModal(true);
    };

    // Open designer details modal
    const openDesignerModal = (user: UserRole) => {
        setSelectedDesignerUser(user);
        setShowDesignerModal(true);
    };

    // Helper function to determine if user can assign stores
    const canAssignStores = (user: UserRole) => {
        const hasValidRole = user.roles.some((role) => role === "admin" || role === "store_admin");
        return hasValidRole;
    };

    // Helper function to determine if current user can edit designer details
    const canEditDesigner = () => {
        // For now, assume all users in this admin panel can edit
        // This could be enhanced with proper role checking
        return true;
    };

    // Load data when component mounts or when pagination/filters change
    useEffect(() => {
        loadData();
    }, [loadData]);

    if ((loading || isLoadingUsers) && users.length === 0) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("admin.userManagement")}</h1>
                <div className="text-center text-gray-600 dark:text-gray-300">{t("common.loading")}</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("admin.userManagement")}</h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                    {error}
                    <button
                        onClick={clearError}
                        className="ml-2 text-red-900 dark:text-red-200 hover:text-red-700 dark:hover:text-red-400"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Filter and Search Controls */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4 border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Email Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("admin.users.filterByEmail")}
                        </label>
                        <input
                            type="text"
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            placeholder={t("admin.users.searchByEmail")}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("admin.users.filterByRole")}
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">{t("admin.users.allRoles")}</option>
                            <option value="admin">{t("admin.users.admin")}</option>
                            <option value="store_admin">{t("admin.users.storeAdmin")}</option>
                            <option value="user">{t("admin.users.user")}</option>
                        </select>
                    </div>

                    {/* Items per page */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t("admin.users.itemsPerPage")}
                        </label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div>
                        <button
                            onClick={() => {
                                setEmailFilter("");
                                setRoleFilter("");
                                setCurrentPage(1);
                            }}
                            className="w-full bg-gray-500 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            {t("admin.users.clearFilters")}
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    {t("admin.users.showing")} {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, totalUsers)} {t("admin.users.of")} {totalUsers}{" "}
                    {t("admin.users.results")}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t("admin.users.email")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t("admin.users.roles")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t("admin.users.assignedStores")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t("admin.users.createdAt")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                {t("admin.users.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map((role) => (
                                            <span
                                                key={role}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    role === "admin"
                                                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                                        : role === "store_admin"
                                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                                }`}
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                    {user.store_details && user.store_details.length > 0 ? (
                                        <div className="space-y-1">
                                            {user.store_details.map((store) => (
                                                <div key={store.id} className="text-xs">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {store.name}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        ({store.code})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500">
                                            {t("admin.users.noStoresAssigned")}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        {/* Store Assignment - Only for users with valid roles (admin/store_admin) */}
                                        {!user.roles.includes("admin") && (
                                            <button
                                                onClick={() => openStoreModal(user)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            >
                                                {user.store_details && user.store_details.length > 0
                                                    ? t("admin.users.manageStores")
                                                    : t("admin.users.assignStores")}
                                            </button>
                                        )}

                                        {/* Designer Details - For store admins */}
                                        {user.roles.includes("store_admin") && (
                                            <button
                                                onClick={() => openDesignerModal(user)}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                            >
                                                {t("admin.users.viewDesigner")}
                                            </button>
                                        )}

                            
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {serverTotalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-4 rounded-lg">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || isLoadingUsers}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t("admin.users.previous")}
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(serverTotalPages, currentPage + 1))}
                            disabled={currentPage === serverTotalPages || isLoadingUsers}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t("admin.users.next")}
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {t("admin.users.page")} {currentPage} {t("admin.users.of")} {serverTotalPages} -{" "}
                                {t("admin.users.showing")} {(currentPage - 1) * itemsPerPage + 1}-
                                {Math.min(currentPage * itemsPerPage, totalUsers)} {t("admin.users.of")} {totalUsers}{" "}
                                {t("admin.users.results")}
                            </p>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || isLoadingUsers}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">{t("admin.users.previous")}</span>
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: serverTotalPages }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === serverTotalPages ||
                                        (page >= currentPage - 2 && page <= currentPage + 2)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                disabled={isLoadingUsers}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium disabled:opacity-50 transition-colors ${
                                                    page === currentPage
                                                        ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400"
                                                        : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 3 || page === currentPage + 3) {
                                        return (
                                            <span
                                                key={page}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(serverTotalPages, currentPage + 1))}
                                    disabled={currentPage === serverTotalPages || isLoadingUsers}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="sr-only">{t("admin.users.next")}</span>
                                    <svg
                                        className="h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
                >
                    {loading ? t("admin.users.refreshing") : t("admin.users.refreshData")}
                </button>
            </div>

            <StoreAssignmentModal
                user={selectedUser}
                stores={stores}
                isOpen={showStoreModal}
                onClose={() => {
                    setShowStoreModal(false);
                    setSelectedUser(null);
                }}
                onAssign={handleAssignStores}
                loading={loading}
            />

            <DesignerDetailsModal
                userId={selectedDesignerUser?.id || null}
                userEmail={selectedDesignerUser?.email || ""}
                isOpen={showDesignerModal}
                onClose={() => {
                    setShowDesignerModal(false);
                    setSelectedDesignerUser(null);
                }}
                canEdit={canEditDesigner()}
            />
        </div>
    );
}
