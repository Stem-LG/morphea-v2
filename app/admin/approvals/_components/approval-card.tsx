'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    Package,
    AlertTriangle,
    Image as ImageIcon,
    Play,
    Box,
    FileSearch,
} from 'lucide-react'
import { Model3DViewer } from './three-d-viewer'

interface ApprovalCardProps {
    product: any
    onAudit: () => void
    categories?: any[]
}

export function ApprovalCard({
    product,
    onAudit,
    categories = [],
}: ApprovalCardProps) {
    const { t } = useLanguage()
    // Get category name
    const category = categories.find(
        (cat) => cat.xcategprodid === product.xcategprodidfk
    )

    // Get enhanced status info with variant details
    const getStatusInfo = () => {
        const variants = product.yvarprod || []
        const pendingVariants = variants.filter(
            (v: any) => v.yvarprodstatut === 'not_approved'
        ).length
        const approvedVariants = variants.filter(
            (v: any) => v.yvarprodstatut === 'approved'
        ).length
        const revisionVariants = variants.filter(
            (v: any) => v.yvarprodstatut === 'rejected'
        ).length
        const rejectedVariants = variants.filter(
            (v: any) => v.yvarprodstatut === 'rejected'
        ).length

        if (product.yprodstatut === 'not_approved') {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant="secondary"
                            className="border-yellow-200 bg-yellow-100 text-yellow-800"
                        >
                            <Clock className="mr-1 h-3 w-3" />
                            {t('admin.approvals.productPending')}
                        </Badge>
                        {variants.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="border-gray-200 bg-gray-100 text-xs text-gray-700"
                            >
                                {variants.length}{' '}
                                {t('admin.approvals.variants')}
                            </Badge>
                        )}
                    </div>
                ),
                color: 'border-yellow-200',
            }
        } else if (product.yprodstatut === 'rejected') {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant="secondary"
                            className="border-orange-200 bg-orange-100 text-orange-800"
                        >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {t('admin.approvals.needsRevision')}
                        </Badge>
                        {variants.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="border-gray-200 bg-gray-100 text-xs text-gray-700"
                            >
                                {variants.length}{' '}
                                {t('admin.approvals.variants')}
                            </Badge>
                        )}
                    </div>
                ),
                color: 'border-orange-200',
            }
        } else if (pendingVariants > 0 || revisionVariants > 0) {
            return {
                badge: (
                    <div className="flex flex-col items-end gap-1">
                        <Badge
                            variant="secondary"
                            className="border-blue-200 bg-blue-100 text-blue-800"
                        >
                            <Package className="mr-1 h-3 w-3" />
                            {t('admin.approvals.variantIssues')}
                        </Badge>
                        <div className="flex flex-wrap justify-end gap-1">
                            {pendingVariants > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-yellow-200 bg-yellow-100 text-xs text-yellow-800"
                                >
                                    {pendingVariants}{' '}
                                    {t('admin.approvals.pending')}
                                </Badge>
                            )}
                            {revisionVariants > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-orange-200 bg-orange-100 text-xs text-orange-800"
                                >
                                    {revisionVariants}{' '}
                                    {t('admin.approvals.revision')}
                                </Badge>
                            )}
                            {rejectedVariants > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-red-200 bg-red-100 text-xs text-red-800"
                                >
                                    {rejectedVariants}{' '}
                                    {t('admin.approvals.rejected')}
                                </Badge>
                            )}
                            {approvedVariants > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-green-200 bg-green-100 text-xs text-green-800"
                                >
                                    {approvedVariants}{' '}
                                    {t('admin.approvals.approved')}
                                </Badge>
                            )}
                        </div>
                    </div>
                ),
                color: 'border-blue-200',
            }
        }
        return {
            badge: null,
            color: 'border-gray-200',
        }
    }

    const statusInfo = getStatusInfo()

    // Get media preview - prioritize 3D models when available
    const getMediaPreview = () => {
        // Check if product has 3D models first
        const has3DModels = product.yobjet3d?.length > 0

        if (has3DModels) {
            // Use the first 3D model for preview
            const model = product.yobjet3d[0]
            // Use ycouleurarriereplan if set, else fallback to white
            const backgroundColor = model?.ycouleurarriereplan || '#ffffff'
            return (
                <div className="relative flex h-40 w-full items-center justify-center rounded-lg border border-purple-200 bg-gray-50">
                    <Model3DViewer
                        modelUrl={model?.ymodelurl}
                        backgroundColor={backgroundColor}
                        className="h-40 w-full"
                        autoRotate={true}
                    />
                    <div className="absolute top-2 right-2">
                        <Badge
                            variant="secondary"
                            className="border-purple-200 bg-purple-100 text-xs text-purple-800"
                        >
                            {t('admin.approvals.preview3D')}
                        </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                        <Badge
                            variant="secondary"
                            className="border-blue-200 bg-blue-100 text-xs text-blue-800"
                        >
                            {product.yobjet3d.length}{' '}
                            {product.yobjet3d.length > 1
                                ? t('admin.approvals.models')
                                : t('admin.approvals.model')}
                        </Badge>
                    </div>
                </div>
            )
        }

        // Fallback to regular media preview
        const media = product.media?.[0]
        if (!media) return null

        if (media.ymediaboolvideo) {
            return (
                <div className="relative flex h-32 w-full items-center justify-center rounded-lg bg-gray-100">
                    <Play className="h-8 w-8 text-gray-600" />
                    <div className="absolute top-2 right-2">
                        <Badge
                            variant="secondary"
                            className="border-purple-200 bg-purple-100 text-xs text-purple-800"
                        >
                            {t('admin.approvals.video')}
                        </Badge>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
                    <img
                        src={media.ymediaurl}
                        alt={media.ymediaintitule}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                    <svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            `
                        }}
                    />
                </div>
            )
        }
    }

    // Get variant status counts
    const variants = product.yvarprod || []
    const variantCounts = {
        pending: variants.filter(
            (v: any) => v.yvarprodstatut === 'not_approved'
        ).length,
        approved: variants.filter((v: any) => v.yvarprodstatut === 'approved')
            .length,
        revision: variants.filter((v: any) => v.yvarprodstatut === 'rejected')
            .length,
        rejected: variants.filter((v: any) => v.yvarprodstatut === 'rejected')
            .length,
    }

    return (
        <Card
            className={`bg-gradient-to-br from-gray-50/50 to-white/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${statusInfo.color}`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                            {product.yprodintitule}
                        </h3>
                        <p className="font-mono text-xs text-gray-600">
                            {product.yprodcode}
                        </p>
                    </div>
                    {statusInfo.badge}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Media Preview */}
                {getMediaPreview() || (
                    <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-100">
                        <ImageIcon className="h-8 w-8 text-gray-600" />
                        <span className="ml-2 text-sm text-gray-600">
                            {t('admin.approvals.noMedia')}
                        </span>
                    </div>
                )}

                {/* Product Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                            {t('admin.approvals.category')}:
                        </span>
                        <Badge
                            variant="secondary"
                            className="border-blue-200 bg-blue-100 text-xs text-blue-800"
                        >
                            {category?.xcategprodintitule ||
                                t('admin.approvals.unknown')}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                            {t('admin.approvals.store')}:
                        </span>
                        <span className="text-gray-900">
                            {product.store?.yboutiqueintitule ||
                                t('admin.approvals.unknownStore')}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                            {t('admin.approvals.variants')}:
                        </span>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                            <span className="text-gray-900">
                                {variants.length || 0}
                            </span>
                            {variantCounts.pending > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-yellow-200 bg-yellow-100 text-xs text-yellow-800"
                                >
                                    {variantCounts.pending}{' '}
                                    {t('admin.approvals.pending')}
                                </Badge>
                            )}
                            {variantCounts.revision > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-orange-200 bg-orange-100 text-xs text-orange-800"
                                >
                                    {variantCounts.revision}{' '}
                                    {t('admin.approvals.revision')}
                                </Badge>
                            )}
                            {variantCounts.rejected > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-red-200 bg-red-100 text-xs text-red-800"
                                >
                                    {variantCounts.rejected}{' '}
                                    {t('admin.approvals.rejected')}
                                </Badge>
                            )}
                            {variantCounts.approved > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="border-green-200 bg-green-100 text-xs text-green-800"
                                >
                                    {variantCounts.approved}{' '}
                                    {t('admin.approvals.approved')}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* 3D Models indicator */}
                    {product.yobjet3d?.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                                {t('admin.approvals.models3D')}:
                            </span>
                            <div className="flex items-center gap-1">
                                <Box className="h-3 w-3 text-purple-600" />
                                <span className="text-purple-600">
                                    {product.yobjet3d.length}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                            {t('admin.approvals.created')}:
                        </span>
                        <span className="text-gray-900">
                            {new Date(product.sysdate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center border-t border-gray-200 pt-2">
                    <Button
                        size="sm"
                        onClick={onAudit}
                        className="h-9 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600"
                        title={t('admin.approvals.auditProduct')}
                    >
                        <FileSearch className="mr-2 h-4 w-4" />
                        {t('admin.approvals.auditProduct')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
