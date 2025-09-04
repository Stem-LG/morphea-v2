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
    const [editingCreator, setEditingCreator] = useState<{
        index: number
        link: string
    } | null>(null)

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
            case 'homepage_creators_data':
                return JSON.stringify(homeSettings?.creators.creators || [])
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
            case 'homepage_video_animation_title_en':
                return homeSettings?.videoAnimation.title.en || ''
            case 'homepage_video_animation_title_fr':
                return homeSettings?.videoAnimation.title.fr || ''
            case 'homepage_video_animation_description_en':
                return homeSettings?.videoAnimation.description.en || ''
            case 'homepage_video_animation_description_fr':
                return homeSettings?.videoAnimation.description.fr || ''
            case 'homepage_video_animation_button_text_en':
                return homeSettings?.videoAnimation.buttonText.en || ''
            case 'homepage_video_animation_button_text_fr':
                return homeSettings?.videoAnimation.buttonText.fr || ''
            case 'homepage_video_animation_button_link':
                return homeSettings?.videoAnimation.buttonLink || ''
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
                <p className="text-sm text-gray-600">
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
                <Loader2 className="text-blue-600 h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">
                    {t('admin.settings.homepageSettings')}
                </h2>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">{t('admin.settings.dynamic')}</Badge>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-gray-100">
                    <TabsTrigger value="hero">
                        {t('admin.settings.hero')}
                    </TabsTrigger>
                    <TabsTrigger value="video-animation">
                        Video Animation
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
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                {t('admin.settings.heroSection')}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
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
                                    <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                    <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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

                {/* Video Animation Section */}
                <TabsContent value="video-animation" className="space-y-6">
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                Video Animation Section
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Configure the text content for the video
                                animation section that appears after the hero
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Title (English)
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_video_animation_title_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_title_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="The Origin of Morphea"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_title_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_title_en'
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
                                        Title (French)
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_video_animation_title_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_title_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="À L'origine de Morphea"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_title_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_title_fr'
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

                            {/* Description */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Description (English)
                                    </Label>
                                    <Textarea
                                        value={getCurrentValue(
                                            'homepage_video_animation_description_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_description_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="At the origin of Morphea, this space dedicated to luxury fashion..."
                                        rows={4}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_description_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_description_en'
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
                                        Description (French)
                                    </Label>
                                    <Textarea
                                        value={getCurrentValue(
                                            'homepage_video_animation_description_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_description_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="A l'origine de Morphea, cet espace dédié à la mode de luxe..."
                                        rows={4}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_description_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_description_fr'
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

                            {/* Button Text */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-white">
                                        Button Text (English)
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_video_animation_button_text_en'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_button_text_en',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="Learn more"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_button_text_en'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_button_text_en'
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
                                        Button Text (French)
                                    </Label>
                                    <Input
                                        value={getCurrentValue(
                                            'homepage_video_animation_button_text_fr'
                                        )}
                                        onChange={(e) =>
                                            handleSettingChange(
                                                'homepage_video_animation_button_text_fr',
                                                e.target.value
                                            )
                                        }
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="En savoir plus"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleSaveSetting(
                                                'homepage_video_animation_button_text_fr'
                                            )
                                        }
                                        disabled={
                                            updateSetting.isPending ||
                                            editingSettings[
                                                'homepage_video_animation_button_text_fr'
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

                            {/* Button Link */}
                            <div className="space-y-2">
                                <Label className="text-white">
                                    Button Link
                                </Label>
                                <Input
                                    value={getCurrentValue(
                                        'homepage_video_animation_button_link'
                                    )}
                                    onChange={(e) =>
                                        handleSettingChange(
                                            'homepage_video_animation_button_link',
                                            e.target.value
                                        )
                                    }
                                    className="border-gray-300 bg-white text-gray-900"
                                    placeholder="https://morpheus-sa.com/"
                                />
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        handleSaveSetting(
                                            'homepage_video_animation_button_link'
                                        )
                                    }
                                    disabled={
                                        updateSetting.isPending ||
                                        editingSettings[
                                            'homepage_video_animation_button_link'
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Collections Section */}
                <TabsContent value="collections" className="space-y-6">
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                {t('admin.settings.collectionsSection')}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                {t(
                                    'admin.settings.collectionsSectionDescription'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title and Subtitle */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-gray-900">
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                    <Label className="text-gray-900">
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
                                        className="border-gray-300 bg-white text-gray-900"
                                        placeholder="Découvrez nos défilés"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                {t('admin.settings.categoriesSection')}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                {t(
                                    'admin.settings.categoriesSectionDescription'
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Section Title */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-gray-900">
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                    <Label className="text-gray-900">
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Category 1
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-gray-900">
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
                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900">
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                                className="border-gray-300 bg-white text-gray-900"
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
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
                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900">
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                                className="border-gray-300 bg-white text-gray-900"
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
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
                                        <SelectTrigger className="border-gray-300 bg-white text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                                className="border-gray-300 bg-white text-gray-900"
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
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                {t('admin.settings.creatorsSection')}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                                        className="border-gray-300 bg-white text-gray-900"
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Carousel Images (Legacy)
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Upload multiple images for the 3D photo
                                    carousel. Images will be displayed in the
                                    order they are uploaded. (This is kept for backward compatibility)
                                </p>

                                <div className="space-y-2">
                                    <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                    <Label className="text-gray-900">
                                        Current Images
                                    </Label>
                                    <div className="text-sm text-gray-600">
                                        {homeSettings?.creators.images &&
                                        homeSettings.creators.images.length >
                                            0 ? (
                                            <div className="space-y-2">
                                                {homeSettings.creators.images.map(
                                                    (imageUrl, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                                        >
                                                            <span className="truncate text-gray-700 text-sm">
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
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                                                <p className="text-gray-500">
                                                    No images uploaded yet. Upload
                                                    images to populate the carousel.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* New Creators Management */}
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Creators with Links
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Manage creators with images and links. When users click on a creator image, they will be redirected to the specified link.
                                </p>

                                {/* Add New Creator */}
                                <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                        <h5 className="text-lg font-semibold text-gray-900">
                                            Add New Creator
                                        </h5>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Upload an image and provide a link for a new creator.
                                    </p>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 font-medium">
                                                Creator Image
                                            </Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                id="new-creator-image"
                                                className="border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 font-medium">
                                                Creator Link
                                            </Label>
                                            <Input
                                                type="url"
                                                id="new-creator-link"
                                                placeholder="https://example.com/creator-profile"
                                                className="border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            const fileInput = document.getElementById('new-creator-image') as HTMLInputElement
                                            const linkInput = document.getElementById('new-creator-link') as HTMLInputElement
                                            
                                            const file = fileInput?.files?.[0]
                                            const link = linkInput?.value
                                            
                                            if (!file || !link) {
                                                toast.error('Please provide both an image and a link')
                                                return
                                            }
                                            
                                            try {
                                                // Upload the image
                                                const imageUrl = await uploadFile.mutateAsync({ file, type: 'image' })
                                                
                                                // Add to existing creators array
                                                const currentCreators = homeSettings?.creators.creators || []
                                                const updatedCreators = [...currentCreators, { image: imageUrl, link }]
                                                
                                                // Save to settings
                                                await updateSetting.mutateAsync({
                                                    key: 'homepage_creators_data',
                                                    value: JSON.stringify(updatedCreators)
                                                })
                                                
                                                // Clear inputs
                                                fileInput.value = ''
                                                linkInput.value = ''
                                                
                                                toast.success('Creator added successfully')
                                            } catch (error) {
                                                console.error('Failed to add creator:', error)
                                                toast.error('Failed to add creator')
                                            }
                                        }}
                                        disabled={updateSetting.isPending || uploadFile.isPending}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    >
                                        {updateSetting.isPending || uploadFile.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        Add Creator
                                    </Button>
                                </div>

                                {/* Current Creators Display */}
                                <div className="space-y-2">
                                    <Label className="text-gray-900">
                                        Current Creators
                                    </Label>
                                    <div className="text-sm text-gray-600">
                                        {homeSettings?.creators.creators &&
                                        homeSettings.creators.creators.length > 0 ? (
                                            <div className="space-y-3">
                                                {homeSettings.creators.creators.map(
                                                    (creator, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <img
                                                                    src={creator.image}
                                                                    alt={`Creator ${index + 1}`}
                                                                    className="h-16 w-16 rounded-lg border border-gray-200 object-cover shadow-sm"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-gray-900 font-semibold text-sm">
                                                                        Creator {index + 1}
                                                                    </p>
                                                                    {editingCreator?.index === index ? (
                                                                        <div className="mt-2 flex gap-2">
                                                                            <Input
                                                                                value={editingCreator.link}
                                                                                onChange={(e) =>
                                                                                    setEditingCreator({
                                                                                        ...editingCreator,
                                                                                        link: e.target.value
                                                                                    })
                                                                                }
                                                                                className="text-xs h-8 border-gray-300 bg-white text-gray-900"
                                                                                placeholder="https://example.com/creator-profile"
                                                                            />
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={async () => {
                                                                                    if (editingCreator.link !== creator.link) {
                                                                                        const updatedCreators = homeSettings.creators.creators.map((c, i) =>
                                                                                            i === index ? { ...c, link: editingCreator.link } : c
                                                                                        )
                                                                                        handleSettingChange(
                                                                                            'homepage_creators_data',
                                                                                            JSON.stringify(updatedCreators)
                                                                                        )
                                                                                        await handleSaveSetting('homepage_creators_data')
                                                                                    }
                                                                                    setEditingCreator(null)
                                                                                }}
                                                                                className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                                                                                disabled={updateSetting.isPending}
                                                                            >
                                                                                {updateSetting.isPending ? (
                                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    <Save className="h-3 w-3" />
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => setEditingCreator(null)}
                                                                                className="h-8 px-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-gray-500 text-xs mt-1 truncate max-w-64">
                                                                            {creator.link}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {editingCreator?.index !== index && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            setEditingCreator({
                                                                                index,
                                                                                link: creator.link
                                                                            })
                                                                        }}
                                                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            const updatedCreators =
                                                                                homeSettings.creators.creators.filter(
                                                                                    (_, i) => i !== index
                                                                                )
                                                                            handleSettingChange(
                                                                                'homepage_creators_data',
                                                                                JSON.stringify(updatedCreators)
                                                                            )
                                                                            handleSaveSetting('homepage_creators_data')
                                                                        }}
                                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                                <p className="text-gray-500">
                                                    No creators added yet. Add creators with images and links above.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="footer">
                    <Card className="border-gray-200 bg-white shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                {t('admin.settings.footerSection')}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                {t('admin.settings.footerSectionDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Social Media Links */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Social Media Links
                                </h4>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Footer Categories
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Select which categories to display in the
                                    footer categories column.
                                </p>

                                <div className="space-y-4">
                                    {/* Selected Categories with Ordering */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-900">
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
                                        <Label className="text-gray-900">
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
                            <div className="space-y-4 border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    Footer Links
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Configure the links in the footer About and
                                    Customer Service sections.
                                </p>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
                                        <Label className="text-gray-900">
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
                                            className="border-gray-300 bg-white text-gray-900"
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
