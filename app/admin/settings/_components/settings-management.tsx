'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import { Save, Trash2, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import {
    useSettings,
    useUpdateSetting,
    useDeleteSetting,
} from '../_hooks/use-settings'
import { useCurrencies } from '@/app/_hooks/use-currencies'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { HomepageSettings } from './homepage-settings'

interface PredefinedSetting {
    key: string
    label: string
    description: string
    type:
        | 'text'
        | 'textarea'
        | 'select'
        | 'number'
        | 'email'
        | 'url'
        | 'currency_select'
    defaultValue: string
    required?: boolean
    options?: Array<{ value: string; label: string }>
}

// Get predefined settings with translations
const getPredefinedSettings = (
    t: (key: string) => string
): PredefinedSetting[] => [
    {
        key: 'website_url',
        label: t('admin.settings.websiteUrl'),
        description: t('admin.settings.websiteUrlDescription'),
        type: 'url' as const,
        defaultValue: 'https://morpheus.com',
        required: true,
    },
    {
        key: 'default_currency_id',
        label: t('admin.settings.defaultCurrency'),
        description: t('admin.settings.defaultCurrencyDescription'),
        type: 'currency_select' as const,
        defaultValue: '',
        required: false,
    },
    {
        key: 'delivery_fee',
        label: t('admin.settings.deliveryFee'),
        description: t('admin.settings.deliveryFeeDescription'),
        type: 'number' as const,
        defaultValue: '10',
        required: false,
    },
    {
        key: 'delivery_fee_currency_id',
        label: t('admin.settings.deliveryFeeCurrency'),
        description: t('admin.settings.deliveryFeeCurrencyDescription'),
        type: 'currency_select' as const,
        defaultValue: '',
        required: false,
    },
    {
        key: 'powered_by',
        label: t('admin.settings.poweredBy'),
        description: t('admin.settings.poweredByDescription'),
        type: 'text' as const,
        defaultValue: '',
        required: false,
    },
    {
        key: 'mellime_url',
        label: t('admin.settings.mellimeUrl'),
        description: t('admin.settings.mellimeUrlDescription'),
        type: 'url' as const,
        defaultValue: '',
        required: false,
    },
]

export function SettingsManagement() {
    const { t } = useLanguage()
    const { data: settings, isLoading, error } = useSettings()
    const { data: currencies = [], isLoading: isLoadingCurrencies } =
        useCurrencies()
    const updateSetting = useUpdateSetting()
    const deleteSetting = useDeleteSetting()

    const [editingSettings, setEditingSettings] = useState<
        Record<string, string>
    >({})

    // Get predefined settings with current translations
    const PREDEFINED_SETTINGS = getPredefinedSettings(t)

    // Get current value for a setting
    const getCurrentValue = (key: string) => {
        const setting = settings?.find((s) => s.key === key)
        return setting?.value || ''
    }

    // Get editing value or current value
    const getDisplayValue = (key: string) => {
        return editingSettings[key] !== undefined
            ? editingSettings[key]
            : getCurrentValue(key)
    }

    // Handle input change for predefined settings
    const handleSettingChange = (key: string, value: string) => {
        setEditingSettings((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    // Save a specific setting
    const handleSaveSetting = async (key: string) => {
        const value = editingSettings[key]
        if (value === undefined) return

        try {
            await updateSetting.mutateAsync({ key, value })
            setEditingSettings((prev) => {
                const newState = { ...prev }
                delete newState[key]
                return newState
            })
        } catch (error) {
            console.error('Failed to save setting:', error)
        }
    }

    // Cancel editing a setting
    const handleCancelEdit = (key: string) => {
        setEditingSettings((prev) => {
            const newState = { ...prev }
            delete newState[key]
            return newState
        })
    }

    // Delete setting (only for non-required settings)
    const handleDeleteSetting = async (key: string) => {
        const setting = PREDEFINED_SETTINGS.find((s) => s.key === key)
        if (setting?.required) {
            toast.error(t('admin.settings.settingRequired'))
            return
        }

        if (
            window.confirm(
                `${t('admin.settings.confirmDeleteSetting')} "${key}"?`
            )
        ) {
            try {
                await deleteSetting.mutateAsync(key)
            } catch (error) {
                console.error('Failed to delete setting:', error)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                    {t('admin.settings.loadingSettings')}
                </span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                {t('admin.settings.errorLoadingSettings')}: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <SettingsIcon className="text-blue-600 h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('admin.settings.title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('admin.settings.subtitle')}
                    </p>
                </div>
            </div>

            {/* Predefined Settings */}
            <Card className="border-gray-200 bg-white shadow-xl">
                <CardHeader>
                    <CardTitle className="text-gray-900">
                        {t('admin.settings.applicationSettings')}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {t('admin.settings.configureCore')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {PREDEFINED_SETTINGS.map((setting) => {
                        const currentValue = getDisplayValue(setting.key)
                        const isEditing =
                            editingSettings[setting.key] !== undefined
                        const hasChanges =
                            isEditing &&
                            editingSettings[setting.key] !==
                                getCurrentValue(setting.key)

                        return (
                            <div key={setting.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="font-medium text-gray-900">
                                            {setting.label}
                                        </Label>
                                        <p className="text-sm text-gray-600">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getCurrentValue(setting.key) && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {t('admin.settings.settingSet')}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        {setting.type === 'textarea' ? (
                                            <Textarea
                                                value={currentValue}
                                                onChange={(e) =>
                                                    handleSettingChange(
                                                        setting.key,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    setting.defaultValue
                                                }
                                                className="border-gray-300 bg-white text-gray-900"
                                                rows={3}
                                            />
                                        ) : setting.type === 'select' ? (
                                            <select
                                                value={currentValue}
                                                onChange={(e) =>
                                                    handleSettingChange(
                                                        setting.key,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                                            >
                                                <option value="">
                                                    Select...
                                                </option>
                                                {setting.options?.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        ) : setting.type ===
                                          'currency_select' ? (
                                            <select
                                                value={currentValue}
                                                onChange={(e) =>
                                                    handleSettingChange(
                                                        setting.key,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                                                disabled={isLoadingCurrencies}
                                            >
                                                <option value="">
                                                    {t(
                                                        'admin.settings.selectDefaultCurrency'
                                                    )}
                                                </option>
                                                {currencies.map((currency) => (
                                                    <option
                                                        key={currency.xdeviseid}
                                                        value={currency.xdeviseid.toString()}
                                                    >
                                                        {
                                                            currency.xdeviseintitule
                                                        }{' '}
                                                        (
                                                        {
                                                            currency.xdevisecodealpha
                                                        }
                                                        )
                                                        {currency.xispivot
                                                            ? ` ${t('admin.settings.pivotCurrency')}`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                type={setting.type}
                                                value={currentValue}
                                                onChange={(e) =>
                                                    handleSettingChange(
                                                        setting.key,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={
                                                    setting.defaultValue
                                                }
                                                className="border-gray-300 bg-white text-gray-900"
                                                required={setting.required}
                                            />
                                        )}
                                    </div>

                                    <div className="flex gap-1">
                                        {hasChanges && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSaveSetting(
                                                            setting.key
                                                        )
                                                    }
                                                    disabled={
                                                        updateSetting.isPending
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    {updateSetting.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleCancelEdit(
                                                            setting.key
                                                        )
                                                    }
                                                >
                                                    {t('admin.settings.cancel')}
                                                </Button>
                                            </>
                                        )}
                                        {getCurrentValue(setting.key) &&
                                            !hasChanges &&
                                            !setting.required && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDeleteSetting(
                                                            setting.key
                                                        )
                                                    }
                                                    disabled={
                                                        deleteSetting.isPending
                                                    }
                                                >
                                                    {deleteSetting.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Homepage Settings */}
            <HomepageSettings />
        </div>
    )
}
