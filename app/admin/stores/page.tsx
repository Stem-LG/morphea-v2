'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Store, Calendar, Building2 } from 'lucide-react'
import { useQueryStates, parseAsInteger } from 'nuqs'
import { useEvents, getFirstActiveEvent } from './_hooks/use-events'
import { useMalls } from './_hooks/use-malls'
import { useFilteredStores } from './_hooks/use-filtered-stores'
import {
    useCreateStore,
    useUpdateStore,
    useDeleteStore,
} from './_hooks/use-store-mutations'
import { StoreCardSkeleton } from './_components/store_card_skeleton'
import { StoreCard } from './_components/store_card'
import { StoreDialog } from './_components/store-dialog'
import { DeleteConfirmationDialog } from './_components/delete-confirmation-dialog'
import { useState } from 'react'

interface Store {
    yboutiqueid: number
    yboutiqueintitule: string
    yboutiqueadressemall?: string
    ymallidfk?: number
}

export default function StoresManagement() {
    const { t } = useLanguage()
    const { data: user } = useAuth()

    const isAdmin = user?.app_metadata?.roles?.includes('admin')
    const isStoreAdmin = user?.app_metadata?.roles?.includes('store_admin')

    // URL state for filters using nuqs
    const [{ eventId: selectedEventId, mallId: selectedMallId }, setFilters] =
        useQueryStates({
            eventId: parseAsInteger,
            mallId: parseAsInteger,
        })

    // Fetch data
    const { data: events, isLoading: eventsLoading } = useEvents()
    const { data: malls, isLoading: mallsLoading } = useMalls()

    // Get user role for the filtered stores hook
    const userRole = isAdmin ? 'admin' : isStoreAdmin ? 'store_admin' : 'other'

    const {
        data: stores,
        isLoading,
        isError,
        error,
    } = useFilteredStores({
        eventId: selectedEventId,
        mallId: selectedMallId,
        userRole,
        userId: user?.id,
    })

    // Set default event on load
    useEffect(() => {
        if (events && events.length > 0 && !selectedEventId) {
            if (isStoreAdmin) {
                // For store admins, default to first active event
                const activeEvent = getFirstActiveEvent(events)
                if (activeEvent) {
                    setFilters({ eventId: activeEvent.yeventid })
                }
            } else if (isAdmin) {
                // For admins, optionally set to first active event or leave unselected
                const activeEvent = getFirstActiveEvent(events)
                if (activeEvent) {
                    setFilters({ eventId: activeEvent.yeventid })
                }
            }
        }
    }, [events, selectedEventId, isStoreAdmin, isAdmin, setFilters])
    const createStoreMutation = useCreateStore()
    const updateStoreMutation = useUpdateStore()
    const deleteStoreMutation = useDeleteStore()

    // Dialog states
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false)
    const [editingStore, setEditingStore] = useState<Store | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null)

    // Handlers
    const handleAddStore = () => {
        setEditingStore(null)
        setIsStoreDialogOpen(true)
    }

    const handleEditStore = (store: Store) => {
        setEditingStore(store)
        setIsStoreDialogOpen(true)
    }

    const handleDeleteStore = (store: Store) => {
        console.log('handleDeleteStore called with:', store.yboutiqueintitule);
        setStoreToDelete(store)
        setIsDeleteDialogOpen(true)
        console.log('Dialog should be open now');
    }

    const handleStoreSubmit = async (storeData: {
        yboutiqueintitule: string
        yboutiqueadressemall?: string
        ymallidfk: number
    }) => {
        try {
            if (editingStore) {
                // Update existing store
                await updateStoreMutation.mutateAsync({
                    id: editingStore.yboutiqueid,
                    storeData,
                })
            } else {
                // Create new store
                await createStoreMutation.mutateAsync(storeData)
            }
            setIsStoreDialogOpen(false)
            setEditingStore(null)
        } catch (error) {
            console.error('Error saving store:', error)
            throw error
        }
    }

    const handleConfirmDelete = async () => {
        if (!storeToDelete) return

        try {
            await deleteStoreMutation.mutateAsync(storeToDelete.yboutiqueid)
            setIsDeleteDialogOpen(false)
            setStoreToDelete(null)
        } catch (error) {
            console.error('Error deleting store:', error)
        }
    }

    const handleCloseStoreDialog = () => {
        setIsStoreDialogOpen(false)
        setEditingStore(null)
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setStoreToDelete(null)
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                        {t('admin.storeManagement')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {isAdmin
                            ? t('admin.manageAllStores')
                            : `${stores?.length || 0} ${t('admin.assignedStores')}`}
                    </p>
                </div>

                {isAdmin && (
                    <Button
                        onClick={handleAddStore}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('admin.addNewStore')}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Event Selector */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-gray-900">
                                <Calendar className="text-blue-600 h-4 w-4" />
                                {t('admin.selectEvent')} {isStoreAdmin && '*'}
                            </Label>
                            <Select
                                value={selectedEventId?.toString() || 'all'}
                                onValueChange={(value) =>
                                    setFilters({
                                        eventId:
                                            value === 'all'
                                                ? null
                                                : parseInt(value),
                                    })
                                }
                                disabled={eventsLoading}
                            >
                                <SelectTrigger className="focus:border-blue-500 border-gray-300 bg-white text-gray-900 shadow-sm">
                                    <SelectValue
                                        placeholder={
                                            eventsLoading
                                                ? t('admin.loadingEvents')
                                                : t('admin.selectEvent')
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white shadow-lg">
                                    {isAdmin && (
                                        <SelectItem
                                            value="all"
                                            className="text-gray-900 focus:bg-gray-100"
                                        >
                                            {t('admin.allEvents')}
                                        </SelectItem>
                                    )}
                                    {events?.map((event) => (
                                        <SelectItem
                                            key={event.yeventid}
                                            value={event.yeventid.toString()}
                                            className="text-gray-900 focus:bg-gray-100"
                                        >
                                            {event.yeventintitule}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isStoreAdmin && !selectedEventId && (
                                <p className="text-sm text-yellow-600">
                                    {t('admin.eventRequiredForDesigners')}
                                </p>
                            )}
                        </div>

                        {/* Mall Selector */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-gray-900">
                                <Building2 className="text-blue-600 h-4 w-4" />
                                {t('admin.selectMall')}
                            </Label>
                            <Select
                                value={selectedMallId?.toString() || 'all'}
                                onValueChange={(value) =>
                                    setFilters({
                                        mallId:
                                            value === 'all'
                                                ? null
                                                : parseInt(value),
                                    })
                                }
                                disabled={mallsLoading}
                            >
                                <SelectTrigger className="focus:border-blue-500 border-gray-300 bg-white text-gray-900 shadow-sm">
                                    <SelectValue
                                        placeholder={
                                            mallsLoading
                                                ? t('admin.loadingMalls')
                                                : t('admin.allMalls')
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white shadow-lg">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 focus:bg-gray-100"
                                    >
                                        {t('admin.allMalls')}
                                    </SelectItem>
                                    {malls?.map((mall) => (
                                        <SelectItem
                                            key={mall.ymallid}
                                            value={mall.ymallid.toString()}
                                            className="text-gray-900 focus:bg-gray-100"
                                        >
                                            {mall.ymallintitule}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <StoreCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-white/50 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <Store className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                {t('admin.errorLoadingStores')}
                            </h3>
                            <p className="mb-4 text-gray-600">
                                {error?.message || t('common.error')}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                {t('common.retry') || 'Retry'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Stores List */}
                {!isLoading && !isError && stores && (
                    <>
                        {stores.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                            <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <Store className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                        {t('admin.noStoresFound')}
                                    </h3>
                                    <p className="mb-6 text-gray-600">
                                        {isAdmin
                                            ? t('admin.noStoresDescription')
                                            : isStoreAdmin
                                              ? selectedEventId
                                                  ? 'No stores are assigned to you for the selected event and mall.'
                                                  : 'Please select an event to view your assigned stores.'
                                              : t(
                                                    'admin.noAssignedStoresDescription'
                                                )}
                                    </p>
                                    {isAdmin && (
                                        <Button
                                            onClick={handleAddStore}
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-semibold text-white transition-all duration-300 hover:scale-105"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('admin.addNewStore')}
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
                isLoading={
                    createStoreMutation.isPending ||
                    updateStoreMutation.isPending
                }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                storeName={storeToDelete?.yboutiqueintitule || ''}
                isLoading={deleteStoreMutation.isPending}
            />
        </div>
    )
}
