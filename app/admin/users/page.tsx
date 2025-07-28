"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRole, Store } from "@/lib/types/user";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useLanguage } from "@/hooks/useLanguage";

interface StoreAssignmentModalProps {
    user: UserRole | null;
    stores: Store[];
    isOpen: boolean;
    onClose: () => void;
    onAssign: (email: string, storeIds: number[]) => Promise<void>;
    loading: boolean;
}

function StoreAssignmentModal({ user, stores, isOpen, onClose, onAssign, loading }: StoreAssignmentModalProps) {
    const { t } = useLanguage();
    const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (user) {
            setSelectedStoreIds(user.assigned_stores || []);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            await onAssign(user.email, selectedStoreIds);
            onClose();
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

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">
                    {t("admin.users.assignBoutiques")} {user.email}
                    <span className="text-sm font-normal text-gray-600 ml-2">
                        ({selectedStoreIds.length} {t("admin.users.selected")})
                    </span>
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    {/* Search and bulk actions */}
                    <div className="mb-4 space-y-2">
                        <input
                            type="text"
                            placeholder={t("admin.users.searchBoutiques")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={selectAllStores}
                                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded"
                            >
                                {t("admin.users.selectAll")} ({filteredStores.length})
                            </button>
                            <button
                                type="button"
                                onClick={clearAllStores}
                                className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
                            >
                                {t("admin.users.clearAll")}
                            </button>
                        </div>
                    </div>

                    {/* Store list */}
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 max-h-96">
                        {filteredStores.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                {searchTerm ? t("admin.users.noBoutiquesFound") : t("admin.users.noBoutiquesAvailable")}
                            </div>
                        ) : (
                            filteredStores.map((store) => (
                                <label
                                    key={store.id}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedStoreIds.includes(store.id)
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedStoreIds.includes(store.id)}
                                        onChange={() => toggleStore(store.id)}
                                        className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 truncate">{store.name}</h4>
                                            <span className="text-sm text-gray-500 font-mono">{store.code}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                                        {store.mallId && (
                                            <p className="text-xs text-gray-500 mt-1">Mall ID: {store.mallId}</p>
                                        )}
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            {selectedStoreIds.length}{" "}
                            {selectedStoreIds.length !== 1
                                ? t("admin.users.boutiquesSelected")
                                : t("admin.users.boutiqueSelected")}{" "}
                            {t("admin.users.selected")}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                {loading
                                    ? t("admin.users.assigning")
                                    : `${t("admin.users.assign")} ${selectedStoreIds.length} ${
                                          selectedStoreIds.length !== 1
                                              ? t("admin.users.boutiquesSelected")
                                              : t("admin.users.boutiqueSelected")
                                      }`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UsersManagementPage() {
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserRole[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
    const [showStoreModal, setShowStoreModal] = useState(false);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [emailFilter, setEmailFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("");

    // Server-side pagination state
    const [totalUsers, setTotalUsers] = useState(0);
    const [serverTotalPages, setServerTotalPages] = useState(0);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const { fetchUsers, updateUserRole, fetchStores, assignStores, loading, error, clearError } = useUserManagement();

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

    // Update user role
    const handleUpdateUserRole = async (email: string, newRole: "user" | "store_admin") => {
        try {
            setUpdating(email);
            await updateUserRole(email, newRole);
            await loadData(); // Refresh data
        } catch (err) {
            console.error("Error updating user role:", err);
        } finally {
            setUpdating(null);
        }
    };

    // Handle store assignment
    const handleAssignStores = async (email: string, storeIds: number[]) => {
        try {
            await assignStores(email, storeIds);
            await loadData(); // Refresh data
        } catch (err) {
            console.error("Error assigning stores:", err);
        }
    };

    // Open store assignment modal
    const openStoreModal = (user: UserRole) => {
        setSelectedUser(user);
        setShowStoreModal(true);
    };

    // Load data when component mounts or when pagination/filters change
    useEffect(() => {
        loadData();
    }, [loadData]);

    if ((loading || isLoadingUsers) && users.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">{t("admin.userManagement")}</h1>
                <div className="text-center">{t("common.loading")}</div>
            </div>
        );
    }

    return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">{t("admin.userManagement")}</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                        <button onClick={clearError} className="ml-2 text-red-900 hover:text-red-700">
                            ×
                        </button>
                    </div>
                )}

                {/* Filter and Search Controls */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Email Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("admin.users.filterByEmail")}
                            </label>
                            <input
                                type="text"
                                value={emailFilter}
                                onChange={(e) => setEmailFilter(e.target.value)}
                                placeholder={t("admin.users.searchByEmail")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("admin.users.filterByRole")}
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">{t("admin.users.allRoles")}</option>
                                <option value="admin">{t("admin.users.admin")}</option>
                                <option value="store_admin">{t("admin.users.storeAdmin")}</option>
                                <option value="user">{t("admin.users.user")}</option>
                            </select>
                        </div>

                        {/* Items per page */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t("admin.users.itemsPerPage")}
                            </label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {t("admin.users.clearFilters")}
                            </button>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-4 text-sm text-gray-600">
                        {t("admin.users.showing")} {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, totalUsers)} {t("admin.users.of")} {totalUsers}{" "}
                        {t("admin.users.results")}
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.users.email")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.users.roles")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.users.assignedStores")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.users.createdAt")}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("admin.users.actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        role === "admin"
                                                            ? "bg-red-100 text-red-800"
                                                            : role === "store_admin"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.store_details && user.store_details.length > 0 ? (
                                            <div className="space-y-1">
                                                {user.store_details.map((store) => (
                                                    <div key={store.id} className="text-xs">
                                                        <span className="font-medium">{store.name}</span> ({store.code})
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">{t("admin.users.noStoresAssigned")}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!user.roles.includes("admin") && (
                                            <div className="flex space-x-2">
                                                {user.roles.includes("store_admin") ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.email, "user")}
                                                            disabled={updating === user.email}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            {updating === user.email
                                                                ? t("admin.users.updating")
                                                                : t("admin.users.removeStoreAdmin")}
                                                        </button>
                                                        <button
                                                            onClick={() => openStoreModal(user)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            {t("admin.users.assignStores")}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateUserRole(user.email, "store_admin")}
                                                        disabled={updating === user.email}
                                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                    >
                                                        {updating === user.email
                                                            ? t("admin.users.updating")
                                                            : t("admin.users.makeStoreAdmin")}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {serverTotalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1 || isLoadingUsers}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("admin.users.previous")}
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(serverTotalPages, currentPage + 1))}
                                disabled={currentPage === serverTotalPages || isLoadingUsers}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t("admin.users.next")}
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    {t("admin.users.page")} {currentPage} {t("admin.users.of")} {serverTotalPages} -{" "}
                                    {t("admin.users.showing")} {(currentPage - 1) * itemsPerPage + 1}-
                                    {Math.min(currentPage * itemsPerPage, totalUsers)} {t("admin.users.of")}{" "}
                                    {totalUsers} {t("admin.users.results")}
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
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium disabled:opacity-50 ${
                                                        page === currentPage
                                                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                                            return (
                                                <span
                                                    key={page}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
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
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
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
            </div>
    );
}
