'use client'

import { useState } from 'react'
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
import { useCreateCategory } from '@/hooks/useCategories'
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

interface CreateCategoryDialogProps {
    children: React.ReactNode
    categories: (Category & {
        parent?: Pick<
            Category,
            'xcategprodid' | 'xcategprodintitule' | 'xcategprodcode'
        > | null
        yprod: { count: number }[]
    })[]
    defaultParentId?: number | null
}

export function CreateCategoryDialog({
    children,
    categories,
    defaultParentId = null,
}: CreateCategoryDialogProps) {
    const { t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState<CategoryFormData>({
        xcategprodintitule: '',
        xcategprodcode: '',
        xcategprodinfobulle: '',
        xcategparentid: defaultParentId,
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const createCategoryMutation = useCreateCategory()

    const resetForm = () => {
        setFormData({
            xcategprodintitule: '',
            xcategprodcode: '',
            xcategprodinfobulle: '',
            xcategparentid: defaultParentId,
        })
        setImagePreview(null)
    }

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
            const { xcategparentid, ...restFormData } = formData
            await createCategoryMutation.mutateAsync({
                ...restFormData,
                xcategparentid: xcategparentid || null,
            })
            resetForm()
            setIsOpen(false)
            toast.success(t('admin.categories.categoryCreatedSuccess'))
        } catch (error) {
            console.error('Failed to create category:', error)
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : t('admin.categories.failedToCreateCategory')
            toast.error(errorMessage)
        }
    }

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm()
        } else {
            // Reset form when opening dialog to ensure defaultParentId is set
            setFormData({
                xcategprodintitule: '',
                xcategprodcode: '',
                xcategprodinfobulle: '',
                xcategparentid: defaultParentId,
            })
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
                        {t('admin.categories.addNewCategory')}
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
                                    disabled={createCategoryMutation.isPending}
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
                                    disabled={createCategoryMutation.isPending}
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
                                disabled={createCategoryMutation.isPending}
                            />
                        </div>

                        {/* Category Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-gray-700">
                                {t('admin.categories.categoryImage')}
                            </Label>

                            {imagePreview ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
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
                                                createCategoryMutation.isPending
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Card className="border-dashed border-gray-300 bg-gray-50">
                                    <CardContent className="flex flex-col items-center justify-center py-6">
                                        <Upload className="mb-2 h-8 w-8 text-gray-600" />
                                        <div className="text-center">
                                            <Label
                                                htmlFor="category-image-upload"
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
                                            id="category-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={
                                                createCategoryMutation.isPending
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
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        xcategparentid:
                                            value !== ''
                                                ? parseInt(value as string)
                                                : null,
                                    }))
                                }
                                options={[
                                    {
                                        value: '',
                                        label: t('admin.categories.noParent'),
                                    },
                                    ...categories
                                        .filter(
                                            (cat) => cat.xcategparentid === null
                                        ) // Only show top-level categories as parents
                                        .map((cat) => ({
                                            value: cat.xcategprodid.toString(),
                                            label: cat.xcategprodintitule,
                                        })),
                                ]}
                                placeholder={t(
                                    'admin.categories.selectParentCategory'
                                )}
                                disabled={createCategoryMutation.isPending}
                            />
                        </div>
                    </CredenzaBody>

                    <CredenzaFooter className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={createCategoryMutation.isPending}
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !validateForm() ||
                                createCategoryMutation.isPending
                            }
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {createCategoryMutation.isPending
                                ? t('admin.categories.creating')
                                : t('admin.categories.createCategory')}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    )
}
