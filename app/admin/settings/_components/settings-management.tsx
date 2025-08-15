'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

import { Save, Trash2, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import { useSettings, useUpdateSetting, useDeleteSetting } from '../_hooks/use-settings'
import { useCurrencies } from '@/app/_hooks/use-currencies'
import { toast } from 'sonner'

interface PredefinedSetting {
  key: string
  label: string
  description: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'url' | 'currency_select'
  defaultValue: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

// Predefined settings with descriptions
const PREDEFINED_SETTINGS: PredefinedSetting[] = [
  {
    key: 'website_url',
    label: 'Website URL',
    description: 'The main website URL for your application',
    type: 'url' as const,
    defaultValue: 'https://morpheus.com',
    required: true
  },
  {
    key: 'default_currency_id',
    label: 'Default Currency',
    description: 'The default currency for new users and pricing display',
    type: 'currency_select' as const,
    defaultValue: '',
    required: false
  }
]

export function SettingsManagement() {
  const { data: settings, isLoading, error } = useSettings()
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useCurrencies()
  const updateSetting = useUpdateSetting()
  const deleteSetting = useDeleteSetting()
  
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({})

  // Get current value for a setting
  const getCurrentValue = (key: string) => {
    const setting = settings?.find(s => s.key === key)
    return setting?.value || ''
  }

  // Get editing value or current value
  const getDisplayValue = (key: string) => {
    return editingSettings[key] !== undefined ? editingSettings[key] : getCurrentValue(key)
  }

  // Handle input change for predefined settings
  const handleSettingChange = (key: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Save a specific setting
  const handleSaveSetting = async (key: string) => {
    const value = editingSettings[key]
    if (value === undefined) return

    try {
      await updateSetting.mutateAsync({ key, value })
      setEditingSettings(prev => {
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
    setEditingSettings(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  // Delete setting (only for non-required settings)
  const handleDeleteSetting = async (key: string) => {
    const setting = PREDEFINED_SETTINGS.find(s => s.key === key)
    if (setting?.required) {
      toast.error('This setting is required and cannot be deleted')
      return
    }

    if (window.confirm(`Are you sure you want to delete the setting "${key}"?`)) {
      try {
        await deleteSetting.mutateAsync(key)
      } catch (error) {
        console.error('Failed to delete setting:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        Error loading settings: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-morpheus-gold-light" />
        <div>
          <h1 className="text-3xl font-bold text-white">App Settings</h1>
          <p className="text-gray-400">Manage application-wide settings and configuration</p>
        </div>
      </div>

      {/* Predefined Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Application Settings</CardTitle>
          <CardDescription>Configure core application settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {PREDEFINED_SETTINGS.map((setting) => {
            const currentValue = getDisplayValue(setting.key)
            const isEditing = editingSettings[setting.key] !== undefined
            const hasChanges = isEditing && editingSettings[setting.key] !== getCurrentValue(setting.key)

            return (
              <div key={setting.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium">{setting.label}</Label>
                    <p className="text-sm text-gray-400">{setting.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCurrentValue(setting.key) && (
                      <Badge variant="secondary" className="text-xs">
                        Set
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    {setting.type === 'textarea' ? (
                      <Textarea
                        value={currentValue}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.defaultValue}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                      />
                    ) : setting.type === 'select' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                      >
                        <option value="">Select...</option>
                        {setting.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : setting.type === 'currency_select' ? (
                      <select
                        value={currentValue}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                        disabled={isLoadingCurrencies}
                      >
                        <option value="">Select default currency...</option>
                        {currencies.map((currency) => (
                          <option key={currency.xdeviseid} value={currency.xdeviseid.toString()}>
                            {currency.xdeviseintitule} ({currency.xdevisecodealpha})
                            {currency.xispivot ? ' - Pivot Currency' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={setting.type}
                        value={currentValue}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        placeholder={setting.defaultValue}
                        className="bg-slate-700 border-slate-600 text-white"
                        required={setting.required}
                      />
                    )}
                  </div>

                  <div className="flex gap-1">
                    {hasChanges && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveSetting(setting.key)}
                          disabled={updateSetting.isPending}
                          className="bg-green-600 hover:bg-green-700"
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
                          onClick={() => handleCancelEdit(setting.key)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {getCurrentValue(setting.key) && !hasChanges && !setting.required && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSetting(setting.key)}
                        disabled={deleteSetting.isPending}
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


    </div>
  )
}