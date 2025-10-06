'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Mail } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

export default function NewsletterExportPage() {
  const { t } = useLanguage()
  const [includeUnsubscribed, setIncludeUnsubscribed] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (includeUnsubscribed) {
        params.set('includeUnsubscribed', 'true')
      }

      const response = await fetch(`/api/admin/newsletter/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to export newsletter data')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export newsletter data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('admin.newsletter.title') || 'Newsletter Management'}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('admin.newsletter.description') || 'Export newsletter subscriber data'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('admin.newsletter.export.title') || 'Export Subscribers'}
          </CardTitle>
          <CardDescription>
            {t('admin.newsletter.export.description') || 'Download a CSV file containing newsletter subscriber information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-unsubscribed"
              checked={includeUnsubscribed}
              onCheckedChange={(checked) => setIncludeUnsubscribed(checked as boolean)}
            />
            <label
              htmlFor="include-unsubscribed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('admin.newsletter.export.includeUnsubscribed') || 'Include unsubscribed users'}
            </label>
          </div>

          <p className="text-sm text-gray-600">
            {includeUnsubscribed
              ? (t('admin.newsletter.export.includeUnsubscribedHelp') || 'The CSV will include all users (subscribed and unsubscribed) with a "subscribed" column indicating their status.')
              : (t('admin.newsletter.export.subscribedOnlyHelp') || 'The CSV will only include currently subscribed users.')
            }
          </p>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting
              ? (t('admin.newsletter.export.exporting') || 'Exporting...')
              : (t('admin.newsletter.export.export') || 'Export CSV')
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}