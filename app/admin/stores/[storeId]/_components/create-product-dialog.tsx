"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SuperSelect } from "@/components/super-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Trash2,
    Upload,
    Image,
    Video,
    Box,
    Palette,
    Ruler,
    Package,
    FileText,
    Info,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import { useCategories } from "../_hooks/use-categories";
import { useColors } from "../_hooks/colors/use-colors";
import { useCreateColor } from "../_hooks/colors/use-create-color";
import { useSizes } from "../_hooks/sizes/use-sizes";
import { useCreateSize } from "../_hooks/sizes/use-create-size";
import { useDesigner } from "../_hooks/use-designer";
import { useCreateProduct } from "../_hooks/use-create-product";
import { useUpdateProduct } from "../_hooks/use-update-product";
import { useProductDetails } from "../_hooks/use-product-details";
import { useInfospotactions } from "../_hooks/use-infospotactions";
import { useCurrencies } from "../_hooks/use-currencies";

interface ProductVariant {
    id: string;
    yvarprodid?: number; // For existing variants
    name: string;
    code?: string;
    colorId: number | null;
    sizeId: number | null;
    images: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    videos: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    models3d: (File | { yobjet3did: number; yobjet3durl: string; ycouleurarriereplan?: string })[];
    backgroundColor?: string; // Hex color for 3D model background
    isDeleted?: boolean; // Mark for deletion
    status?: 'approved' | 'not_approved' | 'rejected'; // Variant status
    // Pricing fields (admin only)
    catalogPrice?: number;
    promotionPrice?: number | null;
    promotionStartDate?: string | null;
    promotionEndDate?: string | null;
    currencyId?: number | null;
}

interface CreateProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number; // If provided, dialog is in edit mode
}

export function CreateProductDialog({ isOpen, onClose, productId }: CreateProductDialogProps) {
    const params = useParams();
    const storeId = parseInt(params.storeId as string);
    const { data: user } = useAuth();
    const { t } = useLanguage();
    
    const isAdmin = user?.app_metadata?.roles?.includes("admin");
    const isStoreAdmin = user?.app_metadata?.roles?.includes("store_admin");
    
    // Get event context from URL parameters
    const [selectedEventId] = useQueryState("eventId", {
        defaultValue: null,
        parse: (value) => value ? parseInt(value) : null,
        serialize: (value) => value?.toString() || ""
    });

    // Form state
    const [productCode, setProductCode] = useState("");
    const [productName, setProductName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [fullDescription, setFullDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [selectedInfospotactionId, setSelectedInfospotactionId] = useState<number | null>(null);
    const [variants, setVariants] = useState<ProductVariant[]>([
        {
            id: "1",
            name: "",
            colorId: null,
            sizeId: null,
            images: [],
            videos: [],
            models3d: [],
            backgroundColor: "#ffffff",
        },
    ]);

    // Color creation state
    const [showColorForm, setShowColorForm] = useState(false);
    const [newColor, setNewColor] = useState({
        code: "",
        name: "",
        hexColor: "#000000",
        rgbColor: "0,0,0",
    });

    // Size creation state
    const [showSizeForm, setShowSizeForm] = useState(false);
    const [newSize, setNewSize] = useState({
        code: "",
        name: "",
        eur: "",
        us: "",
        x: "",
    });

    // Determine if we're in edit mode
    const isEditMode = !!productId;

    // Hooks
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: colors, isLoading: colorsLoading } = useColors();
    const { data: sizes, isLoading: sizesLoading } = useSizes();
    const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
    const { data: designer, isLoading: designerLoading } = useDesigner();
    const {
        data: productDetails,
        isLoading: productDetailsLoading,
        isError: productDetailsError,
    } = useProductDetails({
        productId: productId!,
        eventId: selectedEventId || undefined,
        enabled: isEditMode,
    });
    
    // Get store ID for infospotactions (admin only)
    const { data: infospotactions } = useInfospotactions({
        boutiqueId: storeId,
        enabled: isAdmin && !!storeId
    });
    const createColorMutation = useCreateColor();
    const createSizeMutation = useCreateSize();
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    // Effect to populate form when editing
    useEffect(() => {
        if (isEditMode && productDetails && productDetails.product) {
            const { product, variants: productVariants, infospotactionId } = productDetails;

            // Populate product fields
            setProductCode(product.yprodcode || "");
            setProductName(product.yprodintitule || "");
            setShortDescription(product.yprodinfobulle || "");
            setFullDescription(product.yproddetailstech || "");
            setCategoryId(product.xcategprodidfk || null);
            // Set the current infospotaction from ydetailsevent
            setSelectedInfospotactionId(infospotactionId || null);

            // Populate variants
            const formattedVariants: ProductVariant[] = productVariants.map((variant, index) => {
                // Get background color from the first 3D model if available
                const backgroundColorFrom3D = variant.models3d && variant.models3d.length > 0 
                    ? variant.models3d[0].ycouleurarriereplan 
                    : null;
                
                return {
                    id: variant.yvarprodid?.toString() || `existing-${index}`,
                    yvarprodid: variant.yvarprodid,
                    name: variant.yvarprodintitule || "",
                    code: variant.yvarprodcode || "",
                    colorId: variant.xcouleuridfk.xcouleurid || null,
                    sizeId: variant.xtailleidfk.xtailleid || null,
                    images: variant.images || [],
                    videos: variant.videos || [],
                    models3d: variant.models3d || [],
                    backgroundColor: backgroundColorFrom3D || "#ffffff", // Get from 3D model or default to white
                    status: variant.yvarprodstatut || 'not_approved',
                    // Populate pricing data
                    catalogPrice: variant.yvarprodprixcatalogue || 0,
                    promotionPrice: variant.yvarprodprixpromotion || null,
                    promotionStartDate: variant.yvarprodpromotiondatedeb || null,
                    promotionEndDate: variant.yvarprodpromotiondatefin || null,
                    currencyId: variant.xdeviseidfk || null,
                };
            });

            setVariants(
                formattedVariants.length > 0
                    ? formattedVariants
                    : [
                          {
                              id: "1",
                              name: "",
                              colorId: null,
                              sizeId: null,
                              images: [],
                              videos: [],
                              models3d: [],
                              backgroundColor: "#ffffff",
                              status: 'not_approved',
                          },
                      ]
            );
        } else if (!isEditMode) {
            // Reset form for create mode
            setProductCode("");
            setProductName("");
            setShortDescription("");
            setFullDescription("");
            setCategoryId(null);
            setSelectedInfospotactionId(null);
            setVariants([
                {
                    id: "1",
                    name: "",
                    colorId: null,
                    sizeId: null,
                    images: [],
                    videos: [],
                    models3d: [],
                    backgroundColor: "#ffffff",
                    status: 'not_approved',
                    catalogPrice: 0,
                    promotionPrice: null,
                    promotionStartDate: null,
                    promotionEndDate: null,
                    currencyId: null,
                },
            ]);
        }
    }, [isEditMode, productDetails]);

    // Prepare options
    const categoryOptions =
        categories?.map((cat) => ({
            value: cat.xcategprodid,
            label: cat.xcategprodintitule,
        })) || [];

    const colorOptions =
        colors?.map((color) => ({
            value: color.xcouleurid,
            label: color.xcouleurintitule,
        })) || [];

    const sizeOptions =
        sizes?.map((size) => ({
            value: size.xtailleid,
            label: size.xtailleintitule,
        })) || [];

    const currencyOptions =
        currencies?.map((currency) => ({
            value: currency.xdeviseid,
            label: `${currency.xdeviseintitule} (${currency.xdevisecodealpha})`,
        })) || [];

    // Handlers
    const handleAddVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            name: "",
            colorId: null,
            sizeId: null,
            images: [],
            videos: [],
            models3d: [],
            backgroundColor: "#ffffff",
            status: 'not_approved',
            catalogPrice: 0,
            promotionPrice: null,
            promotionStartDate: null,
            promotionEndDate: null,
            currencyId: null,
        };
        setVariants([...variants, newVariant]);
    };

    const handleRemoveVariant = (variantId: string) => {
        if (variants.length > 1) {
            setVariants(variants.filter((v) => v.id !== variantId));
        }
    };

    const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: any) => {
        if (field === 'backgroundColor') {
            console.log(`Background color changed for variant ${variantId}: ${value}`);
        }
        setVariants(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
    };

    const handleFileUpload = (variantId: string, type: "images" | "videos" | "models3d", files: FileList) => {
        const fileArray = Array.from(files);
        setVariants(
            variants.map((v) =>
                v.id === variantId
                    ? {
                          ...v,
                          [type]:
                              type === "models3d"
                                  ? fileArray.slice(0, 1) // Only allow one 3D model
                                  : [...v[type], ...fileArray],
                      }
                    : v
            )
        );
    };

    const handleRemoveFile = (variantId: string, type: "images" | "videos" | "models3d", index: number) => {
        setVariants(
            variants.map((v) =>
                v.id === variantId
                    ? {
                          ...v,
                          [type]: v[type].filter((_, i) => i !== index),
                      }
                    : v
            )
        );
    };

    const handleCreateColor = async () => {
        if (!newColor.code || !newColor.name) {
            toast.error(t("admin.createProduct.fillColorCodeAndName"));
            return;
        }

        try {
            await createColorMutation.mutateAsync(newColor);
            toast.success(t("admin.createProduct.colorCreatedSuccessfully"));
            setShowColorForm(false);
            setNewColor({ code: "", name: "", hexColor: "#000000", rgbColor: "0,0,0" });
        } catch (error) {
            console.error("Failed to create color:", error);
            toast.error(t("admin.createProduct.failedToCreateColor"));
        }
    };

    const handleCreateSize = async () => {
        if (!newSize.code || !newSize.name) {
            toast.error(t("admin.createProduct.fillSizeCodeAndName"));
            return;
        }

        try {
            await createSizeMutation.mutateAsync(newSize);
            toast.success(t("admin.createProduct.sizeCreatedSuccessfully"));
            setShowSizeForm(false);
            setNewSize({ code: "", name: "", eur: "", us: "", x: "" });
        } catch (error) {
            console.error("Failed to create size:", error);
            toast.error(t("admin.createProduct.failedToCreateSize"));
        }
    };

    // Helper function to check if variant can be edited
    const canEditVariant = (variant: ProductVariant) => {
        if (isAdmin) {
            // Admin can edit everything except rejected variants
            return variant.status !== 'rejected';
        }
        
        if (isStoreAdmin) {
            // Store admin can only edit pending/not_approved variants
            return variant.status === 'not_approved' || !variant.status;
        }
        
        return false;
    };

    // Helper function to check if product info can be edited
    const canEditProductInfo = () => {
        if (!isEditMode || !productDetails?.product) return true; // Allow editing for new products
        
        const productStatus = productDetails.product.yprodstatut;
        
        if (isAdmin) {
            // Admin can edit everything except rejected products
            return productStatus !== 'rejected';
        }
        
        if (isStoreAdmin) {
            // Store admin can only edit pending products, but can add variants to approved products
            return productStatus === 'not_approved';
        }
        
        return false;
    };

    // Helper function to get variant status display
    const getVariantStatusDisplay = (variant: ProductVariant) => {
        const status = variant.status || 'not_approved';
        const statusConfig = {
            approved: {
                icon: CheckCircle,
                color: "text-green-400",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-500/30",
                label: t("admin.approved")
            },
            rejected: {
                icon: XCircle,
                color: "text-red-400",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-500/30",
                label: t("admin.rejected")
            },
            not_approved: {
                icon: Clock,
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-500/30",
                label: t("admin.pending")
            }
        };
        
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.not_approved;
    };

    const handleSubmit = async () => {
        if (!productName || !shortDescription || !fullDescription) {
            toast.error(t("admin.createProduct.fillRequiredProductFields"));
            return;
        }

        // For edit mode, get designer from existing product
        let designerId: number;
        if (isEditMode && productDetails?.product?.ydesignidfk) {
            designerId = productDetails.product.ydesignidfk;
        } else if (designer) {
            // For non-admin users, use their designer info
            designerId = designer.ydesignid;
        } else {
            // Admin creating new product - this shouldn't happen in normal flow
            // but we'll handle it gracefully
            toast.error(t("admin.createProduct.designerInfoNotFound"));
            return;
        }

        if (!selectedEventId) {
            toast.error(t("admin.createProduct.eventContextRequired"));
            return;
        }

        // Validate variants - only validate editable variants
        for (const variant of variants) {
            const canEdit = canEditVariant(variant);
            if (canEdit && (!variant.name || !variant.colorId || !variant.sizeId)) {
                toast.error(t("admin.createProduct.completeVariantInfo"));
                return;
            }
            
            // Validate background color format
            if (canEdit && variant.backgroundColor) {
                const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;
                if (!hexColorRegex.test(variant.backgroundColor)) {
                    toast.error(`${t("admin.createProduct.invalidBackgroundColor") || "Invalid background color format"}: ${variant.name || `Variant ${variants.indexOf(variant) + 1}`}`);
                    return;
                }
            }
        }

        try {
            if (isEditMode && productId) {
                // Update existing product
                const formattedVariants = variants.map((v) => formatVariantForSubmission(v));
                console.log("Updating product with background colors:", formattedVariants.map(v => ({
                    name: v.name,
                    backgroundColor: v.backgroundColor,
                    ycouleurarriereplan: v.ycouleurarriereplan
                })));
                
                await updateProductMutation.mutateAsync({
                    productId,
                    storeId,
                    designerId: designerId,
                    categoryId,
                    productCode: productCode || undefined,
                    productName,
                    shortDescription,
                    fullDescription,
                    infospotactionId: selectedInfospotactionId || undefined,
                    eventId: selectedEventId || undefined,
                    variants: formattedVariants,
                });
                toast.success(t("admin.createProduct.productUpdatedSuccessfully"));
            } else {
                // Create new product
                const createVariants = variants.map((v) => {
                    const normalizedBgColor = normalizeBackgroundColor(v.backgroundColor);
                    return {
                        name: v.name,
                        code: v.code,
                        colorId: v.colorId!,
                        sizeId: v.sizeId!,
                        images: v.images.filter((img): img is File => img instanceof File),
                        videos: v.videos.filter((vid): vid is File => vid instanceof File),
                        models3d: v.models3d.filter((model): model is File => model instanceof File),
                        backgroundColor: normalizedBgColor,
                        ycouleurarriereplan: normalizedBgColor, // Include database field name
                    };
                });
                
                console.log("Creating variants with background colors:", createVariants.map(v => ({
                    name: v.name,
                    backgroundColor: v.backgroundColor
                })));
                
                await createProductMutation.mutateAsync({
                    storeId,
                    eventId: selectedEventId,
                    designerId: designerId,
                    categoryId,
                    productCode: productCode || undefined,
                    productName,
                    shortDescription,
                    fullDescription,
                    infospotactionId: selectedInfospotactionId || undefined,
                    variants: createVariants,
                });
                toast.success(t("admin.createProduct.productCreatedSuccessfully"));
            }

            onClose();
        } catch (error) {
            console.error("Failed to create product:", error);
            toast.error(isEditMode ? t("admin.createProduct.failedToUpdateProduct") : t("admin.createProduct.failedToCreateProduct"));
        }
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `${r},${g},${b}`;
        }
        return "0,0,0";
    };

    // Helper function to normalize background color
    const normalizeBackgroundColor = (color: string | undefined): string => {
        if (!color) return "#ffffff";
        // Ensure it starts with # and is 7 characters long
        const cleanColor = color.startsWith("#") ? color : `#${color}`;
        return /^#[0-9A-Fa-f]{6}$/.test(cleanColor) ? cleanColor : "#ffffff";
    };

    // Helper function to format variant data for API submission
    const formatVariantForSubmission = (variant: ProductVariant) => {
        const normalizedBgColor = normalizeBackgroundColor(variant.backgroundColor);
        
        // For 3D models, we need to include the background color in the model data
        const formattedModels3d = variant.models3d.map((model) => {
            if (model instanceof File) {
                // For new file uploads, the background color will be handled separately by the API
                // but we still return the file as-is
                return model;
            } else {
                // For existing models, update the background color
                return {
                    ...model,
                    ycouleurarriereplan: normalizedBgColor
                };
            }
        });

        const submissionData = {
            id: variant.id,
            yvarprodid: variant.yvarprodid,
            name: variant.name,
            code: variant.code,
            colorId: variant.colorId!,
            sizeId: variant.sizeId!,
            images: variant.images,
            videos: variant.videos,
            models3d: formattedModels3d,
            backgroundColor: normalizedBgColor, // Always include this for the API
            ycouleurarriereplan: normalizedBgColor, // Include the database field name as well
            isDeleted: variant.isDeleted,
            // Include pricing data
            catalogPrice: variant.catalogPrice,
            promotionPrice: variant.promotionPrice,
            promotionStartDate: variant.promotionStartDate,
            promotionEndDate: variant.promotionEndDate,
            currencyId: variant.currencyId,
        };

        return submissionData;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700/50 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="h-6 w-6 text-morpheus-gold-light" />
                        {isEditMode ? t("admin.editProduct") : t("admin.createNewProduct")}
                    </DialogTitle>
                </DialogHeader>

                {/* Loading and error states */}
                {isEditMode && productDetailsLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-morpheus-gold-light mb-4" />
                        <span className="text-lg text-gray-300">{t("admin.createProduct.loadingProductDetails")}</span>
                    </div>
                ) : isEditMode && productDetailsError ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-6 w-6 text-red-400" />
                            <span className="text-lg text-red-300 font-semibold">{t("admin.createProduct.failedToLoadProductDetails")}</span>
                        </div>
                        <span className="text-gray-400 mb-2">{t("admin.createProduct.tryAgainOrContactSupport")}</span>
                        <Button onClick={onClose} className="bg-gray-700 text-white">
                            {t("common.close")}
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[80vh] pr-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Product Information & Creation Forms */}
                            <div className="space-y-6">
                                {/* Product Information */}
                                <Card className="bg-gray-800/50 border-gray-700/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-morpheus-gold-light" />
                                            {t("admin.productInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {!canEditProductInfo() && isEditMode && (
                                            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                                                <div className="flex items-center gap-2 text-yellow-300 text-sm">
                                                    <Info className="h-4 w-4" />
                                                    {t("admin.createProduct.productInfoReadOnly")}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="category" className="text-gray-300">
                                                    {t("admin.category")}
                                                </Label>
                                                <SuperSelect
                                                    value={categoryId}
                                                    onValueChange={(value) => setCategoryId(value as number)}
                                                    options={categoryOptions}
                                                    placeholder={t("admin.selectProductCategory")}
                                                    disabled={categoriesLoading || !canEditProductInfo()}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="productCode" className="text-gray-300">
                                                    {t("admin.productCode")}
                                                </Label>
                                                <Input
                                                    id="productCode"
                                                    value={productCode}
                                                    onChange={(e) => setProductCode(e.target.value)}
                                                    placeholder={t("admin.createProduct.autoGeneratedIfEmpty")}
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    disabled={!canEditProductInfo()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="productName" className="text-gray-300">
                                                {t("admin.productName")} <span className="text-red-400">*</span>
                                            </Label>
                                            <Input
                                                id="productName"
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                placeholder={t("admin.createProduct.enterProductName")}
                                                className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="shortDescription"
                                                className="text-gray-300 flex items-center gap-1"
                                            >
                                                {t("admin.createProduct.shortDescription")} <span className="text-red-400">*</span>
                                                <Info className="h-3 w-3 text-gray-500" />
                                            </Label>
                                            <Input
                                                id="shortDescription"
                                                value={shortDescription}
                                                onChange={(e) => setShortDescription(e.target.value)}
                                                placeholder={t("admin.createProduct.briefDescriptionTooltips")}
                                                className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="fullDescription" className="text-gray-300">
                                                {t("admin.createProduct.fullDescription")} <span className="text-red-400">*</span>
                                            </Label>
                                            <Textarea
                                                id="fullDescription"
                                                value={fullDescription}
                                                onChange={(e) => setFullDescription(e.target.value)}
                                                placeholder={t("admin.createProduct.detailedProductDescription")}
                                                className="mt-1 bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>
                                        
                                        {/* Infospotaction Selection (Admin Only) */}
                                        {isAdmin && (
                                            <div>
                                                <Label className="text-gray-300">{t("admin.createProduct.productPlacement")}</Label>
                                                <div className="text-gray-400 text-xs mb-1">
                                                    {t("admin.createProduct.chooseProductPlacement")}
                                                </div>
                                                <SuperSelect
                                                    value={selectedInfospotactionId}
                                                    onValueChange={(value) => setSelectedInfospotactionId(value as number)}
                                                    options={infospotactions?.map(action => ({
                                                        value: action.yinfospotactionsid,
                                                        label: `${action.yinfospotactionstitle} - ${action.yinfospotactionsdescription}`
                                                    })) || []}
                                                    placeholder={t("admin.createProduct.selectProductPlacementOptional")}
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Color Creation Form */}
                                {showColorForm && (
                                    <Card className="bg-blue-900/20 border-blue-700/50">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                                <Palette className="h-5 w-5 text-blue-400" />
                                                {t("admin.createProduct.createNewColor")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.colorCode")}</Label>
                                                    <Input
                                                        value={newColor.code}
                                                        onChange={(e) =>
                                                            setNewColor({ ...newColor, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.colorCodePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.colorName")}</Label>
                                                    <Input
                                                        value={newColor.name}
                                                        onChange={(e) =>
                                                            setNewColor({ ...newColor, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.colorNamePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">{t("admin.createProduct.hexColor")}</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        type="color"
                                                        value={newColor.hexColor}
                                                        onChange={(e) => {
                                                            const hex = e.target.value;
                                                            setNewColor({
                                                                ...newColor,
                                                                hexColor: hex,
                                                                rgbColor: hexToRgb(hex),
                                                            });
                                                        }}
                                                        className="w-16 h-10 bg-gray-700/50 border-gray-600"
                                                    />
                                                    <Input
                                                        value={newColor.hexColor}
                                                        onChange={(e) => {
                                                            const hex = e.target.value;
                                                            setNewColor({
                                                                ...newColor,
                                                                hexColor: hex,
                                                                rgbColor: hexToRgb(hex),
                                                            });
                                                        }}
                                                        placeholder="#000000"
                                                        className="flex-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleCreateColor}
                                                    disabled={createColorMutation.isPending}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    {createColorMutation.isPending ? t("admin.createProduct.creating") : t("admin.createProduct.createColor")}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowColorForm(false)}
                                                    variant="outline"
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Size Creation Form */}
                                {showSizeForm && (
                                    <Card className="bg-green-900/20 border-green-700/50">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                                <Ruler className="h-5 w-5 text-green-400" />
                                                {t("admin.createProduct.createNewSize")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.sizeCode")}</Label>
                                                    <Input
                                                        value={newSize.code}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.sizeCodePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.sizeName")}</Label>
                                                    <Input
                                                        value={newSize.name}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.sizeNamePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.eurSize")}</Label>
                                                    <Input
                                                        value={newSize.eur}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, eur: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.eurSizePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.usSize")}</Label>
                                                    <Input
                                                        value={newSize.us}
                                                        onChange={(e) => setNewSize({ ...newSize, us: e.target.value })}
                                                        placeholder={t("admin.createProduct.usSizePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-300">{t("admin.createProduct.xSize")}</Label>
                                                    <Input
                                                        value={newSize.x}
                                                        onChange={(e) => setNewSize({ ...newSize, x: e.target.value })}
                                                        placeholder={t("admin.createProduct.xSizePlaceholder")}
                                                        className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleCreateSize}
                                                    disabled={createSizeMutation.isPending}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    {createSizeMutation.isPending ? t("admin.createProduct.creating") : t("admin.createProduct.createSize")}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowSizeForm(false)}
                                                    variant="outline"
                                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column - Product Variants */}
                            <div className="space-y-6">
                                <Card className="bg-gray-800/50 border-gray-700/50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                                <Box className="h-5 w-5 text-morpheus-gold-light" />
                                                {t("admin.createProduct.productVariants")}
                                            </CardTitle>
                                            <Button
                                                onClick={handleAddVariant}
                                                size="sm"
                                                className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-white"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                {t("admin.createProduct.addVariant")}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {variants.map((variant, index) => {
                                            const canEdit = canEditVariant(variant);
                                            const statusDisplay = getVariantStatusDisplay(variant);
                                            const StatusIcon = statusDisplay.icon;
                                            
                                            return (
                                            <Card key={variant.id} className={`bg-gray-700/30 border-gray-600/50 ${!canEdit ? 'opacity-75' : ''}`}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <CardTitle className="text-base text-white">
                                                                {t("admin.createProduct.variant")} {index + 1}
                                                            </CardTitle>
                                                            {variant.yvarprodid && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`${statusDisplay.bgColor} ${statusDisplay.color} ${statusDisplay.borderColor} flex items-center gap-1 text-xs`}
                                                                >
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {statusDisplay.label}
                                                                </Badge>
                                                            )}
                                                            {!canEdit && variant.yvarprodid && (
                                                                <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                                                                    {t("admin.createProduct.readOnly")}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {variants.length > 1 && canEdit && (
                                                            <Button
                                                                onClick={() => handleRemoveVariant(variant.id)}
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-600 text-red-400 hover:bg-red-900/50"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <Label className="text-gray-300">
                                                                {t("admin.createProduct.variantName")} <span className="text-red-400">*</span>
                                                            </Label>
                                                            <Input
                                                                value={variant.name}
                                                                onChange={(e) =>
                                                                    handleVariantChange(
                                                                        variant.id,
                                                                        "name",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder={t("admin.createProduct.enterVariantName")}
                                                                className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                disabled={!canEdit}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-gray-300">
                                                                {t("admin.createProduct.variantCode")}{" "}
                                                                <span className="text-gray-500 text-sm">
                                                                    ({t("common.optional")})
                                                                </span>
                                                            </Label>
                                                            <Input
                                                                value={variant.code || ""}
                                                                onChange={(e) =>
                                                                    handleVariantChange(
                                                                        variant.id,
                                                                        "code",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder={t("admin.createProduct.autoGeneratedIfEmpty")}
                                                                className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                disabled={!canEdit}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Color Selection */}
                                                        <div>
                                                            <Label className="text-gray-300 flex items-center gap-1">
                                                                <Palette className="h-3 w-3" />
                                                                {t("admin.color")} <span className="text-red-400">*</span>
                                                            </Label>
                                                            <div className="flex gap-2 mt-1">
                                                                <SuperSelect
                                                                    value={variant.colorId}
                                                                    onValueChange={(value) =>
                                                                        handleVariantChange(
                                                                            variant.id,
                                                                            "colorId",
                                                                            value
                                                                        )
                                                                    }
                                                                    options={colorOptions}
                                                                    placeholder={t("admin.createProduct.selectColor")}
                                                                    disabled={colorsLoading || !canEdit}
                                                                    className="flex-1"
                                                                />
                                                                {canEdit && (
                                                                    <Button
                                                                        onClick={() => setShowColorForm(!showColorForm)}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Size Selection */}
                                                        <div>
                                                            <Label className="text-gray-300 flex items-center gap-1">
                                                                <Ruler className="h-3 w-3" />
                                                                {t("admin.createProduct.size")} <span className="text-red-400">*</span>
                                                            </Label>
                                                            <div className="flex gap-2 mt-1">
                                                                <SuperSelect
                                                                    value={variant.sizeId}
                                                                    onValueChange={(value) =>
                                                                        handleVariantChange(variant.id, "sizeId", value)
                                                                    }
                                                                    options={sizeOptions}
                                                                    placeholder={t("admin.createProduct.selectSize")}
                                                                    disabled={sizesLoading || !canEdit}
                                                                    className="flex-1"
                                                                />
                                                                {canEdit && (
                                                                    <Button
                                                                        onClick={() => setShowSizeForm(!showSizeForm)}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Pricing Section (Admin Only) */}
                                                    {isAdmin && canEdit && (
                                                        <div className="space-y-4 border-t border-gray-600/30 pt-4">
                                                            <Label className="text-gray-300 flex items-center gap-2">
                                                                <svg className="h-4 w-4 text-morpheus-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                </svg>
                                                                {t("admin.createProduct.pricingPromotion")}
                                                            </Label>
                                                            
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {/* Currency Selection */}
                                                                <div>
                                                                    <Label className="text-gray-300 text-sm">{t("admin.createProduct.currency")}</Label>
                                                                    <SuperSelect
                                                                        value={variant.currencyId}
                                                                        onValueChange={(value) =>
                                                                            handleVariantChange(variant.id, "currencyId", value)
                                                                        }
                                                                        options={currencyOptions}
                                                                        placeholder={t("admin.createProduct.selectCurrency")}
                                                                        disabled={currenciesLoading}
                                                                        className="mt-1"
                                                                    />
                                                                </div>

                                                                {/* Catalog Price */}
                                                                <div>
                                                                    <Label className="text-gray-300 text-sm">{t("admin.createProduct.catalogPrice")}</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={variant.catalogPrice || ""}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                variant.id,
                                                                                "catalogPrice",
                                                                                parseFloat(e.target.value) || 0
                                                                            )
                                                                        }
                                                                        placeholder="0.00"
                                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                    />
                                                                </div>

                                                                {/* Promotion Price */}
                                                                <div>
                                                                    <Label className="text-gray-300 text-sm">{t("admin.createProduct.promotionPriceOptional")}</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={variant.promotionPrice || ""}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                variant.id,
                                                                                "promotionPrice",
                                                                                e.target.value ? parseFloat(e.target.value) : null
                                                                            )
                                                                        }
                                                                        placeholder="0.00"
                                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                    />
                                                                </div>

                                                                {/* Promotion Start Date */}
                                                                <div>
                                                                    <Label className="text-gray-300 text-sm">{t("admin.createProduct.promotionStartDate")}</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={variant.promotionStartDate || ""}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                variant.id,
                                                                                "promotionStartDate",
                                                                                e.target.value || null
                                                                            )
                                                                        }
                                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                    />
                                                                </div>

                                                                {/* Promotion End Date */}
                                                                <div className="sm:col-span-2">
                                                                    <Label className="text-gray-300 text-sm">{t("admin.createProduct.promotionEndDate")}</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={variant.promotionEndDate || ""}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                variant.id,
                                                                                "promotionEndDate",
                                                                                e.target.value || null
                                                                            )
                                                                        }
                                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Media Upload */}
                                                    {canEdit && (
                                                        <div className="space-y-3">
                                                            <Label className="text-gray-300">{t("admin.createProduct.mediaFiles")}</Label>

                                                        {/* Images */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Image className="h-4 w-4 text-blue-400" />
                                                                <span className="text-sm text-gray-300">{t("admin.createProduct.images")}</span>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    onChange={(e) =>
                                                                        e.target.files &&
                                                                        handleFileUpload(
                                                                            variant.id,
                                                                            "images",
                                                                            e.target.files
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                    id={`images-${variant.id}`}
                                                                />
                                                                <Button
                                                                    onClick={() =>
                                                                        document
                                                                            .getElementById(`images-${variant.id}`)
                                                                            ?.click()
                                                                    }
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
                                                                >
                                                                    <Upload className="h-3 w-3 mr-1" />
                                                                    {t("admin.createProduct.upload")}
                                                                </Button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {variant.images.map((file, fileIndex) => (
                                                                    <Badge
                                                                        key={fileIndex}
                                                                        variant="secondary"
                                                                        className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                                    >
                                                                        {file instanceof File
                                                                            ? file.name
                                                                            : file.ymediaintitule}
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleRemoveFile(
                                                                                    variant.id,
                                                                                    "images",
                                                                                    fileIndex
                                                                                )
                                                                            }
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                                                                        >
                                                                            <Trash2 className="h-2 w-2" />
                                                                        </Button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Videos */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Video className="h-4 w-4 text-green-400" />
                                                                <span className="text-sm text-gray-300">{t("admin.createProduct.videos")}</span>
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    accept="video/*"
                                                                    onChange={(e) =>
                                                                        e.target.files &&
                                                                        handleFileUpload(
                                                                            variant.id,
                                                                            "videos",
                                                                            e.target.files
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                    id={`videos-${variant.id}`}
                                                                />
                                                                <Button
                                                                    onClick={() =>
                                                                        document
                                                                            .getElementById(`videos-${variant.id}`)
                                                                            ?.click()
                                                                    }
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-green-600 text-green-400 hover:bg-green-900/50"
                                                                >
                                                                    <Upload className="h-3 w-3 mr-1" />
                                                                    {t("admin.createProduct.upload")}
                                                                </Button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {variant.videos.map((file, fileIndex) => (
                                                                    <Badge
                                                                        key={fileIndex}
                                                                        variant="secondary"
                                                                        className="bg-green-500/20 text-green-300 border-green-500/30"
                                                                    >
                                                                        {file instanceof File
                                                                            ? file.name
                                                                            : file.ymediaintitule}
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleRemoveFile(
                                                                                    variant.id,
                                                                                    "videos",
                                                                                    fileIndex
                                                                                )
                                                                            }
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                                                                        >
                                                                            <Trash2 className="h-2 w-2" />
                                                                        </Button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* 3D Models */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Box className="h-4 w-4 text-purple-400" />
                                                                <span className="text-sm text-gray-300">{t("admin.createProduct.models3d")}</span>
                                                                <input
                                                                    type="file"
                                                                    // Only allow one file for 3D models
                                                                    multiple={false}
                                                                    accept=".glb,.gltf,.obj,.fbx"
                                                                    onChange={(e) =>
                                                                        e.target.files &&
                                                                        handleFileUpload(
                                                                            variant.id,
                                                                            "models3d",
                                                                            e.target.files
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                    id={`models3d-${variant.id}`}
                                                                />
                                                                <Button
                                                                    onClick={() =>
                                                                        document
                                                                            .getElementById(`models3d-${variant.id}`)
                                                                            ?.click()
                                                                    }
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-purple-600 text-purple-400 hover:bg-purple-900/50"
                                                                >
                                                                    <Upload className="h-3 w-3 mr-1" />
                                                                    {t("admin.createProduct.upload")}
                                                                </Button>
                                                            </div>
                                                            
                                                            {/* Background Color Input */}
                                                            <div className="mb-3">
                                                                <Label className="text-gray-300 text-sm flex items-center gap-1">
                                                                    <Palette className="h-3 w-3" />
                                                                    {t("admin.createProduct.3dBackgroundColor") || "3D Model Background Color"}
                                                                </Label>
                                                                <div className="flex gap-2 mt-1">
                                                                    <input
                                                                        type="color"
                                                                        value={variant.backgroundColor || "#ffffff"}
                                                                        onChange={(e) =>
                                                                            handleVariantChange(
                                                                                variant.id,
                                                                                "backgroundColor",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className="w-12 h-8 bg-gray-700/50 border border-gray-600 rounded cursor-pointer"
                                                                        title={t("admin.createProduct.selectBackgroundColor") || "Select background color for 3D model"}
                                                                    />
                                                                    <Input
                                                                        value={variant.backgroundColor || "#ffffff"}
                                                                        onChange={(e) => {
                                                                            // Validate hex color format
                                                                            const value = e.target.value;
                                                                            if (value === "" || /^#([0-9A-Fa-f]{0,6})$/.test(value)) {
                                                                                handleVariantChange(
                                                                                    variant.id,
                                                                                    "backgroundColor",
                                                                                    value
                                                                                );
                                                                            }
                                                                        }}
                                                                        placeholder="#ffffff"
                                                                        className="flex-1 bg-gray-600/50 border-gray-500 text-white text-sm"
                                                                        maxLength={7}
                                                                    />
                                                                    {/* Quick color presets */}
                                                                    <div className="flex gap-1">
                                                                        {["#ffffff", "#f0f0f0", "#e0e0e0", "#d0d0d0", "#000000"].map((presetColor) => (
                                                                            <button
                                                                                key={presetColor}
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleVariantChange(
                                                                                        variant.id,
                                                                                        "backgroundColor",
                                                                                        presetColor
                                                                                    )
                                                                                }
                                                                                className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                                                                                    variant.backgroundColor === presetColor
                                                                                        ? "border-morpheus-gold-light"
                                                                                        : "border-gray-500"
                                                                                }`}
                                                                                style={{ backgroundColor: presetColor }}
                                                                                title={`Set background to ${presetColor}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    {t("admin.createProduct.backgroundColorDescription") || "Background color for the 3D model viewer"}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap gap-2">
                                                                {variant.models3d.map((file, fileIndex) => (
                                                                    <Badge
                                                                        key={fileIndex}
                                                                        variant="secondary"
                                                                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                                    >
                                                                        {file instanceof File
                                                                            ? file.name
                                                                            : `3D Model ${fileIndex + 1}`}
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleRemoveFile(
                                                                                    variant.id,
                                                                                    "models3d",
                                                                                    fileIndex
                                                                                )
                                                                            }
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-4 w-4 p-0 ml-1 hover:bg-red-500/20"
                                                                        >
                                                                            <Trash2 className="h-2 w-2" />
                                                                        </Button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Read-only media display for non-editable variants */}
                                                    {!canEdit && variant.yvarprodid && (
                                                        <div className="space-y-3">
                                                            <Label className="text-gray-300">{t("admin.createProduct.mediaFilesReadOnly")}</Label>
                                                            
                                                            {/* Display existing images */}
                                                            {variant.images.length > 0 && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Image className="h-4 w-4 text-blue-400" />
                                                                        <span className="text-sm text-gray-300">{t("admin.createProduct.images")}</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {variant.images.map((file, fileIndex) => (
                                                                            <Badge
                                                                                key={fileIndex}
                                                                                variant="secondary"
                                                                                className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                                            >
                                                                                {file instanceof File
                                                                                    ? file.name
                                                                                    : file.ymediaintitule}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Display existing videos */}
                                                            {variant.videos.length > 0 && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Video className="h-4 w-4 text-green-400" />
                                                                        <span className="text-sm text-gray-300">{t("admin.createProduct.videos")}</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {variant.videos.map((file, fileIndex) => (
                                                                            <Badge
                                                                                key={fileIndex}
                                                                                variant="secondary"
                                                                                className="bg-green-500/20 text-green-300 border-green-500/30"
                                                                            >
                                                                                {file instanceof File
                                                                                    ? file.name
                                                                                    : file.ymediaintitule}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Display existing 3D models */}
                                                            {variant.models3d.length > 0 && (
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Box className="h-4 w-4 text-purple-400" />
                                                                        <span className="text-sm text-gray-300">{t("admin.createProduct.models3d")}</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {variant.models3d.map((file, fileIndex) => (
                                                                            <Badge
                                                                                key={fileIndex}
                                                                                variant="secondary"
                                                                                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                                            >
                                                                                {file instanceof File
                                                                                    ? file.name
                                                                                    : `3D Model ${fileIndex + 1}`}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )})}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </ScrollArea>
                )}

                {/* Dialog Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        disabled={(isEditMode && productDetailsLoading) || (isEditMode && productDetailsError)}
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            createProductMutation.isPending ||
                            updateProductMutation.isPending ||
                            designerLoading ||
                            (isEditMode && productDetailsLoading) ||
                            (isEditMode && productDetailsError)
                        }
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                    >
                        {createProductMutation.isPending || updateProductMutation.isPending
                            ? isEditMode
                                ? t("admin.createProduct.updatingProduct")
                                : t("admin.createProduct.creatingProduct")
                            : isEditMode
                            ? t("admin.createProduct.updateProduct")
                            : t("admin.createProduct.createProduct")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
