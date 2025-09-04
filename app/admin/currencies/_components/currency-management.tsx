'use client'
import React, { useState, useMemo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import {
    Plus,
    Edit,
    Trash2,
    DollarSign,
    CheckCircle,
    X,
    Save,
    AlertTriangle,
    Package,
    Star,
    TrendingUp,
} from 'lucide-react'
import { useCurrenciesWithStats } from '../_hooks/use-currencies-with-stats'
import { useCreateCurrency } from '../_hooks/use-create-currency'
import { useUpdateCurrency } from '../_hooks/use-update-currency'
import { useDeleteCurrency } from '../_hooks/use-delete-currency'
import { usePivotChange } from '../_hooks/use-pivot-change'
import { PivotChangeDialog } from './pivot-change-dialog'
import { EditCurrencyDialog } from './edit-currency-dialog'
import type { Database } from '@/lib/supabase'

type Currency = Database['morpheus']['Tables']['xdevise']['Row'] & {
    yvarprod: { count: number }[]
}

interface CurrencyFormData {
    xdeviseintitule: string
    xdeviseintitulefr: string
    xdevisecodealpha: string
    xdevisecodenum: string
    xdevisenbrdec: number
    xdeviseboolautorisepaiement: string
    xispivot: boolean
    xtauxechange: number
}

export function CurrencyManagement() {
    const { t } = useLanguage()
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(
        null
    )
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [formData, setFormData] = useState<CurrencyFormData>({
        xdeviseintitule: '',
        xdeviseintitulefr: '',
        xdevisecodealpha: '',
        xdevisecodenum: '',
        xdevisenbrdec: 2,
        xdeviseboolautorisepaiement: 'false',
        xispivot: false,
        xtauxechange: 1.0,
    })

    const { data: currencies, isLoading } = useCurrenciesWithStats()
    const createCurrencyMutation = useCreateCurrency()
    const updateCurrencyMutation = useUpdateCurrency()
    const deleteCurrencyMutation = useDeleteCurrency()
    const pivotChangeHook = usePivotChange()
    const { openPivotChangeDialog } = pivotChangeHook

    // Get current pivot currency
    const currentPivotCurrency = currencies?.find(
        (currency) => currency.xispivot
    )

    // Helper function to get variant count
    const getVariantCount = (currency: Currency) => {
        return currency.yvarprod?.[0]?.count || 0
    }

    // Define table columns
    const columns = useMemo<ColumnDef<Currency>[]>(
        () => [
            {
                id: 'pivot',
                header: '',
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        {row.original.xispivot && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                    </div>
                ),
                enableSorting: false,
                size: 50,
            },
            {
                accessorKey: 'xdeviseintitule',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="h-auto p-0 font-semibold text-gray-900 hover:text-blue-600"
                    >
                        {t('admin.currencies.currencyName')}
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.xdeviseintitule}
                    </div>
                ),
            },
            {
                accessorKey: 'xdeviseintitulefr',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="h-auto p-0 font-semibold text-gray-900 hover:text-blue-600"
                    >
                        {t('admin.currencies.currencyNameFrench')}
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.xdeviseintitulefr}
                    </div>
                ),
            },
            {
                id: 'codes',
                header: t('admin.currencies.codes'),
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                            {row.original.xdevisecodealpha}
                        </div>
                        <div className="text-xs text-gray-500">
                            {row.original.xdevisecodenum}
                        </div>
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'xdevisenbrdec',
                header: t('admin.currencies.decimals'),
                cell: ({ row }) => (
                    <div className="font-medium text-gray-900">
                        {row.original.xdevisenbrdec}
                    </div>
                ),
            },
            {
                accessorKey: 'xtauxechange',
                header: t('admin.currencies.exchangeRate'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 font-medium text-gray-900">
                        {row.original.xispivot ? (
                            <span className="text-yellow-600">1.0 (Pivot)</span>
                        ) : (
                            <>
                                <TrendingUp className="h-3 w-3 text-blue-600" />
                                {row.original.xtauxechange || 1.0}
                            </>
                        )}
                    </div>
                ),
            },
            {
                id: 'status',
                header: t('admin.currencies.status'),
                cell: ({ row }) => {
                    const variantCount = getVariantCount(row.original)
                    const isInUse = variantCount > 0
                    const isPaymentEnabled =
                        row.original.xdeviseboolautorisepaiement === 'Y'

                    return (
                        <div className="flex flex-wrap gap-1">
                            {row.original.xispivot && (
                                <Badge className="flex items-center gap-1 border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                    <Star className="h-3 w-3" />
                                    {t('admin.currencies.pivot')}
                                </Badge>
                            )}
                            {isPaymentEnabled && (
                                <Badge className="flex items-center gap-1 border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                    <CheckCircle className="h-3 w-3" />
                                    {t('admin.currencies.payment')}
                                </Badge>
                            )}
                            {isInUse && (
                                <Badge className="flex items-center gap-1 border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    <Package className="h-3 w-3" />
                                    {variantCount}{' '}
                                    {t('admin.currencies.variants')}
                                </Badge>
                            )}
                        </div>
                    )
                },
                enableSorting: false,
            },
            {
                id: 'actions',
                header: t('admin.currencies.actions'),
                cell: ({ row }) => {
                    const variantCount = getVariantCount(row.original)
                    const isInUse = variantCount > 0
                    const isPivot = row.original.xispivot

                    return (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(row.original)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <Edit className="mr-1 h-4 w-4" />
                                {t('common.edit')}
                            </Button>

                            {!isPivot && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleSetAsPivot(row.original)
                                    }}
                                    disabled={pivotChangeHook.isLoading}
                                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Star className="mr-1 h-4 w-4" />
                                    {t('admin.currencies.setAsPivot')}
                                </Button>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className={
                                            isInUse || isPivot
                                                ? 'cursor-not-allowed'
                                                : ''
                                        }
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(
                                                    row.original.xdeviseid
                                                )
                                            }
                                            disabled={
                                                deleteCurrencyMutation.isPending ||
                                                isInUse ||
                                                isPivot
                                            }
                                            className={`px-3 ${
                                                isInUse || isPivot
                                                    ? 'cursor-not-allowed border-gray-300 text-gray-400'
                                                    : 'border-red-300 text-red-600 hover:bg-red-50'
                                            }`}
                                        >
                                            {isInUse || isPivot ? (
                                                <AlertTriangle className="h-4 w-4" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {isPivot
                                            ? t(
                                                  'admin.currencies.cannotDeletePivot'
                                              )
                                            : isInUse
                                              ? `Cannot delete: Currency used by ${variantCount} product variant${variantCount !== 1 ? 's' : ''}`
                                              : t(
                                                    'admin.currencies.deleteCurrency'
                                                )}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                },
                enableSorting: false,
            },
        ],
        [deleteCurrencyMutation.isPending, t]
    )

    const resetForm = () => {
        setFormData({
            xdeviseintitule: '',
            xdeviseintitulefr: '',
            xdevisecodealpha: '',
            xdevisecodenum: '',
            xdevisenbrdec: 2,
            xdeviseboolautorisepaiement: 'false',
            xispivot: false,
            xtauxechange: 1.0,
        })
        setEditingCurrency(null)
        setShowForm(false)
    }

    const handleEdit = (currency: Currency) => {
        setEditingCurrency(currency)
        setShowEditDialog(true)
    }

    const handleCloseEditDialog = () => {
        setEditingCurrency(null)
        setShowEditDialog(false)
    }

    const handleSetAsPivot = (currency: Currency) => {
        if (!currencies) {
            return
        }

        // Prevent multiple clicks by checking if already loading
        if (pivotChangeHook.isLoading) {
            return
        }

        // Ensure we have fresh data
        openPivotChangeDialog(currency, currencies)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await createCurrencyMutation.mutateAsync(formData)
            resetForm()
        } catch {
            // Error handling is done by the mutation hooks
        }
    }

    const handleDelete = async (currencyId: number) => {
        if (confirm(t('admin.currencies.confirmDelete'))) {
            try {
                await deleteCurrencyMutation.mutateAsync(currencyId)
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : t('admin.currencies.failedToDelete')
                alert(errorMessage)
            }
        }
    }

    const validateForm = () => {
        const basicValidation =
            formData.xdeviseintitule.trim() !== '' &&
            formData.xdevisecodealpha.trim() !== '' &&
            formData.xdevisecodenum.trim() !== '' &&
            formData.xdevisenbrdec >= 0

        // If this is set as pivot currency, exchange rate must be positive
        if (formData.xispivot && formData.xtauxechange <= 0) {
            return false
        }

        return basicValidation
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="border-morpheus-gold-light/30 border-t-morpheus-gold-light mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
                        <p className="text-lg text-gray-900">
                            {t('admin.currencies.loadingCurrencies')}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">
                        {t('admin.currencies.title')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('admin.currencies.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-light hover:to-morpheus-gold-dark bg-gradient-to-r text-white shadow-lg"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('admin.currencies.addCurrency')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t('admin.currencies.totalCurrencies')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {currencies?.length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t('admin.currencies.currenciesInUse')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {currencies?.filter(
                                        (curr) => getVariantCount(curr) > 0
                                    ).length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t('admin.currencies.paymentEnabled')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {currencies?.filter(
                                        (curr) =>
                                            curr.xdeviseboolautorisepaiement ===
                                            'Y'
                                    ).length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <Star className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    {t('admin.currencies.pivotCurrency')}
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {currentPivotCurrency?.xdevisecodealpha ||
                                        t('common.none')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pivot Currency Info */}
            {currentPivotCurrency && (
                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-white/50 shadow-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-800">
                                    {t('admin.currencies.currentPivotCurrency')}
                                    : {currentPivotCurrency.xdeviseintitule} (
                                    {currentPivotCurrency.xdevisecodealpha})
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t('admin.currencies.exchangeRate')}:{' '}
                                    {currentPivotCurrency.xtauxechange || 1.0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Currency Form */}
            {showForm && (
                <Card className="border-gray-200 bg-gradient-to-br from-gray-50/50 to-white/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                            {t('admin.currencies.addNewCurrency')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-gray-900">
                                        {t(
                                            'admin.currencies.currencyNameRequired'
                                        )}
                                    </Label>
                                    <Input
                                        value={formData.xdeviseintitule}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdeviseintitule: e.target.value,
                                            }))
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder={t(
                                            'admin.currencies.currencyNamePlaceholder'
                                        )}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-900">
                                        {t(
                                            'admin.currencies.currencyNameFrench'
                                        )}
                                    </Label>
                                    <Input
                                        value={formData.xdeviseintitulefr}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdeviseintitulefr:
                                                    e.target.value,
                                            }))
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder={t(
                                            'admin.currencies.currencyNameFrenchPlaceholder'
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-900">
                                        {t(
                                            'admin.currencies.alphaCodeRequired'
                                        )}
                                    </Label>
                                    <Input
                                        value={formData.xdevisecodealpha}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdevisecodealpha:
                                                    e.target.value.toUpperCase(),
                                            }))
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder={t(
                                            'admin.currencies.alphaCodePlaceholder'
                                        )}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-900">
                                        {t(
                                            'admin.currencies.numericCodeRequired'
                                        )}
                                    </Label>
                                    <Input
                                        value={formData.xdevisecodenum}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdevisecodenum: e.target.value,
                                            }))
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder={t(
                                            'admin.currencies.numericCodePlaceholder'
                                        )}
                                        maxLength={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-900">
                                        {t(
                                            'admin.currencies.decimalPlacesRequired'
                                        )}
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="4"
                                        value={formData.xdevisenbrdec}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdevisenbrdec:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            }))
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowPayment"
                                        checked={
                                            formData.xdeviseboolautorisepaiement ===
                                            'true'
                                        }
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xdeviseboolautorisepaiement: e
                                                    .target.checked
                                                    ? 'true'
                                                    : 'false',
                                            }))
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor="allowPayment"
                                        className="text-gray-900"
                                    >
                                        {t('admin.currencies.allowPayments')}
                                    </Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="isPivot"
                                        checked={formData.xispivot}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                xispivot: checked,
                                                // Set exchange rate to 1.0 when setting as pivot
                                                xtauxechange: checked
                                                    ? 1.0
                                                    : prev.xtauxechange,
                                            }))
                                        }
                                        className="data-[state=checked]:bg-yellow-500"
                                    />
                                    <Label
                                        htmlFor="isPivot"
                                        className="flex items-center gap-1 text-gray-900"
                                    >
                                        <Star className="h-4 w-4 text-yellow-600" />
                                        Set as Pivot Currency
                                    </Label>
                                </div>
                            </div>

                            {formData.xispivot && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        <p className="font-medium text-yellow-800">
                                            Pivot Currency Settings
                                        </p>
                                    </div>
                                    <p className="mb-3 text-sm text-gray-600">
                                        Setting this currency as pivot will
                                        automatically unset the current pivot
                                        currency. The exchange rate for pivot
                                        currency should typically be 1.0.
                                    </p>
                                    <div>
                                        <Label className="text-gray-900">
                                            Exchange Rate
                                        </Label>
                                        <Input
                                            type="number"
                                            step="any"
                                            min="0.0000000001"
                                            value={formData.xtauxechange}
                                            onChange={(e) => {
                                                const inputValue =
                                                    e.target.value
                                                const maxDecimals =
                                                    formData.xdevisenbrdec

                                                // Check decimal places
                                                const decimalIndex =
                                                    inputValue.indexOf('.')
                                                const actualDecimals =
                                                    decimalIndex === -1
                                                        ? 0
                                                        : inputValue.length -
                                                          decimalIndex -
                                                          1

                                                if (
                                                    actualDecimals <=
                                                    maxDecimals
                                                ) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        xtauxechange:
                                                            parseFloat(
                                                                inputValue
                                                            ) || 1.0,
                                                    }))
                                                }
                                            }}
                                            className="border-gray-300 bg-white text-gray-900"
                                            placeholder="1.0000000000"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {!formData.xispivot && (
                                <div>
                                    <Label className="text-gray-900">
                                        1{' '}
                                        {currentPivotCurrency?.xdevisecodealpha ||
                                            'Pivot'}{' '}
                                        = {formData.xtauxechange || 1.0}{' '}
                                        {formData.xdeviseintitule ||
                                            'This Currency'}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <Input
                                            type="number"
                                            step="any"
                                            min="0.0000000001"
                                            value={formData.xtauxechange}
                                            onChange={(e) => {
                                                const inputValue =
                                                    e.target.value
                                                const maxDecimals =
                                                    formData.xdevisenbrdec

                                                // Check decimal places
                                                const decimalIndex =
                                                    inputValue.indexOf('.')
                                                const actualDecimals =
                                                    decimalIndex === -1
                                                        ? 0
                                                        : inputValue.length -
                                                          decimalIndex -
                                                          1

                                                if (
                                                    actualDecimals <=
                                                    maxDecimals
                                                ) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        xtauxechange:
                                                            parseFloat(
                                                                inputValue
                                                            ) || 1.0,
                                                    }))
                                                }
                                            }}
                                            className="border-gray-300 bg-white text-gray-900"
                                            placeholder="1.0000000000"
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        How many units of this currency equal 1
                                        unit of the pivot currency
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={
                                        !validateForm() ||
                                        createCurrencyMutation.isPending ||
                                        updateCurrencyMutation.isPending
                                    }
                                    className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('admin.currencies.createCurrency')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetForm}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Currencies Table */}
            <DataTable
                data={currencies || []}
                columns={columns}
                isLoading={isLoading}
                globalFilter={searchTerm}
                onGlobalFilterChange={setSearchTerm}
            />

            {/* Edit Currency Dialog */}
            <EditCurrencyDialog
                currency={editingCurrency}
                isOpen={showEditDialog}
                onClose={handleCloseEditDialog}
            />

            {/* Pivot Change Dialog */}
            <PivotChangeDialog pivotChangeHook={pivotChangeHook} />
        </div>
    )
}
