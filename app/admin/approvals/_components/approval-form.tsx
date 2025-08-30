"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CheckCircle,
    X,
    AlertTriangle,
    Package,
    Image as ImageIcon,
    Loader2,
    Calendar,
    Store,
    User,
    MapPin,
    Settings,
} from "lucide-react";
import { useApprovalOperations } from "../_hooks/use-approval-operations";
import { useVariantApprovalOperations } from "../_hooks/use-variant-approval-operations";
import { useCategories } from "../../stores/[storeId]/_hooks/use-categories";
import { useInfospotactions } from "../_hooks/use-infospotactions";
import { createClient } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import { Model3DViewer } from "./three-d-viewer";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/lib/supabase";

// Type definitions
type ProductVariant = Database["morpheus"]["Tables"]["yvarprod"]["Row"] & {
    xcouleur?: Database["morpheus"]["Tables"]["xcouleur"]["Row"];
    xtaille?: Database["morpheus"]["Tables"]["xtaille"]["Row"];
    xdevise?: Database["morpheus"]["Tables"]["xdevise"]["Row"];
    yobjet3d?: Database["morpheus"]["Tables"]["yobjet3d"]["Row"][];
    yvarprodmedia?: Array<{
        ymedia: Database["morpheus"]["Tables"]["ymedia"]["Row"];
    }>;
};

type Product = Database["morpheus"]["Tables"]["yprod"]["Row"] & {
    yvarprod?: ProductVariant[];
    ydetailsevent?: Array<{
        yboutique?: Database["morpheus"]["Tables"]["yboutique"]["Row"];
        ydesign?: Database["morpheus"]["Tables"]["ydesign"]["Row"];
        ymall?: Database["morpheus"]["Tables"]["ymall"]["Row"];
        yevent?: Database["morpheus"]["Tables"]["yevent"]["Row"];
    }>;
};

type Category = Database["morpheus"]["Tables"]["xcategprod"]["Row"];

interface PromotionData {
    catalogPrice?: number;
    currencyId?: number;
    promotionPrice?: number;
    promotionStartDate?: string;
    promotionEndDate?: string;
}

// Variant Card Component
interface VariantCardProps {
    variant: any;
    onApprove: (promotionData?: any) => void;
    onReject: () => void;
    isLoading: boolean;
    eventStartDate?: string;
    eventEndDate?: string;
    onPriceValidityChange?: (variantId: number, hasValidPrice: boolean, formData?: PromotionData | null) => void;
}

function VariantCard({ variant, onApprove, onReject, isLoading, eventStartDate, eventEndDate, onPriceValidityChange }: VariantCardProps) {
    const { t } = useLanguage();
    const [showPromotionForm, setShowPromotionForm] = useState(false);
    const [promotionPrice, setPromotionPrice] = useState(variant.yvarprodprixpromotion || "");
    const [promotionStartDate, setPromotionStartDate] = useState(variant.yvarprodpromotiondatedeb || "");
    const [promotionEndDate, setPromotionEndDate] = useState(variant.yvarprodpromotiondatefin || "");
    const [catalogPrice, setCatalogPrice] = useState(variant.yvarprodprixcatalogue || "");
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(variant.xdeviseidfk || 1);

    const supabase = createClient();
    
    // Ref to track last sent values to prevent unnecessary updates
    const lastSentRef = useRef<{validity: boolean, formDataHash: string}>({ validity: false, formDataHash: "" });

    // Check if variant has a valid price (either from database or from form)
    const hasValidPrice = useCallback(() => {
        if (showPromotionForm) {
            // If form is shown, check the form price
            return catalogPrice && parseFloat(catalogPrice) > 0;
        } else {
            // If form is not shown, check the database price
            return variant.yvarprodprixcatalogue && parseFloat(variant.yvarprodprixcatalogue.toString()) > 0;
        }
    }, [showPromotionForm, catalogPrice, variant.yvarprodprixcatalogue]);

    // Notify parent when price validity changes
    useEffect(() => {
        if (!onPriceValidityChange) return;
        
        // Calculate validity directly here to avoid function in dependencies
        const isValid = showPromotionForm 
            ? (catalogPrice && parseFloat(catalogPrice) > 0)
            : (variant.yvarprodprixcatalogue && parseFloat(variant.yvarprodprixcatalogue.toString()) > 0);
            
        const formData = showPromotionForm ? {
            catalogPrice: catalogPrice ? parseFloat(catalogPrice) : undefined,
            currencyId: selectedCurrencyId,
            promotionPrice: promotionPrice ? parseFloat(promotionPrice) : undefined,
            promotionStartDate: promotionStartDate || undefined,
            promotionEndDate: promotionEndDate || undefined,
        } : null;
        
        // Create a hash to detect changes in form data
        const formDataHash = JSON.stringify(formData);
        
        // Only call if something actually changed
        if (lastSentRef.current.validity !== isValid || lastSentRef.current.formDataHash !== formDataHash) {
            lastSentRef.current = { validity: isValid, formDataHash };
            onPriceValidityChange(variant.yvarprodid, isValid, formData);
        }
    }, [showPromotionForm, catalogPrice, variant.yvarprodprixcatalogue, promotionPrice, promotionStartDate, promotionEndDate, selectedCurrencyId, onPriceValidityChange, variant.yvarprodid]);

    // Validation functions
    const validatePromotionDates = () => {
        if (!promotionPrice || parseFloat(promotionPrice) <= 0) {
            return { isValid: true, error: null }; // No promotion, no validation needed
        }

        if (!promotionStartDate || !promotionEndDate) {
            return {
                isValid: false,
                error: t("admin.approvals.promotionDatesRequired")
            };
        }

        const startDate = new Date(promotionStartDate);
        const endDate = new Date(promotionEndDate);

        if (endDate <= startDate) {
            return {
                isValid: false,
                error: t("admin.approvals.endDateAfterStart")
            };
        }

        // Validate against event dates if available
        if (eventStartDate && eventEndDate) {
            const eventStart = new Date(eventStartDate);
            const eventEnd = new Date(eventEndDate);

            if (startDate < eventStart || startDate > eventEnd) {
                return {
                    isValid: false,
                    error: t("admin.approvals.promotionStartWithinEvent")
                };
            }

            if (endDate < eventStart || endDate > eventEnd) {
                return {
                    isValid: false,
                    error: t("admin.approvals.promotionEndWithinEvent")
                };
            }
        }

        return { isValid: true, error: null };
    };

    const promotionValidation = validatePromotionDates();

    // Fetch currencies
    const { data: currencies } = useQuery({
        queryKey: ["currencies"],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("morpheus")
                .from("xdevise")
                .select("*")
                .order("xdevisecodealpha");

            if (error) throw new Error(error.message);
            return data;
        },
    });
    // Extract media data directly from the variant object (already loaded in main query)
    const models3d = variant.yobjet3d?.map((obj) => obj.yobjet3durl) || [];
    const allMedia = variant.yvarprodmedia?.map((media) => media.ymedia).filter(Boolean) || [];

    // Debug media data
    console.log("Debug media for variant", variant.yvarprodid, {
        allMedia,
        rawMedia: variant.yvarprodmedia,
        models3d,
    });

    // First, separate videos explicitly
    const videos = allMedia.filter((media) => {
        const isVideo =
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1";

        console.log("Media check for video:", media.ymediaid, {
            ymediaboolvideo: media.ymediaboolvideo,
            ymediaboolvideocapsule: media.ymediaboolvideocapsule,
            isVideo,
        });

        return isVideo;
    });

    // Then, treat everything else as images (including explicit image flags and fallback)
    const images = allMedia.filter((media) => {
        // First check if it's explicitly a video
        const isVideo =
            media.ymediaboolvideo === true ||
            media.ymediaboolvideo === "1" ||
            media.ymediaboolvideocapsule === true ||
            media.ymediaboolvideocapsule === "1";

        // If not a video, treat as image
        const isImage = !isVideo;

        console.log("Media check for image:", media.ymediaid, {
            ymediaboolphotoprod: media.ymediaboolphotoprod,
            ymediaboolphotoevent: media.ymediaboolphotoevent,
            ymediaboolphotoeditoriale: media.ymediaboolphotoeditoriale,
            ymediaboolvideo: media.ymediaboolvideo,
            isVideo,
            isImage,
        });

        return isImage;
    });

    console.log("Final media counts:", {
        models3d: models3d.length,
        images: images.length,
        videos: videos.length,
    });

    const getStatusBadge = () => {
        switch (variant.yvarprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t("admin.approvals.pending")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("admin.approvals.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        <X className="h-3 w-3 mr-1" />
                        {t("admin.approvals.rejected")}
                    </Badge>
                );
            default:
                return null;
        }
    };

    const renderMediaPreview = () => {
        const hasAnyMedia = models3d.length > 0 || images.length > 0 || videos.length > 0;

        if (!hasAnyMedia) {
            return (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {/* 3D Models */}
                {models3d.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-purple-600 font-medium">{t("admin.approvals.models3D")} ({models3d.length})</div>
                        <div className="grid gap-2">
                            {models3d.map((modelUrl, index) => (
                                <Model3DViewer
                                    key={index}
                                    modelUrl={modelUrl}
                                    className="aspect-video"
                                    autoRotate={true}
                                    backgroundColor={variant.yobjet3d?.[index]?.ycouleurarriereplan || "#ffffff"}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-blue-600 font-medium">{t("admin.approvals.images")} ({images.length})</div>
                        <div className="grid gap-2">
                            {images.map((image) => (
                                <div
                                    key={image.ymediaid}
                                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={image.ymediaurl}
                                        alt={image.ymediaintitule}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.parentElement!.innerHTML = `
                                                <div class="w-full h-full flex items-center justify-center">
                                                    <svg class="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-xs text-green-600 font-medium">{t("admin.approvals.videos")} ({videos.length})</div>
                        <div className="grid gap-2">
                            {videos.map((video) => (
                                <div
                                    key={video.ymediaid}
                                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                                >
                                    <video
                                        src={video.ymediaurl}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-gray-900 text-sm font-medium">{variant.yvarprodintitule}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                            <span>{variant.xcouleur?.xcouleurintitule}</span>
                            <span>•</span>
                            <span>{variant.xtaille?.xtailleintitule}</span>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Media Preview */}
                {renderMediaPreview()}

                {/* Variant Details */}
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("admin.approvals.price")}:</span>
                        <span className="text-gray-900">
                            {variant.yvarprodprixcatalogue
                                ? `${variant.yvarprodprixcatalogue} ${variant.xdevise?.xdevisecodealpha || ""}`
                                : t("admin.approvals.notSet")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">{t("admin.approvals.delivery")}:</span>
                        <span className="text-gray-900">{variant.yvarprodnbrjourlivraison || 0} {t("admin.approvals.days")}</span>
                    </div>
                    {variant.yvarprodprixpromotion && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-gray-400">{t("admin.approvals.promo")}:</span>
                                <span className="text-green-600">
                                    {variant.yvarprodprixpromotion} {variant.xdevise?.xdevisecodealpha || ""}
                                </span>
                            </div>
                            {(variant.yvarprodpromotiondatedeb || variant.yvarprodpromotiondatefin) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{t("admin.approvals.promoPeriod")}:</span>
                                    <span className="text-green-600 text-xs">
                                        {variant.yvarprodpromotiondatedeb && new Date(variant.yvarprodpromotiondatedeb).toLocaleDateString()}
                                        {variant.yvarprodpromotiondatedeb && variant.yvarprodpromotiondatefin && " - "}
                                        {variant.yvarprodpromotiondatefin && new Date(variant.yvarprodpromotiondatefin).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Media Count Indicators */}
                {(models3d?.length > 0 || images?.length > 0 || videos?.length > 0) && (
                    <div className="flex gap-1 flex-wrap">
                        {models3d?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                            >
                                {models3d.length} 3D
                            </Badge>
                        )}
                        {images?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                            >
                                {images.length} img
                            </Badge>
                        )}
                        {videos?.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 border-green-200 text-xs"
                            >
                                {videos.length} vid
                            </Badge>
                        )}
                    </div>
                )}

                {/* Promotion Form */}
                {showPromotionForm && variant.yvarprodstatut === "not_approved" && (
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">{t("admin.approvals.pricingPromotionSettings")}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-700">{t("admin.approvals.catalogPriceRequired")}</Label>
                                    <Input
                                        type="number"
                                        step={(() => {
                                            const selectedCurrency = currencies?.find(c => c.xdeviseid === selectedCurrencyId);
                                            const decimals = selectedCurrency?.xdevisenbrdec ?? 2;
                                            if (decimals === 0) return "1";
                                            return (1 / Math.pow(10, decimals)).toFixed(decimals);
                                        })()}
                                        value={catalogPrice}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            const selectedCurrency = currencies?.find(c => c.xdeviseid === selectedCurrencyId);
                                            const maxDecimals = selectedCurrency?.xdevisenbrdec ?? 2;

                                            // Check decimal places
                                            const decimalIndex = inputValue.indexOf('.');
                                            const actualDecimals = decimalIndex === -1 ? 0 : inputValue.length - decimalIndex - 1;

                                            if (actualDecimals <= maxDecimals) {
                                                setCatalogPrice(inputValue);
                                            }
                                        }}
                                        className="h-8 text-xs bg-white border-gray-300 text-gray-900"
                                        placeholder={t("admin.approvals.requiredCatalogPrice")}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-700">{t("admin.approvals.currency")}</Label>
                                    <Select
                                        value={selectedCurrencyId?.toString() || ""}
                                        onValueChange={(value) => setSelectedCurrencyId(parseInt(value))}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-white border-gray-300 text-gray-900">
                                            <SelectValue placeholder={t("admin.approvals.selectCurrency")} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300">
                                            {currencies?.map((currency) => (
                                                <SelectItem
                                                    key={currency.xdeviseid}
                                                    value={currency.xdeviseid.toString()}
                                                    className="text-gray-900 hover:bg-gray-100"
                                                >
                                                    {currency.xdevisecodealpha} - {currency.xdeviseintitule}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-700">{t("admin.approvals.promotionPrice")}</Label>
                                <Input
                                    type="number"
                                    step={(() => {
                                        const selectedCurrency = currencies?.find(c => c.xdeviseid === selectedCurrencyId);
                                        const decimals = selectedCurrency?.xdevisenbrdec ?? 2;
                                        if (decimals === 0) return "1";
                                        return (1 / Math.pow(10, decimals)).toFixed(decimals);
                                    })()}
                                    value={promotionPrice}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        const selectedCurrency = currencies?.find(c => c.xdeviseid === selectedCurrencyId);
                                        const maxDecimals = selectedCurrency?.xdevisenbrdec ?? 2;

                                        // Check decimal places
                                        const decimalIndex = inputValue.indexOf('.');
                                        const actualDecimals = decimalIndex === -1 ? 0 : inputValue.length - decimalIndex - 1;

                                        if (actualDecimals <= maxDecimals) {
                                            setPromotionPrice(inputValue);
                                        }
                                    }}
                                    className="h-8 text-xs bg-white border-gray-300 text-gray-900"
                                    placeholder={t("admin.approvals.optionalPromotionPrice")}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-700">{t("admin.approvals.startDate")}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={promotionStartDate}
                                        onChange={(e) => setPromotionStartDate(e.target.value)}
                                        className="h-8 text-xs bg-white border-gray-300 text-gray-900"
                                        min={eventStartDate ? eventStartDate.replace(' ', 'T') : undefined}
                                        max={eventEndDate ? eventEndDate.replace(' ', 'T') : undefined}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-700">{t("admin.approvals.endDate")}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={promotionEndDate}
                                        onChange={(e) => setPromotionEndDate(e.target.value)}
                                        className="h-8 text-xs bg-white border-gray-300 text-gray-900"
                                        min={promotionStartDate || (eventStartDate ? eventStartDate.replace(' ', 'T') : undefined)}
                                        max={eventEndDate ? eventEndDate.replace(' ', 'T') : undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {variant.yvarprodstatut === "not_approved" && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        {!showPromotionForm && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPromotionForm(true)}
                                className="w-full h-8 border-blue-300 text-blue-600 hover:bg-blue-50 text-xs"
                            >
                                <Settings className="h-3 w-3 mr-1" />
                                {t("admin.approvals.setPricePromotion")}
                            </Button>
                        )}
                        {/* Validation Error Display */}
                        {showPromotionForm && !promotionValidation.isValid && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {promotionValidation.error}
                            </div>
                        )}

                        {/* Price Validation Error */}
                        {!showPromotionForm && (!variant.yvarprodprixcatalogue || parseFloat(variant.yvarprodprixcatalogue.toString()) <= 0) && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {t("admin.approvals.catalogPriceRequiredForApproval")}
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => {
                                    const approvalData = showPromotionForm
                                        ? {
                                              catalogPrice: catalogPrice ? parseFloat(catalogPrice) : null,
                                              currencyId: selectedCurrencyId,
                                              promotionPrice: promotionPrice ? parseFloat(promotionPrice) : null,
                                              promotionStartDate: promotionStartDate || null,
                                              promotionEndDate: promotionEndDate || null,
                                          }
                                        : null;
                                    onApprove(approvalData);
                                }}
                                disabled={
                                    isLoading ||
                                    (!showPromotionForm && (!variant.yvarprodprixcatalogue || parseFloat(variant.yvarprodprixcatalogue.toString()) <= 0)) ||
                                    (showPromotionForm && (!catalogPrice || parseFloat(catalogPrice) <= 0)) ||
                                    (showPromotionForm && !promotionValidation.isValid)
                                }
                                className="flex-1 h-8 bg-green-600 hover:bg-green-500 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t("admin.approvals.approve")}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onReject}
                                disabled={isLoading}
                                className="flex-1 h-8 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                            >
                                <X className="h-3 w-3 mr-1" />
                                {t("admin.approvals.reject")}
                            </Button>
                        </div>
                        {showPromotionForm && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowPromotionForm(false)}
                                className="w-full h-6 text-xs text-gray-600 hover:text-gray-900"
                            >
                                {t("common.cancel")}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ApprovalFormProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number;
}

export function ApprovalForm({ isOpen, onClose, productId }: ApprovalFormProps) {
    const { t } = useLanguage();
    const { data: user } = useAuth();
    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    
    const { approveProduct, denyProduct, isLoading } = useApprovalOperations();
    const {
        approveVariant,
        denyVariant,
        bulkApproveVariants,
        isLoading: variantLoading,
    } = useVariantApprovalOperations();
    const { data: categories } = useCategories();
    const supabase = createClient();

    // State for category and infospotaction selection
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedInfospotactionId, setSelectedInfospotactionId] = useState<number | null>(null);
    const [productApprovalError, setProductApprovalError] = useState<string | null>(null);
    const [bulkApprovalError, setBulkApprovalError] = useState<string | null>(null);
    
    // Track which variants have valid prices (including form prices)
    const [variantPriceValidity, setVariantPriceValidity] = useState<Record<number, boolean>>({});
    
    // Track variant form data for bulk approval
    const [variantFormData, setVariantFormData] = useState<Record<number, PromotionData | null>>({});

    // Handle price validity changes from variant cards
    const handlePriceValidityChange = useCallback((variantId: number, hasValidPrice: boolean, formData?: PromotionData | null) => {
        setVariantPriceValidity(prev => ({
            ...prev,
            [variantId]: hasValidPrice
        }));
        
        // Also store the form data for bulk approval
        if (formData !== undefined) {
            setVariantFormData(prev => ({
                ...prev,
                [variantId]: formData
            }));
        }
    }, []);

    // Fetch product details
    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ["product-details-approval", productId],
        queryFn: async () => {
            if (!productId) return null;

            const { data, error } = await supabase
                .schema("morpheus")
                .from("yprod")
                .select(
                    `
                    *,
                    yvarprod(
                        *,
                        xcouleur(*),
                        xtaille(*),
                        xdevise(*),
                        yobjet3d(*),
                        yvarprodmedia(
                            ymedia:ymediaidfk(*)
                        )
                    ),
                    ydetailsevent(
                        *,
                        yboutique:yboutiqueidfk(*),
                        ydesign:ydesignidfk(*),
                        ymall:ymallidfk(*),
                        yevent:yeventidfk(*)
                    )
                `
                )
                .eq("yprodid", productId)
                .single();

            console.log("Raw product query result:", { data, error });

            if (error) {
                throw new Error(error.message);
            }

            return data as Product;
        },
        enabled: !!productId && isOpen,
    });

    // Initialize price validity for all variants when product loads
    useEffect(() => {
        if (product?.yvarprod) {
            const initialValidity: Record<number, boolean> = {};
            product.yvarprod.forEach(variant => {
                initialValidity[variant.yvarprodid] = Boolean(
                    variant.yvarprodprixcatalogue && parseFloat(variant.yvarprodprixcatalogue.toString()) > 0
                );
            });
            setVariantPriceValidity(initialValidity);
        }
    }, [product?.yvarprod]);

    // Get category name
    const category = categories?.find((cat) => cat.xcategprodid === product?.xcategprodidfk);

    // Get event details
    const eventDetail = product?.ydetailsevent?.[0];
    const store = eventDetail?.yboutique;
    const designer = eventDetail?.ydesign;
    const mall = eventDetail?.ymall;
    const event = eventDetail?.yevent;

    // Debug logging
    console.log("Debug approval form data:", {
        product: product?.yprodid,
        eventDetail,
        store,
        storeId: store?.yboutiqueid,
        ydetailsevent: product?.ydetailsevent
    });

    // Get boutique ID for infospotactions
    const boutiqueId = store?.yboutiqueid;
    
    // Fetch infospotactions for the current boutique (admin only)
    // If no boutiqueId, we'll fetch all available infospotactions as fallback
    const { data: infospotactions } = useInfospotactions({
        boutiqueId,
        enabled: isAdmin && isOpen
    });

    // Get pending variants count
    const pendingVariants = product?.yvarprod?.filter((v) => v.yvarprodstatut === "not_approved") || [];
    const approvedVariants = product?.yvarprod?.filter((v) => v.yvarprodstatut === "approved") || [];
    const rejectedVariants = product?.yvarprod?.filter((v) => v.yvarprodstatut === "rejected") || [];

    // Check which pending variants don't have valid prices (considering both database and form states)
    const pendingVariantsWithoutValidPrice = pendingVariants.filter(variant => 
        !variantPriceValidity[variant.yvarprodid]
    );
    
    // Can bulk approve only if all pending variants have valid prices
    const canBulkApprove = pendingVariants.length > 0 && pendingVariantsWithoutValidPrice.length === 0;

    // Check if product can be approved (category and placement must be set)
    const canApproveProduct = () => {
        // Category must be selected (either existing or newly selected)
        const hasCategory = selectedCategoryId || product?.xcategprodidfk;
        
        // For admin users, placement (infospotaction) must be selected
        const hasPlacement = !isAdmin || selectedInfospotactionId;
        
        return hasCategory && hasPlacement;
    };

    const handleApproveProduct = async () => {
        if (!productId || !product) return;

        // Clear previous errors
        setProductApprovalError(null);

        // Validate that infospotaction is selected (admin only)
        if (isAdmin && !selectedInfospotactionId) {
            setProductApprovalError(t("admin.approvals.productPlacementRequired"));
            return;
        }

        try {
            await approveProduct.mutateAsync({
                productId,
                approvalData: {
                    categoryId: selectedCategoryId || product.xcategprodidfk,
                    infoactionId: selectedInfospotactionId,
                },
            });
            onClose();
        } catch (error: any) {
            console.error("Product approval error:", error);
            setProductApprovalError(t("admin.approvals.productApprovalError"));
        }
    };

    const handleRejectProduct = async () => {
        if (!productId) return;

        try {
            await denyProduct.mutateAsync(productId);
            onClose();
        } catch (error: any) {
            console.error("Product rejection error:", error);
        }
    };

    const handleApproveVariant = async (variantId: number, approvalData?: PromotionData) => {
        const variant = product?.yvarprod?.find((v) => v.yvarprodid === variantId);
        if (!variant) return;

        // Validate that catalog price is set and valid
        const catalogPrice = approvalData?.catalogPrice || variant.yvarprodprixcatalogue;
        if (!catalogPrice || parseFloat(catalogPrice.toString()) <= 0) {
            // This error should be handled by the VariantCard component
            return;
        }

        try {
            await approveVariant.mutateAsync({
                variantId,
                approvalData: {
                    yvarprodprixcatalogue: catalogPrice,
                    yvarprodprixpromotion: approvalData?.promotionPrice || variant.yvarprodprixpromotion,
                    yvarprodpromotiondatedeb: approvalData?.promotionStartDate || variant.yvarprodpromotiondatedeb,
                    yvarprodpromotiondatefin: approvalData?.promotionEndDate || variant.yvarprodpromotiondatefin,
                    yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison || 1,
                    currencyId: approvalData?.currencyId || variant.xdeviseidfk || 1,
                },
            });
        } catch (error: any) {
            console.error("Variant approval error:", error);
        }
    };

    const handleRejectVariant = async (variantId: number) => {
        try {
            await denyVariant.mutateAsync(variantId);
        } catch (error: any) {
            console.error("Variant rejection error:", error);
        }
    };

    const handleBulkApproveVariants = async () => {
        if (!product?.yvarprod || pendingVariants.length === 0) return;

        // Clear previous errors
        setBulkApprovalError(null);

        // Validate that all pending variants have valid catalog prices
        if (pendingVariantsWithoutValidPrice.length > 0) {
            setBulkApprovalError(
                `${t("admin.approvals.bulkApprovalRequiresPrices")} (${pendingVariantsWithoutValidPrice.length} variants)`
            );
            return;
        }

        const variantApprovals = pendingVariants.map((variant) => {
            // Use form data if available, otherwise use database values
            const formData = variantFormData[variant.yvarprodid];
            
            return {
                variantId: variant.yvarprodid,
                approvalData: {
                    yvarprodprixcatalogue: formData?.catalogPrice || variant.yvarprodprixcatalogue,
                    yvarprodprixpromotion: formData?.promotionPrice || variant.yvarprodprixpromotion,
                    yvarprodpromotiondatedeb: formData?.promotionStartDate || variant.yvarprodpromotiondatedeb,
                    yvarprodpromotiondatefin: formData?.promotionEndDate || variant.yvarprodpromotiondatefin,
                    yvarprodnbrjourlivraison: variant.yvarprodnbrjourlivraison || 1,
                    currencyId: formData?.currencyId || variant.xdeviseidfk || 1,
                },
            };
        });

        try {
            await bulkApproveVariants.mutateAsync({ variantApprovals });
        } catch (error: any) {
            console.error("Bulk approval error:", error);
            setBulkApprovalError(t("admin.approvals.bulkApprovalError"));
        }
    };

    const getProductStatusBadge = () => {
        switch (product?.yprodstatut) {
            case "not_approved":
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {t("admin.approvals.pendingApproval")}
                    </Badge>
                );
            case "approved":
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("admin.approvals.approved")}
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        <X className="h-4 w-4 mr-1" />
                        {t("admin.approvals.rejected")}
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (productLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogTitle className="text-lg text-gray-900">{t("admin.approvals.loadingProductApproval")}</DialogTitle>
                <DialogContent className="max-w-6xl max-h-[90vh] bg-white border-gray-200">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] bg-white border-gray-200 p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl text-gray-900">
                                {t("admin.approvals.productApproval")}: {product.yprodintitule}
                            </DialogTitle>
                            <p className="text-sm text-gray-600 font-mono mt-1">{product.yprodcode}</p>
                        </div>
                        {getProductStatusBadge()}
                    </div>
                </DialogHeader>

                <div className="flex h-[calc(95vh-180px)]">
                    {/* Left Panel - Product Information */}
                    <div className="w-1/2 border-r border-gray-200">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-6">
                                {/* Basic Product Info */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                                            <Package className="h-5 w-5 text-blue-600" />
                                            {t("admin.approvals.productInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.approvals.productName")}</Label>
                                            <div className="text-gray-900 font-medium">{product.yprodintitule}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.approvals.productCode")}</Label>
                                            <div className="text-gray-900 font-mono text-sm">{product.yprodcode}</div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm flex items-center gap-2">
                                                {t("admin.approvals.category")}
                                                {product.yprodstatut === "not_approved" && !(selectedCategoryId || product.xcategprodidfk) && (
                                                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                                )}
                                            </Label>
                                            {product.yprodstatut === "not_approved" ? (
                                                <Select
                                                    value={selectedCategoryId?.toString() || product.xcategprodidfk?.toString() || ""}
                                                    onValueChange={(value) =>
                                                        setSelectedCategoryId(value ? parseInt(value) : null)
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs bg-white border-gray-300 text-gray-900">
                                                        <SelectValue placeholder={t("admin.approvals.selectCategory")} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300">
                                                        {categories?.map((cat: Category) => (
                                                            <SelectItem
                                                                key={cat.xcategprodid}
                                                                value={cat.xcategprodid.toString()}
                                                                className="text-gray-900 hover:bg-gray-100"
                                                            >
                                                                {cat.xcategprodintitule}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="text-gray-900">
                                                    {category?.xcategprodintitule || t("admin.approvals.unknown")}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Infospotaction Selection (Admin Only) */}
                                        {isAdmin && product.yprodstatut === "not_approved" && (
                                            <div>
                                                <Label className="text-gray-700 text-sm flex items-center gap-2">
                                                    {t("admin.approvals.productPlacement")}
                                                    {!selectedInfospotactionId && (
                                                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                                    )}
                                                </Label>
                                                {!boutiqueId && (
                                                    <div className="text-xs text-yellow-600 mb-1 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Product not linked to a boutique - showing all available placements
                                                    </div>
                                                )}
                                                <Select
                                                    value={selectedInfospotactionId?.toString() || ""}
                                                    onValueChange={(value) =>
                                                        setSelectedInfospotactionId(value ? parseInt(value) : null)
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 text-xs bg-white border-gray-300 text-gray-900">
                                                        <SelectValue placeholder={t("admin.approvals.selectProductPlacement")} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300">
                                                        {infospotactions?.map((action) => (
                                                            <SelectItem
                                                                key={action.yinfospotactionsid}
                                                                value={action.yinfospotactionsid.toString()}
                                                                className="text-gray-900 hover:bg-gray-100"
                                                            >
                                                                {action.yinfospotactionstitle}
                                                                {!boutiqueId && (
                                                                    <span className="text-xs text-gray-600 ml-2">
                                                                        (Global)
                                                                    </span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.approvals.technicalDetails")}</Label>
                                            <div className="text-gray-700 text-sm bg-gray-100 p-3 rounded border border-gray-300">
                                                {product.yproddetailstech || t("admin.approvals.noTechnicalDetails")}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 text-sm">{t("admin.approvals.infoBubble")}</Label>
                                            <div className="text-gray-700 text-sm bg-gray-100 p-3 rounded border border-gray-300">
                                                {product.yprodinfobulle || t("admin.approvals.noInfoBubble")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Context Information */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            {t("admin.approvals.contextInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {designer && (
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-gray-600" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.approvals.designer")}</Label>
                                                    <div className="text-gray-900">
                                                        {designer.ydesignnom} ({designer.ydesignmarque})
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {store && (
                                            <div className="flex items-center gap-3">
                                                <Store className="h-4 w-4 text-gray-600" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.approvals.store")}</Label>
                                                    <div className="text-gray-900">
                                                        {store.yboutiqueintitule || store.yboutiquecode}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {mall && (
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-gray-600" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.approvals.mall")}</Label>
                                                    <div className="text-gray-900">{mall.ymallintitule}</div>
                                                </div>
                                            </div>
                                        )}
                                        {event && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                <div>
                                                    <Label className="text-gray-700 text-sm">{t("admin.approvals.event")}</Label>
                                                    <div className="text-gray-900">{event.yeventintitule}</div>
                                                    <div className="text-gray-600 text-xs">
                                                        {event.yeventdatedeb} {t("admin.approvals.to")} {event.yeventdatefin}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Variant Summary */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 text-lg">{t("admin.approvals.variantSummary")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {pendingVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.approvals.pending")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {approvedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.approvals.approved")}</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {rejectedVariants.length}
                                                </div>
                                                <div className="text-xs text-gray-600">{t("admin.approvals.rejected")}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Panel - Variant Cards */}
                    <div className="w-1/2">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {t("admin.approvals.productVariants")} ({product.yvarprod?.length || 0})
                                </h3>
                                {pendingVariants.length > 0 && (
                                    <Button
                                        size="sm"
                                        onClick={handleBulkApproveVariants}
                                        disabled={variantLoading || !canBulkApprove}
                                        className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={!canBulkApprove ? t("admin.approvals.bulkApprovalRequiresPrices") : undefined}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {t("admin.approvals.approveAll")} ({pendingVariants.length})
                                    </Button>
                                )}
                            </div>

                            {/* Bulk Approval Error */}
                            {bulkApprovalError && (
                                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                    {bulkApprovalError}
                                </div>
                            )}

                            {/* Bulk Approval Warning - when variants don't have prices */}
                            {pendingVariants.length > 0 && pendingVariantsWithoutValidPrice.length > 0 && (
                                <div className="mb-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {t("admin.approvals.bulkApprovalPriceWarning")} ({pendingVariantsWithoutValidPrice.length} {pendingVariantsWithoutValidPrice.length === 1 ? 'variant' : 'variants'})
                                </div>
                            )}

                            <ScrollArea className="h-[calc(95vh-300px)] overflow-y-auto">
                                <div className="space-y-4 pr-4">
                                    {product.yvarprod?.map((variant: ProductVariant) => (
                                        <VariantCard
                                            key={variant.yvarprodid}
                                            variant={variant}
                                            onApprove={(promotionData) =>
                                                handleApproveVariant(variant.yvarprodid, promotionData)
                                            }
                                            onReject={() => handleRejectVariant(variant.yvarprodid)}
                                            isLoading={variantLoading}
                                            eventStartDate={event?.yeventdatedeb}
                                            eventEndDate={event?.yeventdatefin}
                                            onPriceValidityChange={handlePriceValidityChange}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-200 flex flex-col gap-3">
                    {/* Product Approval Requirements Warning */}
                    {product?.yprodstatut === "not_approved" && !canApproveProduct() && (
                        <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded p-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <div>
                                {t("admin.approvals.productApprovalRequirementsMessage")}:
                                <ul className="list-disc list-inside mt-1 text-xs">
                                    {!(selectedCategoryId || product?.xcategprodidfk) && (
                                        <li>{t("admin.approvals.categoryRequired")}</li>
                                    )}
                                    {isAdmin && !selectedInfospotactionId && (
                                        <li>{t("admin.approvals.placementRequired")}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Product Approval Error */}
                    {productApprovalError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                            {productApprovalError}
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading || variantLoading}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleRejectProduct}
                            disabled={isLoading || variantLoading}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t("admin.approvals.rejectProduct")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApproveProduct}
                            disabled={isLoading || variantLoading || !canApproveProduct()}
                            className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!canApproveProduct() ? t("admin.approvals.productApprovalRequirements") : undefined}
                        >
                            {isLoading || variantLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("admin.approvals.processing")}
                                </div>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t("admin.approvals.approveProduct")}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
