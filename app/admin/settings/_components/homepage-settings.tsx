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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Upload,
    Save,
    Loader2,
    X,
    Plus,
    GripVertical,
    ArrowUp,
    ArrowDown,
} from 'lucide-react'
import { useUpdateSetting } from '../_hooks/use-settings'
import { useHomeSettings } from '@/hooks/use-home-settings'
import { useCategories } from '@/hooks/useCategories'
import { useUploadFile } from '@/app/_hooks/use-upload-file'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function HomepageSettings() {
    const { t } = useLanguage()
    const { data: homeSettings, isLoading } = useHomeSettings()
    const { data: categories = [] } = useCategories()
    const updateSetting = useUpdateSetting()
    const uploadFile = useUploadFile()
    const queryClient = useQueryClient()

    const [editingSettings, setEditingSettings] = useState<
        Record<string, string>
    >({})
    const [uploadingFiles, setUploadingFiles] = useState<
        Record<string, boolean>
    >({})

    // Helper function to get current value
    const getCurrentValue = (key: string): string => {
        if (editingSettings[key] !== undefined) return editingSettings[key]

        // Map the structured data back to flat keys for editing
        switch (key) {
            case 'homepage_hero_video1_top_text_en':
                return homeSettings?.hero.video1.topText.en || ''
            case 'homepage_hero_video1_top_text_fr':
                return homeSettings?.hero.video1.topText.fr || ''
            case 'homepage_hero_video1_main_text_en':
                return homeSettings?.hero.video1.mainText.en || ''
            case 'homepage_hero_video1_main_text_fr':
                return homeSettings?.hero.video1.mainText.fr || ''
            case 'homepage_hero_video1_discover_link':
                return homeSettings?.hero.video1.discoverLink || ''
            case 'homepage_hero_video1_url':
                return homeSettings?.hero.video1.url || ''
            case 'homepage_hero_video2_top_text_en':
                return homeSettings?.hero.video2.topText.en || ''
            case 'homepage_hero_video2_top_text_fr':
                return homeSettings?.hero.video2.topText.fr || ''
            case 'homepage_hero_video2_main_text_en':
                return homeSettings?.hero.video2.mainText.en || ''
            case 'homepage_hero_video2_main_text_fr':
                return homeSettings?.hero.video2.mainText.fr || ''
            case 'homepage_hero_video2_discover_link':
                return homeSettings?.hero.video2.discoverLink || ''
            case 'homepage_hero_video2_url':
                return homeSettings?.hero.video2.url || ''
            case 'homepage_collections_title_en':
                return homeSettings?.collections.title.en || ''
            case 'homepage_collections_title_fr':
                return homeSettings?.collections.title.fr || ''
            case 'homepage_collections_subtitle_en':
                return homeSettings?.collections.subtitle.en || ''
            case 'homepage_collections_subtitle_fr':
                return homeSettings?.collections.subtitle.fr || ''
            case 'homepage_collections_image1_url':
                return homeSettings?.collections.image1Url || ''
            case 'homepage_collections_image2_url':
                return homeSettings?.collections.image2Url || ''
            case 'homepage_categories_title_en':
                return homeSettings?.categories.title.en || ''
            case 'homepage_categories_title_fr':
                return homeSettings?.categories.title.fr || ''
            case 'homepage_categories_category1_id':
                return homeSettings?.categories.category1.id?.toString() || ''
            case 'homepage_categories_category1_subtitle_en':
                return homeSettings?.categories.category1.subtitle.en || ''
            case 'homepage_categories_category1_subtitle_fr':
                return homeSettings?.categories.category1.subtitle.fr || ''
            case 'homepage_categories_category1_link':
                return homeSettings?.categories.category1.link || ''
            case 'homepage_categories_category1_image_url':
                return homeSettings?.categories.category1.imageUrl || ''
            case 'homepage_categories_category2_id':
                return homeSettings?.categories.category2.id?.toString() || ''
            case 'homepage_categories_category2_subtitle_en':
                return homeSettings?.categories.category2.subtitle.en || ''
            case 'homepage_categories_category2_subtitle_fr':
                return homeSettings?.categories.category2.subtitle.fr || ''
            case 'homepage_categories_category2_link':
                return homeSettings?.categories.category2.link || ''
            case 'homepage_categories_category2_image_url':
                return homeSettings?.categories.category2.imageUrl || ''
            case 'homepage_categories_category3_id':
                return homeSettings?.categories.category3.id?.toString() || ''
            case 'homepage_categories_category3_subtitle_en':
                return homeSettings?.categories.category3.subtitle.en || ''
            case 'homepage_categories_category3_subtitle_fr':
                return homeSettings?.categories.category3.subtitle.fr || ''
            case 'homepage_categories_category3_link':
                return homeSettings?.categories.category3.link || ''
            case 'homepage_categories_category3_image_url':
                return homeSettings?.categories.category3.imageUrl || ''
            case 'homepage_creators_title_en':
                return homeSettings?.creators.title.en || ''
            case 'homepage_creators_title_fr':
                return homeSettings?.creators.title.fr || ''
            case 'homepage_creators_subtitle_en':
                return homeSettings?.creators.subtitle.en || ''
            case 'homepage_creators_subtitle_fr':
                return homeSettings?.creators.subtitle.fr || ''
            case 'homepage_creators_images':
                return JSON.stringify(homeSettings?.creators.images || [])
            case 'footer_social_facebook_url':
                return homeSettings?.footer.social.facebook || ''
            case 'footer_social_instagram_url':
                return homeSettings?.footer.social.instagram || ''
            case 'footer_social_twitter_url':
                return homeSettings?.footer.social.twitter || ''
            case 'footer_social_linkedin_url':
                return homeSettings?.footer.social.linkedin || ''
            case 'footer_categories_ids':
                return JSON.stringify(homeSettings?.footer.categoryIds || [])
            case 'footer_link_origin':
                return homeSettings?.footer.links.origin || ''
            case 'footer_link_events':
                return homeSettings?.footer.links.events || ''
            case 'footer_link_my_account':
                return homeSettings?.footer.links.myAccount || ''
            case 'footer_link_orders_delivery':
                return homeSettings?.footer.links.ordersDelivery || ''
            case 'footer_link_cookies_privacy':
                return homeSettings?.footer.links.cookiesPrivacy || ''
            case 'footer_link_terms':
                return homeSettings?.footer.links.terms || ''
            default:
                return ''
        }
    }

    // Handle input change
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

            // Clear the editing state after successful save
            // The mutation's onSuccess will handle query invalidation
            setEditingSettings((prev) => {
                const newState = { ...prev }
                delete newState[key]
                return newState
            })
        } catch (error) {
            console.error('Failed to save setting:', error)
            // Don't clear editing state on error so user can retry
        }
    }

    // Handle file upload
    const handleFileUpload = async (
        key: string,
        file: File,
        type: 'image' | 'video'
    ) => {
        setUploadingFiles((prev) => ({ ...prev, [key]: true }))

        try {
            const url = await uploadFile.mutateAsync({ file, type })

            // Special handling for creators images array
            if (key === 'homepage_creators_images') {
                const currentImages = homeSettings?.creators.images || []
                const updatedImages = [...currentImages, url]
                await updateSetting.mutateAsync({
                    key,
                    value: JSON.stringify(updatedImages),
                })
            } else {
                await updateSetting.mutateAsync({ key, value: url })
            }

            // The updateSetting mutation will handle query invalidation
            toast.success(t('admin.settings.fileUploadedSuccessfully'))
        } catch (error) {
            console.error('Failed to upload file:', error)
            toast.error(t('admin.settings.failedToUploadFile'))
        } finally {
            setUploadingFiles((prev) => ({ ...prev, [key]: false }))
        }
    }

    // Handle file clearing
    const handleFileClear = async (key: string) => {
        try {
            await updateSetting.mutateAsync({ key, value: '' })
            toast.success('File cleared successfully')
        } catch (error) {
            console.error('Failed to clear file:', error)
            toast.error('Failed to clear file')
        }
    }

    // Reusable file display component with clear functionality
    const FileDisplay = ({ settingKey }: { settingKey: string }) => {
        const currentValue = getCurrentValue(settingKey)
        if (!currentValue) return null

        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-400">
                    {t('admin.settings.currentFile')}: {currentValue}
                </p>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleFileClear(settingKey)}
                    disabled={updateSetting.isPending}
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear File
                </Button>
            </div>
        )
    }

    // Helper function to get current footer category IDs (from editing state or saved settings)
    const getCurrentFooterCategoryIds = (): number[] => {
        const editingValue = editingSettings['footer_categories_ids']
        if (editingValue !== undefined) {
            try {
                return JSON.parse(editingValue)
            } catch {
                return []
            }
        }
        return homeSettings?.footer.categoryIds || []
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="text-morpheus-gold-light h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                    {t('admin.settings.homepageSettings')}
                </h2>
                <Badge variant="secondary">{t('admin.settings.dynamic')}</Badge>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
                    <TabsTrigger value="hero">
                        {t('admin.settings.hero')}
                    </TabsTrigger>
                    <TabsTrigger value="collections">
                        {t('admin.settings.collections')}
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                        {t('admin.settings.categories')}
                    </TabsTrigger>
                    <TabsTrigger value="creators">
                        {t('admin.settings.creators')}
                    </TabsTrigger>
                    <TabsTrigger value="footer">
                        {t('admin.settings.footer')}
                    </TabsTrigger>
                </TabsList>

                {/* Hero Section */}
                <TabsContent value="hero" className="space-y-6">
                    <Card className="border-slate-700 bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {t('admin.settings.heroSection')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.settings.heroSectionDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Video 1 */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">
                                    {t('admin.settings.video1')}
                                </h4>

                                {/* Video Upload */}
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.videoFile')}
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    handleFileUpload(
                                                        'homepage_hero_video1_url',
                                                        file,
                                                        'video'
                                                    )
                                                }
                                            }}
                                            className="border-slate-600 bg-slate-700 text-white"
                                            disabled={
                                                uploadingFiles[
                                                    'homepage_hero_video1_url'
                                                ]
                                            }
                                        />
                                        {uploadingFiles[
                                            'homepage_hero_video1_url'
                                        ] && (
                                            <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                    <FileDisplay settingKey="homepage_hero_video1_url" />
                                </div>

                                {/* Text Fields */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.topTextEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video1_top_text_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video1_top_text_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="MODE"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video1_top_text_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video1_top_text_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.topTextFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video1_top_text_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video1_top_text_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="MODE"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video1_top_text_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video1_top_text_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.mainTextEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video1_main_text_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video1_main_text_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="PRE-COLLECTION 2026/27"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video1_main_text_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video1_main_text_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.mainTextFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video1_main_text_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video1_main_text_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="PRÉ-COLLECTION 2026/27"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video1_main_text_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video1_main_text_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.discoverLink')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_hero_video1_discover_link'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_hero_video1_discover_link',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="#"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_hero_video1_discover_link'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_hero_video1_discover_link'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            {/* Video 2 */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">
                                    {t('admin.settings.video2')}
                                </h4>

                                {/* Video Upload */}
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.videoFile')}
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    handleFileUpload(
                                                        'homepage_hero_video2_url',
                                                        file,
                                                        'video'
                                                    )
                                                }
                                            }}
                                            className="border-slate-600 bg-slate-700 text-white"
                                            disabled={
                                                uploadingFiles[
                                                    'homepage_hero_video2_url'
                                                ]
                                            }
                                        />
                                        {uploadingFiles[
                                            'homepage_hero_video2_url'
                                        ] && (
                                            <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                    <FileDisplay settingKey="homepage_hero_video2_url" />
                                </div>

                                {/* Text Fields */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.topTextEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video2_top_text_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video2_top_text_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="PRE-COLLECTION"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video2_top_text_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video2_top_text_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.topTextFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video2_top_text_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video2_top_text_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="PRÉ-COLLECTION"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video2_top_text_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video2_top_text_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.mainTextEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video2_main_text_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video2_main_text_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="SUMMER COLLECTION 2026"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video2_main_text_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video2_main_text_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.mainTextFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_hero_video2_main_text_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_hero_video2_main_text_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="COLLECTION ÉTÉ 2026"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_hero_video2_main_text_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_hero_video2_main_text_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.discoverLink')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_hero_video2_discover_link'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_hero_video2_discover_link',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="#"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_hero_video2_discover_link'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_hero_video2_discover_link'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Collections Section */}
                <TabsContent value="collections" className="space-y-6">
                    <Card className="border-slate-700 bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {t('admin.settings.collectionsSection')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'admin.settings.collectionsSectionDescription'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title and Subtitle */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleEn')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_collections_title_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_collections_title_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Discover Our Shows"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_collections_title_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_collections_title_en'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleFr')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_collections_title_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_collections_title_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Découvrez Nos Défilé"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_collections_title_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_collections_title_fr'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.subtitleEn')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_collections_subtitle_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_collections_subtitle_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Dive into the exclusive universe..."
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_collections_subtitle_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_collections_subtitle_en'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.subtitleFr')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_collections_subtitle_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_collections_subtitle_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Plongez dans l'univers exclusif..."
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_collections_subtitle_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_collections_subtitle_fr'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            {/* Image Uploads */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Collection Image 1
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    handleFileUpload(
                                                        'homepage_collections_image1_url',
                                                        file,
                                                        'image'
                                                    )
                                                }
                                            }}
                                            className="border-slate-600 bg-slate-700 text-white"
                                            disabled={
                                                uploadingFiles[
                                                    'homepage_collections_image1_url'
                                                ]
                                            }
                                        />
                                        {uploadingFiles[
                                            'homepage_collections_image1_url'
                                        ] && (
                                            <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                    <FileDisplay settingKey="homepage_collections_image1_url" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Collection Image 2
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    handleFileUpload(
                                                        'homepage_collections_image2_url',
                                                        file,
                                                        'image'
                                                    )
                                                }
                                            }}
                                            className="border-slate-600 bg-slate-700 text-white"
                                            disabled={
                                                uploadingFiles[
                                                    'homepage_collections_image2_url'
                                                ]
                                            }
                                        />
                                        {uploadingFiles[
                                            'homepage_collections_image2_url'
                                        ] && (
                                            <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                    <FileDisplay settingKey="homepage_collections_image2_url" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Other tabs will be implemented in the next part */}
                <TabsContent value="categories">
                    <Card className="border-slate-700 bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {t('admin.settings.categoriesSection')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'admin.settings.categoriesSectionDescription'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Section Title */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleEn')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_categories_title_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_categories_title_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Our Categories"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_categories_title_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_categories_title_en'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleFr')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_categories_title_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_categories_title_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Nos Catégories"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_categories_title_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_categories_title_fr'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            {/* Category 1 */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Category 1
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Category Selection
                                    </Label>
                                    <Select
                                        value={getCurrentValue(
                                            'homepage_categories_category1_id'
                                        )}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                'homepage_categories_category1_id',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                                            <SelectValue placeholder="Select a category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.xcategprodid}
                                                    value={category.xcategprodid.toString()}
                                                >
                                                    {
                                                        category.xcategprodintitule
                                                    }
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_categories_category1_id'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_categories_category1_id'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category1_subtitle_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category1_subtitle_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Custom subtitle..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category1_subtitle_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category1_subtitle_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category1_subtitle_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category1_subtitle_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Sous-titre personnalisé..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category1_subtitle_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category1_subtitle_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Custom Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category1_link'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category1_link',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="#"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category1_link'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category1_link'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Category Image
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0]
                                                    if (file) {
                                                        handleFileUpload(
                                                            'homepage_categories_category1_image_url',
                                                            file,
                                                            'image'
                                                        )
                                                    }
                                                }}
                                                className="border-slate-600 bg-slate-700 text-white"
                                                disabled={
                                                    uploadingFiles[
                                                        'homepage_categories_category1_image_url'
                                                    ]
                                                }
                                            />
                                            {uploadingFiles[
                                                'homepage_categories_category1_image_url'
                                            ] && (
                                                <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                        <FileDisplay settingKey="homepage_categories_category1_image_url" />
                                    </div>
                                </div>
                            </div>

                            {/* Category 2 */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Category 2
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Category Selection
                                    </Label>
                                    <Select
                                        value={getCurrentValue(
                                            'homepage_categories_category2_id'
                                        )}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                'homepage_categories_category2_id',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                                            <SelectValue placeholder="Select a category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.xcategprodid}
                                                    value={category.xcategprodid.toString()}
                                                >
                                                    {
                                                        category.xcategprodintitule
                                                    }
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_categories_category2_id'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_categories_category2_id'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category2_subtitle_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category2_subtitle_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Custom subtitle..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category2_subtitle_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category2_subtitle_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category2_subtitle_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category2_subtitle_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Sous-titre personnalisé..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category2_subtitle_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category2_subtitle_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Custom Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category2_link'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category2_link',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="#"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category2_link'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category2_link'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Category Image
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0]
                                                    if (file) {
                                                        handleFileUpload(
                                                            'homepage_categories_category2_image_url',
                                                            file,
                                                            'image'
                                                        )
                                                    }
                                                }}
                                                className="border-slate-600 bg-slate-700 text-white"
                                                disabled={
                                                    uploadingFiles[
                                                        'homepage_categories_category2_image_url'
                                                    ]
                                                }
                                            />
                                            {uploadingFiles[
                                                'homepage_categories_category2_image_url'
                                            ] && (
                                                <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                        <FileDisplay settingKey="homepage_categories_category2_image_url" />
                                    </div>
                                </div>
                            </div>

                            {/* Category 3 */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Category 3
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Category Selection
                                    </Label>
                                    <Select
                                        value={getCurrentValue(
                                            'homepage_categories_category3_id'
                                        )}
                                        onValueChange={(value) =>
                                            handleSettingChange(
                                                'homepage_categories_category3_id',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                                            <SelectValue placeholder="Select a category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.xcategprodid}
                                                    value={category.xcategprodid.toString()}
                                                >
                                                    {
                                                        category.xcategprodintitule
                                                    }
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_categories_category3_id'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_categories_category3_id'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleEn')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category3_subtitle_en'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category3_subtitle_en',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Custom subtitle..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category3_subtitle_en'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category3_subtitle_en'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            {t('admin.settings.subtitleFr')}
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category3_subtitle_fr'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category3_subtitle_fr',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="Sous-titre personnalisé..."
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category3_subtitle_fr'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category3_subtitle_fr'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Custom Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'homepage_categories_category3_link'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'homepage_categories_category3_link',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="#"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'homepage_categories_category3_link'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'homepage_categories_category3_link'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Category Image
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0]
                                                    if (file) {
                                                        handleFileUpload(
                                                            'homepage_categories_category3_image_url',
                                                            file,
                                                            'image'
                                                        )
                                                    }
                                                }}
                                                className="border-slate-600 bg-slate-700 text-white"
                                                disabled={
                                                    uploadingFiles[
                                                        'homepage_categories_category3_image_url'
                                                    ]
                                                }
                                            />
                                            {uploadingFiles[
                                                'homepage_categories_category3_image_url'
                                            ] && (
                                                <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                            )}
                                        </div>
                                        <FileDisplay settingKey="homepage_categories_category3_image_url" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="creators">
                    <Card className="border-slate-700 bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {t('admin.settings.creatorsSection')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.settings.creatorsSectionDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Section Title and Subtitle */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleEn')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_creators_title_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_creators_title_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Our Creators"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_creators_title_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_creators_title_en'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.titleFr')}
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_creators_title_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_creators_title_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Nos Créateurs"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_creators_title_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_creators_title_fr'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.subtitleEn')}
                                    </Label>
                                    <Textarea
                                        value={getCurrentValue(
                                            'homepage_creators_subtitle_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_creators_subtitle_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Discover our exceptional boutique spaces..."
                                        rows={3}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_creators_subtitle_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_creators_subtitle_en'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        {t('admin.settings.subtitleFr')}
                                    </Label>
                                    <Textarea
                                        value={getCurrentValue(
                                            'homepage_creators_subtitle_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_creators_subtitle_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-slate-600 bg-slate-700 text-white"
                                        placeholder="Découvrez nos espaces d'exception boutique..."
                                        rows={3}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_creators_subtitle_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_creators_subtitle_fr'
                                            ] === undefined
                                        }
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                    >
                                        {updateSetting.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        {t('admin.settings.save')}
                                    </Button>
                                </div>
                            </div>

                            {/* Carousel Images Management */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Carousel Images
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Upload multiple images for the 3D photo
                                    carousel. Images will be displayed in the
                                    order they are uploaded.
                                </p>

                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Add New Image
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    handleFileUpload(
                                                        'homepage_creators_images',
                                                        file,
                                                        'image'
                                                    )
                                                }
                                            }}
                                            className="border-slate-600 bg-slate-700 text-white"
                                            disabled={
                                                uploadingFiles[
                                                    'homepage_creators_images'
                                                ]
                                            }
                                        />
                                        {uploadingFiles[
                                            'homepage_creators_images'
                                        ] && (
                                            <Loader2 className="text-morpheus-gold-light h-4 w-4 animate-spin" />
                                        )}
                                    </div>
                                </div>

                                {/* Current Images Display */}
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Current Images
                                    </Label>
                                    <div className="text-sm text-gray-400">
                                        {homeSettings?.creators.images &&
                                        homeSettings.creators.images.length >
                                            0 ? (
                                            <div className="space-y-2">
                                                {homeSettings.creators.images.map(
                                                    (imageUrl, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded bg-slate-700 p-2"
                                                        >
                                                            <span className="truncate">
                                                                {imageUrl}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    const updatedImages =
                                                                        homeSettings.creators.images.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                index
                                                                        )
                                                                    handleSettingChange(
                                                                        'homepage_creators_images',
                                                                        JSON.stringify(
                                                                            updatedImages
                                                                        )
                                                                    )
                                                                    handleSaveSetting(
                                                                        'homepage_creators_images'
                                                                    )
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p>
                                                No images uploaded yet. Upload
                                                images to populate the carousel.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="footer">
                    <Card className="border-slate-700 bg-slate-800/50">
                        <CardHeader>
                            <CardTitle className="text-white">
                                {t('admin.settings.footerSection')}
                            </CardTitle>
                            <CardDescription>
                                {t('admin.settings.footerSectionDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Social Media Links */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">
                                    Social Media Links
                                </h4>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Facebook URL
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_social_facebook_url'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_social_facebook_url',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_social_facebook_url'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_social_facebook_url'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Instagram URL
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_social_instagram_url'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_social_instagram_url',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://instagram.com/yourpage"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_social_instagram_url'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_social_instagram_url'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Twitter URL
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_social_twitter_url'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_social_twitter_url',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://twitter.com/yourpage"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_social_twitter_url'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_social_twitter_url'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            LinkedIn URL
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_social_linkedin_url'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_social_linkedin_url',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://linkedin.com/company/yourpage"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_social_linkedin_url'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_social_linkedin_url'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Categories */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Footer Categories
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Select which categories to display in the
                                    footer categories column.
                                </p>

                                <div className="space-y-4">
                                    {/* Selected Categories with Ordering */}
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Selected Categories (Drag to
                                            reorder)
                                        </Label>
                                        <div className="space-y-2">
                                            {getCurrentFooterCategoryIds().map(
                                                (categoryId) => {
                                                    const category =
                                                        categories.find(
                                                            (cat) =>
                                                                cat.xcategprodid ===
                                                                categoryId
                                                        )
                                                    if (!category) return null

                                                    const currentIds =
                                                        getCurrentFooterCategoryIds()
                                                    const currentIndex =
                                                        currentIds.indexOf(
                                                            categoryId
                                                        )

                                                    return (
                                                        <div
                                                            key={categoryId}
                                                            className="flex items-center justify-between rounded border border-slate-600 bg-slate-700 p-3"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                                                <span className="text-white">
                                                                    {
                                                                        category.xcategprodintitule
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        if (
                                                                            currentIndex >
                                                                            0
                                                                        ) {
                                                                            const newIds =
                                                                                [
                                                                                    ...currentIds,
                                                                                ]
                                                                            newIds[
                                                                                currentIndex
                                                                            ] =
                                                                                newIds[
                                                                                    currentIndex -
                                                                                        1
                                                                                ]
                                                                            newIds[
                                                                                currentIndex -
                                                                                    1
                                                                            ] =
                                                                                categoryId
                                                                            handleSettingChange(
                                                                                'footer_categories_ids',
                                                                                JSON.stringify(
                                                                                    newIds
                                                                                )
                                                                            )
                                                                        }
                                                                    }}
                                                                    disabled={
                                                                        currentIndex ===
                                                                        0
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <ArrowUp className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        if (
                                                                            currentIndex <
                                                                            currentIds.length -
                                                                                1
                                                                        ) {
                                                                            const newIds =
                                                                                [
                                                                                    ...currentIds,
                                                                                ]
                                                                            newIds[
                                                                                currentIndex
                                                                            ] =
                                                                                newIds[
                                                                                    currentIndex +
                                                                                        1
                                                                                ]
                                                                            newIds[
                                                                                currentIndex +
                                                                                    1
                                                                            ] =
                                                                                categoryId
                                                                            handleSettingChange(
                                                                                'footer_categories_ids',
                                                                                JSON.stringify(
                                                                                    newIds
                                                                                )
                                                                            )
                                                                        }
                                                                    }}
                                                                    disabled={
                                                                        currentIndex ===
                                                                        currentIds.length -
                                                                            1
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <ArrowDown className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        const updatedIds =
                                                                            currentIds.filter(
                                                                                (
                                                                                    id
                                                                                ) =>
                                                                                    id !==
                                                                                    categoryId
                                                                            )
                                                                        handleSettingChange(
                                                                            'footer_categories_ids',
                                                                            JSON.stringify(
                                                                                updatedIds
                                                                            )
                                                                        )
                                                                    }}
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* Available Categories to Add */}
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Add Categories
                                        </Label>
                                        <div className="space-y-2">
                                            {categories
                                                .filter(
                                                    (category) =>
                                                        !getCurrentFooterCategoryIds().includes(
                                                            category.xcategprodid
                                                        )
                                                )
                                                .map((category) => (
                                                    <div
                                                        key={
                                                            category.xcategprodid
                                                        }
                                                        className="flex items-center justify-between rounded border border-slate-600 bg-slate-800 p-3"
                                                    >
                                                        <span className="text-white">
                                                            {
                                                                category.xcategprodintitule
                                                            }
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const currentIds =
                                                                    getCurrentFooterCategoryIds()
                                                                const updatedIds =
                                                                    [
                                                                        ...currentIds,
                                                                        category.xcategprodid,
                                                                    ]
                                                                handleSettingChange(
                                                                    'footer_categories_ids',
                                                                    JSON.stringify(
                                                                        updatedIds
                                                                    )
                                                                )
                                                            }}
                                                            className="h-8"
                                                        >
                                                            <Plus className="mr-1 h-4 w-4" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        handleSaveSetting(
                                            'footer_categories_ids'
                                        )
                                    }
                                    disabled={
                                        updateSetting.isPending ||
                                        editingSettings[
                                            'footer_categories_ids'
                                        ] === undefined
                                    }
                                    className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                >
                                    {updateSetting.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {t('admin.settings.save')}
                                </Button>
                            </div>

                            {/* Footer Links */}
                            <div className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-lg font-semibold text-white">
                                    Footer Links
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Configure the links in the footer About and
                                    Customer Service sections.
                                </p>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Origin Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_origin'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_origin',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/origin"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_origin'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_origin'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Events Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_events'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_events',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/events"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_events'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_events'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            My Account Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_my_account'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_my_account',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/account"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_my_account'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_my_account'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Orders & Delivery Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_orders_delivery'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_orders_delivery',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/orders"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_orders_delivery'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_orders_delivery'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Cookies & Privacy Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_cookies_privacy'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_cookies_privacy',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/privacy"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_cookies_privacy'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_cookies_privacy'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white">
                                            Terms Link
                                        </Label>
                                        <Input
                                            value={getCurrentValue(
                                                'footer_link_terms'
                                            )}
                                            onChange={(e) =>
                                                handleSettingChange(
                                                    'footer_link_terms',
                                                    e.target.value
                                                )
                                            }
                                            className="border-slate-600 bg-slate-700 text-white"
                                            placeholder="https://example.com/terms"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleSaveSetting(
                                                    'footer_link_terms'
                                                )
                                            }
                                            disabled={
                                                updateSetting.isPending ||
                                                editingSettings[
                                                    'footer_link_terms'
                                                ] === undefined
                                            }
                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light"
                                        >
                                            {updateSetting.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {t('admin.settings.save')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
