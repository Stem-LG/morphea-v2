'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Tag, Save, X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
    Credenza,
    CredenzaTrigger,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaBody,
    CredenzaFooter,
} from '@/components/ui/credenza'
import { useUpdateCategory } from '@/hooks/useCategories'
import { SuperSelect } from '@/components/super-select'
import { Card, CardContent } from '@/components/ui/card'
import type { Database } from '@/lib/supabase'

type Category = Database['morpheus']['Tables']['xcategprod']['Row']

interface CategoryFormData {
    xcategprodintitule: string
    xcategprodcode: string
    xcategprodinfobulle: string
    xcategparentid: number | null
    imageFile?: File
}

interface CategoryData {
    xcategprodid: number
    xcategprodintitule: string
    xcategprodcode: string
    xcategprodinfobulle: string
    xcategparentid: number | null
}

interface UpdateCategoryDialogProps {
    children: React.ReactNode
    category: CategoryData
    categories: (Category & {
        parent?: Pick<
            Category,
            'xcategprodid' | 'xcategprodintitule' | 'xcategprodcode'
        > | null
        yprod: { count: number }[]
    })[]
}

export function UpdateCategoryDialog({
    children,
    category,
    categories,
}: UpdateCategoryDialogProps) {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState<CategoryFormData>({
        xcategprodintitule: '',
        xcategprodcode: '',
        xcategprodinfobulle: '',
        xcategparentid: null,
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)

    const updateCategoryMutation = useUpdateCategory()

    // Initialize form data when category changes or dialog opens
    useEffect(() => {
        if (category && isOpen) {
            setFormData({
                xcategprodintitule: category.xcategprodintitule || '',
                xcategprodcode: category.xcategprodcode || '',
                xcategprodinfobulle: category.xcategprodinfobulle || '',
                xcategparentid: category.xcategparentid || null,
            })
            // Set current image if category has media
            const categoryWithMedia = category as any
            if (categoryWithMedia.media?.ymediaurl) {
                setCurrentImageUrl(categoryWithMedia.media.ymediaurl)
            } else {
                setCurrentImageUrl(null)
            }
            setImagePreview(null)
        }
    }, [category, isOpen])

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setFormData((prev) => ({ ...prev, imageFile: file }))

            // Create preview URL
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, imageFile: undefined }))
        setImagePreview(null)
    }

    const resetForm = () => {
        if (category) {
            setFormData({
                xcategprodintitule: category.xcategprodintitule || '',
                xcategprodcode: category.xcategprodcode || '',
                xcategprodinfobulle: category.xcategprodinfobulle || '',
                xcategparentid: category.xcategparentid || null,
            })
            setImagePreview(null)
        }
    }

    const validateForm = () => {
        return (
            formData.xcategprodintitule.trim() !== '' &&
            formData.xcategprodcode.trim() !== '' &&
            formData.xcategprodinfobulle.trim() !== ''
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error(t('admin.categories.fillRequiredFields'))
            return
        }

        try {
            const { xcategparentid, imageFile, ...restFormData } = formData
            await updateCategoryMutation.mutateAsync({
                categoryId: category.xcategprodid,
                updates: {
                    ...restFormData,
                    xcategparentid: xcategparentid || null,
                },
                imageFile: imageFile,
            })
            setIsOpen(false)
            toast.success(t('admin.categories.categoryUpdatedSuccess'))
        } catch (error) {
            console.error('Failed to update category:', error)
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : t('admin.categories.failedToUpdateCategory')
            toast.error(errorMessage)
        }
    }

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm()
        }
        setIsOpen(open)
    }

    return (
        <Credenza open={isOpen} onOpenChange={handleDialogChange}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent className="max-w-2xl border-gray-200 bg-white">
                <CredenzaHeader>
                    <CredenzaTitle className="flex items-center gap-2 text-gray-900">
                        <Tag className="text-blue-600 h-5 w-5" />
                        {t('admin.categories.editCategory')}
                    </CredenzaTitle>
                </CredenzaHeader>

                <form onSubmit={handleSubmit}>
                    <CredenzaBody className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-gray-700">
                                    {t('admin.categories.categoryName')} *
                                </Label>
                                <Input
                                    value={formData.xcategprodintitule}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            xcategprodintitule: e.target.value,
                                        }))
                                    }
                                    className="border-gray-300 text-gray-900"
                                    placeholder={t(
                                        'admin.categories.categoryNamePlaceholder'
                                    )}
                                    required
                                    disabled={updateCategoryMutation.isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700">
                                    {t('admin.categories.categoryCode')} *
                                </Label>
                                <Input
                                    value={formData.xcategprodcode}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            xcategprodcode:
                                                e.target.value.toUpperCase(),
                                        }))
                                    }
                                    className="border-gray-300 text-gray-900"
                                    placeholder={t(
                                        'admin.categories.categoryCodePlaceholder'
                                    )}
                                    required
                                    disabled={updateCategoryMutation.isPending}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700">
                                {t('admin.categories.description')} *
                            </Label>
                            <Textarea
                                value={formData.xcategprodinfobulle}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        xcategprodinfobulle: e.target.value,
                                    }))
                                }
                                className="border-gray-300 text-gray-900"
                                placeholder={t(
                                    'admin.categories.descriptionPlaceholder'
                                )}
                                rows={3}
                                required
                                disabled={updateCategoryMutation.isPending}
                            />
                        </div>

                        {/* Category Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-gray-700">
                                {t('admin.categories.categoryImage')}
                            </Label>

                            {imagePreview || currentImageUrl ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <img
                                            src={
                                                imagePreview ||
                                                currentImageUrl ||
                                                ''
                                            }
                                            alt="Category preview"
                                            className="h-32 w-full rounded-lg border border-slate-600 object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2"
                                            disabled={
                                                updateCategoryMutation.isPending
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {!imagePreview && currentImageUrl && (
                                        <div className="text-center">
                                            <Label
                                                htmlFor="category-image-upload-update"
                                                className="text-morpheus-gold-light hover:text-morpheus-gold-dark cursor-pointer text-sm"
                                            >
                                                {t(
                                                    'admin.categories.changeImage'
                                                )}
                                            </Label>
                                            <Input
                                                id="category-image-upload-update"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                disabled={
                                                    updateCategoryMutation.isPending
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card className="border-dashed border-gray-300 bg-gray-50">
                                    <CardContent className="flex flex-col items-center justify-center py-6">
                                        <Upload className="mb-2 h-8 w-8 text-gray-600" />
                                        <div className="text-center">
                                            <Label
                                                htmlFor="category-image-upload-update"
                                                className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm"
                                            >
                                                {t(
                                                    'admin.categories.clickToUploadImage'
                                                )}
                                            </Label>
                                            <p className="mt-1 text-xs text-gray-500">
                                                PNG, JPG, JPEG up to 10MB
                                            </p>
                                        </div>
                                        <Input
                                            id="category-image-upload-update"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={
                                                updateCategoryMutation.isPending
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700">
                                {t('admin.categories.parentCategory')}
                            </Label>
                            <SuperSelect
                                value={
                                    formData.xcategparentid?.toString() || ''
                                }
                                onValueChange={(value) => {
                                    const selectedParentId =
                                        value !== ''
                                            ? parseInt(value as string)
                                            : null
                                    // Prevent circular references: a category cannot be its own parent
                                    if (
                                        selectedParentId === null ||
                                        selectedParentId !==
                                            category.xcategprodid
                                    ) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            xcategparentid: selectedParentId,
                                        }))
                                    }
                                }}
                                options={[
                                    {
                                        value: '',
                                        label: t('admin.categories.noParent'),
                                    },
                                    ...categories
                                        .filter(
                                            (cat) =>
                                                cat.xcategparentid === null &&
                                                cat.xcategprodid !==
                                                    category.xcategprodid
                                        ) // Only show top-level categories as parents and exclude the current category
                                        .map((cat) => ({
                                            value: cat.xcategprodid.toString(),
                                            label: cat.xcategprodintitule,
                                        })),
                                ]}
                                placeholder={t(
                                    'admin.categories.selectParentCategory'
                                )}
                                disabled={updateCategoryMutation.isPending}
                            />
                        </div>
                    </CredenzaBody>

                    <CredenzaFooter className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={updateCategoryMutation.isPending}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !validateForm() ||
                                updateCategoryMutation.isPending
                            }
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {updateCategoryMutation.isPending
                                ? t('admin.categories.updating')
                                : t('admin.categories.updateCategory')}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    )
}
