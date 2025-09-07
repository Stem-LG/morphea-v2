"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SuperSelect } from "@/components/super-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
import { useTypeBijoux } from "../_hooks/typebijoux/use-typebijoux";
import { useCreateTypeBijoux } from "../_hooks/typebijoux/use-create-typebijoux";
import { useMateriaux } from "../_hooks/materiaux/use-materiaux";
import { useCreateMateriaux } from "../_hooks/materiaux/use-create-materiaux";
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
    // Jewelry fields - used when product is jewelry
    typebijouxId: string | null; // Type of jewelry ID (replaces yvarprodtypebijoux)
    materiauxId: string | null; // Materials ID (replaces yvarprodmatrieaux)
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
    const [isJewelryProduct, setIsJewelryProduct] = useState(false);
    const [variants, setVariants] = useState<ProductVariant[]>([
        {
            id: "1",
            name: "",
            colorId: null,
            sizeId: null,
            typebijouxId: null,
            materiauxId: null,
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

    // Type bijoux creation state
    const [showTypebijouxForm, setShowTypebijouxForm] = useState(false);
    const [newTypebijoux, setNewTypebijoux] = useState({
        code: "",
        name: "",
    });

    // Materiaux creation state
    const [showMateriauxForm, setShowMateriauxForm] = useState(false);
    const [newMateriaux, setNewMateriaux] = useState({
        code: "",
        name: "",
    });

    // Progress bar state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Delete confirmation dialog state
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        variantId: string | null;
        variantName: string;
    }>({
        isOpen: false,
        variantId: null,
        variantName: "",
    });

    // Exit confirmation dialog state
    const [exitConfirmation, setExitConfirmation] = useState(false);

    // Determine if we're in edit mode
    const isEditMode = !!productId;

    // Hooks
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: colors } = useColors();
    const { data: sizes, isLoading: sizesLoading } = useSizes();
    const { data: typebijoux, isLoading: typebijouxLoading } = useTypeBijoux();
    const { data: materiaux, isLoading: materiauxLoading } = useMateriaux();
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
    const createTypebijouxMutation = useCreateTypeBijoux();
    const createMateriauxMutation = useCreateMateriaux();
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    // These mandatory flags are no longer determined by category since columns were removed
    const isColorMandatory = false;
    const isSizeMandatory = false;

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
            setIsJewelryProduct(Boolean(product.yprodestbijoux));
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
                    colorId: variant.xcouleuridfk?.xcouleurid || null,
                    sizeId: variant.xtailleidfk?.xtailleid || null,
                    typebijouxId: variant.xtypebijouxidfk || null,
                    materiauxId: variant.xmatrieauxidfk || null,
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
                            typebijouxId: null,
                            materiauxId: null,
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
            setIsJewelryProduct(false);
            setVariants([
                {
                    id: "1",
                    name: "",
                    colorId: null,
                    sizeId: null,
                    typebijouxId: null,
                    materiauxId: null,
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

    const typebijouxOptions =
        typebijoux?.map((type) => ({
            value: type.xtypebijouxid,
            label: type.xtypebijouxintitule,
        })) || [];

    const materiauxOptions =
        materiaux?.map((material) => ({
            value: material.xmateriauxid,
            label: material.xmateriauxintitule,
        })) || [];

    // Handlers
    const handleAddVariant = () => {
        const newVariant: ProductVariant = {
            id: Date.now().toString(),
            name: "",
            colorId: null,
            sizeId: null,
            typebijouxId: null,
            materiauxId: null,
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
            const variant = variants.find(v => v.id === variantId);
            setDeleteConfirmation({
                isOpen: true,
                variantId,
                variantName: variant?.name || `Variant ${variants.findIndex(v => v.id === variantId) + 1}`,
            });
        }
    };

    const confirmDeleteVariant = () => {
        if (deleteConfirmation.variantId) {
            setVariants(variants.filter((v) => v.id !== deleteConfirmation.variantId));
        }
        setDeleteConfirmation({
            isOpen: false,
            variantId: null,
            variantName: "",
        });
    };

    const cancelDeleteVariant = () => {
        setDeleteConfirmation({
            isOpen: false,
            variantId: null,
            variantName: "",
        });
    };

    // Function to detect if there are unsaved changes
    const hasUnsavedChanges = () => {
        // For new products, check if any fields have been filled
        if (!isEditMode) {
            return (
                productCode.trim() !== "" ||
                productName.trim() !== "" ||
                shortDescription.trim() !== "" ||
                fullDescription.trim() !== "" ||
                categoryId !== null ||
                selectedInfospotactionId !== null ||
                isJewelryProduct ||
                variants.some(variant => 
                    variant.name.trim() !== "" ||
                    variant.code?.trim() !== "" ||
                    variant.colorId !== null ||
                    variant.sizeId !== null ||
                    variant.typebijouxId !== null ||
                    variant.materiauxId !== null ||
                    variant.images.length > 0 ||
                    variant.videos.length > 0 ||
                    variant.models3d.length > 0 ||
                    (variant.catalogPrice !== undefined && variant.catalogPrice > 0)
                )
            );
        }

        // For edit mode, we always consider there might be changes since we can't easily track initial state
        return true;
    };

    // Handle close dialog with confirmation
    const handleCloseDialog = () => {
        if (hasUnsavedChanges() && !isSubmitting) {
            setExitConfirmation(true);
        } else {
            onClose();
        }
    };

    // Confirm exit without saving
    const confirmExit = () => {
        setExitConfirmation(false);
        onClose();
    };

    // Cancel exit confirmation
    const cancelExit = () => {
        setExitConfirmation(false);
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

    const handleCreateTypebijoux = async () => {
        if (!newTypebijoux.code || !newTypebijoux.name) {
            toast.error(t("admin.createProduct.fillTypebijouxCodeAndName") || "Please fill in type bijoux code and name");
            return;
        }

        try {
            await createTypebijouxMutation.mutateAsync(newTypebijoux);
            toast.success(t("admin.createProduct.typebijouxCreatedSuccessfully") || "Type bijoux created successfully");
            setShowTypebijouxForm(false);
            setNewTypebijoux({ code: "", name: "" });
        } catch (error) {
            console.error("Failed to create type bijoux:", error);
            toast.error(t("admin.createProduct.failedToCreateTypebijoux") || "Failed to create type bijoux");
        }
    };

    const handleCreateMateriaux = async () => {
        if (!newMateriaux.code || !newMateriaux.name) {
            toast.error(t("admin.createProduct.fillMateriauxCodeAndName") || "Please fill in materiaux code and name");
            return;
        }

        try {
            await createMateriauxMutation.mutateAsync(newMateriaux);
            toast.success(t("admin.createProduct.materiauxCreatedSuccessfully") || "Materiaux created successfully");
            setShowMateriauxForm(false);
            setNewMateriaux({ code: "", name: "" });
        } catch (error) {
            console.error("Failed to create materiaux:", error);
            toast.error(t("admin.createProduct.failedToCreateMateriaux") || "Failed to create materiaux");
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
            // Store admin can edit pending products and approved products (to modify details or add variants)
            return productStatus === 'not_approved' || productStatus === 'approved';
        }

        return false;
    };

    // Helper function to get variant status display
    const getVariantStatusDisplay = (variant: ProductVariant) => {
        const status = variant.status || 'not_approved';
        const statusConfig = {
            approved: {
                icon: CheckCircle,
                color: "text-green-600",
                bgColor: "bg-green-100",
                borderColor: "border-green-200",
                label: t("admin.approved")
            },
            rejected: {
                icon: XCircle,
                color: "text-red-600",
                bgColor: "bg-red-100",
                borderColor: "border-red-200",
                label: t("admin.rejected")
            },
            not_approved: {
                icon: Clock,
                color: "text-yellow-600",
                bgColor: "bg-yellow-100",
                borderColor: "border-yellow-200",
                label: t("admin.pending")
            }
        };

        return statusConfig[status as keyof typeof statusConfig] || statusConfig.not_approved;
    };

    // Start fake progress bar
    const startProgressBar = () => {
        setIsSubmitting(true);
        setProgress(0);

        // Progress from 0 to 90% over 10 seconds
        const totalTime = 10000; // 10 seconds
        const targetProgress = 90;
        const interval = 100; // Update every 100ms
        const increment = (targetProgress / totalTime) * interval;

        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + increment;
                if (newProgress >= targetProgress) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }
                    return targetProgress;
                }
                return newProgress;
            });
        }, interval);
    };

    // Complete progress bar
    const completeProgressBar = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        setProgress(100);

        // Reset after a short delay
        setTimeout(() => {
            setIsSubmitting(false);
            setProgress(0);
        }, 500);
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

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
        console.log("Validating variants. Is jewelry product:", isJewelryProduct);
        for (const variant of variants) {
            const canEdit = canEditVariant(variant);
            console.log("Variant validation:", {
                name: variant.name,
                canEdit,
                isJewelryProduct,
                typebijouxId: variant.typebijouxId,
                materiauxId: variant.materiauxId,
                colorId: variant.colorId,
                sizeId: variant.sizeId
            });
            if (canEdit) {
                // Check basic required fields
                if (!variant.name) {
                    toast.error(t("admin.createProduct.completeVariantInfo"));
                    return;
                }
                
                if (isJewelryProduct) {
                    // For jewelry products, validate jewelry fields
                    if (!variant.typebijouxId) {
                        toast.error(t("admin.createProduct.jewelryTypeRequired") || "Jewelry type is required for jewelry items");
                        return;
                    }
                    
                    if (!variant.materiauxId) {
                        toast.error(t("admin.createProduct.materialsRequired") || "Materials are required for jewelry items");
                        return;
                    }
                } else {
                    // For regular products, color and size are required
                    if (!variant.colorId) {
                        toast.error(t("admin.createProduct.colorRequired") || "Color is required for regular products");
                        return;
                    }
                    
                    if (!variant.sizeId) {
                        toast.error(t("admin.createProduct.sizeRequired") || "Size is required for regular products");
                        return;
                    }
                }
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

        // Start the fake progress bar
        startProgressBar();

        try {
            if (isEditMode && productId) {
                // Update existing product
                const formattedVariants = variants.map((v) => {
                    const normalizedBgColor = normalizeBackgroundColor(v.backgroundColor);
                    return {
                        id: v.id,
                        yvarprodid: v.yvarprodid,
                        name: v.name,
                        code: v.code,
                        colorId: isJewelryProduct ? null : (v.colorId || null),
                        sizeId: isJewelryProduct ? null : (v.sizeId || null),
                        // Include jewelry fields using correct property names
                        typebijouxId: isJewelryProduct ? (v.typebijouxId || null) : null,
                        materiauxId: isJewelryProduct ? (v.materiauxId || null) : null,
                        images: v.images.filter((img): img is File => img instanceof File),
                        videos: v.videos.filter((vid): vid is File => vid instanceof File),
                        models3d: v.models3d.filter((model): model is File => model instanceof File),
                        backgroundColor: normalizedBgColor,
                        ycouleurarriereplan: normalizedBgColor,
                    };
                });
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
                    isJewelryProduct,
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
                        colorId: isJewelryProduct ? null : (v.colorId || null),
                        sizeId: isJewelryProduct ? null : (v.sizeId || null),
                        // Include jewelry fields using correct property names
                        typebijouxId: isJewelryProduct ? (v.typebijouxId || null) : null,
                        materiauxId: isJewelryProduct ? (v.materiauxId || null) : null,
                        images: v.images.filter((img): img is File => img instanceof File),
                        videos: v.videos.filter((vid): vid is File => vid instanceof File),
                        models3d: v.models3d.filter((model): model is File => model instanceof File),
                        backgroundColor: normalizedBgColor,
                        ycouleurarriereplan: normalizedBgColor, // Include database field name
                    };
                });
                
                console.log("Creating variants with all data:", createVariants.map(v => ({
                    name: v.name,
                    colorId: v.colorId,
                    sizeId: v.sizeId,
                    typebijouxId: v.typebijouxId,
                    materiauxId: v.materiauxId,
                    backgroundColor: v.backgroundColor
                })));
                console.log("Is jewelry product:", isJewelryProduct);
                
                await createProductMutation.mutateAsync({
                    storeId,
                    eventId: selectedEventId,
                    designerId: designerId,
                    categoryId,
                    productCode: productCode || undefined,
                    productName,
                    shortDescription,
                    fullDescription,
                    isJewelryProduct,
                    infospotactionId: selectedInfospotactionId || undefined,
                    variants: createVariants,
                });
                toast.success(t("admin.createProduct.productCreatedSuccessfully"));
            }

            // Complete the progress bar
            completeProgressBar();

            // Close dialog after progress completes
            setTimeout(() => {
                onClose();
            }, 600);
        } catch (error) {
            console.error("Failed to create product:", error);
            
            // Check for specific error types
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            if (errorMessage.startsWith('DUPLICATE_PRODUCT_CODE:')) {
                const duplicateCode = errorMessage.split(':')[1];
                toast.error(t("admin.createProduct.duplicateProductCode") || `Product code '${duplicateCode}' already exists. Please use a different code.`);
            } else {
                toast.error(isEditMode ? t("admin.createProduct.failedToUpdateProduct") : t("admin.createProduct.failedToCreateProduct"));
            }

            // Reset progress on error
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
            setIsSubmitting(false);
            setProgress(0);
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
            // Include jewelry fields as foreign keys
            xtypebijouxidfk: variant.typebijouxId,
            xmatrieauxidfk: variant.materiauxId,
            images: variant.images,
            videos: variant.videos,
            models3d: formattedModels3d,
            backgroundColor: normalizedBgColor, // Always include this for the API
            ycouleurarriereplan: normalizedBgColor, // Include the database field name as well
            isDeleted: variant.isDeleted,
            // Include pricing data
            catalogPrice: variant.catalogPrice,
            promotionPrice: variant.promotionPrice,
            promotionStartDate: variant.promotionEndDate,
            promotionEndDate: variant.promotionEndDate,
            currencyId: variant.currencyId,
        };

        return submissionData;
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-7xl max-h-[95vh] bg-white border-gray-200 text-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        {isEditMode ? t("admin.editProduct") : t("admin.createNewProduct")}
                    </DialogTitle>
                </DialogHeader>

                {/* Loading and error states */}
                {isEditMode && productDetailsLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                        <span className="text-lg text-gray-600">{t("admin.createProduct.loadingProductDetails")}</span>
                    </div>
                ) : isEditMode && productDetailsError ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-6 w-6 text-red-600" />
                            <span className="text-lg text-red-700 font-semibold">{t("admin.createProduct.failedToLoadProductDetails")}</span>
                        </div>
                        <span className="text-gray-500 mb-2">{t("admin.createProduct.tryAgainOrContactSupport")}</span>
                        <Button onClick={handleCloseDialog} className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                            {t("common.close")}
                        </Button>
                    </div>
                ) : (
                    <div 
                        className="max-h-[78vh] overflow-y-auto pr-4 custom-scrollbar"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Product Information & Creation Forms */}
                            <div className="space-y-6">
                                {/* Product Information */}
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            {t("admin.productInformation")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {!canEditProductInfo() && isEditMode && (
                                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center gap-2 text-yellow-800 text-sm">
                                                    <Info className="h-4 w-4" />
                                                    {t("admin.createProduct.productInfoReadOnly")}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="category" className="text-gray-700">
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
                                                <Label htmlFor="productCode" className="text-gray-700">
                                                    {t("admin.productCode")}
                                                </Label>
                                                <Input
                                                    id="productCode"
                                                    value={productCode}
                                                    onChange={(e) => setProductCode(e.target.value)}
                                                    placeholder={t("admin.createProduct.autoGeneratedIfEmpty")}
                                                    className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    disabled={!canEditProductInfo()}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="productName" className="text-gray-700">
                                                {t("admin.productName")} <span className="text-red-600">*</span>
                                            </Label>
                                            <Input
                                                id="productName"
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                placeholder={t("admin.createProduct.enterProductName")}
                                                className="mt-1 bg-white border-gray-300 text-gray-900"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor="shortDescription"
                                                className="text-gray-700 flex items-center gap-1"
                                            >
                                                {t("admin.createProduct.shortDescription")} <span className="text-red-600">*</span>
                                                <Info className="h-3 w-3 text-gray-500" />
                                            </Label>
                                            <Input
                                                id="shortDescription"
                                                value={shortDescription}
                                                onChange={(e) => setShortDescription(e.target.value)}
                                                placeholder={t("admin.createProduct.briefDescriptionTooltips")}
                                                className="mt-1 bg-white border-gray-300 text-gray-900"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="fullDescription" className="text-gray-700">
                                                {t("admin.createProduct.fullDescription")} <span className="text-red-600">*</span>
                                            </Label>
                                            <Textarea
                                                id="fullDescription"
                                                value={fullDescription}
                                                onChange={(e) => setFullDescription(e.target.value)}
                                                placeholder={t("admin.createProduct.detailedProductDescription")}
                                                className="mt-1 bg-white border-gray-300 text-gray-900 min-h-[100px]"
                                                required
                                                disabled={!canEditProductInfo()}
                                            />
                                        </div>

                                        {/* Jewelry Product Toggle */}
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-gray-700">{t("admin.createProduct.isJewelry") || "Is Jewelry Product"}</Label>
                                                        <div className="text-gray-500 text-xs mt-1">
                                                            {t("admin.createProduct.jewelryProductHelp") || "Toggle if this product is jewelry"}
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={isJewelryProduct}
                                                        onCheckedChange={setIsJewelryProduct}
                                                        disabled={!canEditProductInfo()}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                </div>
                                            </div>                                        {/* Infospotaction Selection (Admin Only) */}
                                        {isAdmin && (
                                            <div>
                                                <Label className="text-gray-700">{t("admin.createProduct.productPlacement")}</Label>
                                                <div className="text-gray-500 text-xs mb-1">
                                                    {t("admin.createProduct.chooseProductPlacement")}
                                                </div>
                                                <SuperSelect
                                                    value={selectedInfospotactionId}
                                                    onValueChange={(value) => setSelectedInfospotactionId(value as number)}
                                                    options={[
                                                        // Add "None" option first
                                                        {
                                                            value: null,
                                                            label: t("admin.approvals.none") || "Aucune"
                                                        },
                                                        // Then add all infospotactions
                                                        ...(infospotactions?.map(action => ({
                                                            value: action.yinfospotactionsid,
                                                            label: `${action.yinfospotactionstitle} - ${action.yinfospotactionsdescription}`
                                                        })) || [])
                                                    ]}
                                                    placeholder={t("admin.createProduct.selectProductPlacementOptional")}
                                                    className="mt-1"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Color Creation Form */}
                                {showColorForm && (
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                                <Palette className="h-5 w-5 text-blue-600" />
                                                {t("admin.createProduct.createNewColor")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.colorCode")}</Label>
                                                    <Input
                                                        value={newColor.code}
                                                        onChange={(e) =>
                                                            setNewColor({ ...newColor, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.colorCodePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.colorName")}</Label>
                                                    <Input
                                                        value={newColor.name}
                                                        onChange={(e) =>
                                                            setNewColor({ ...newColor, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.colorNamePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-gray-700">{t("admin.createProduct.hexColor")}</Label>
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
                                                        className="w-16 h-10 bg-white border-gray-300"
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
                                                        className="flex-1 bg-white border-gray-300 text-gray-900"
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
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Size Creation Form */}
                                {showSizeForm && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                                <Ruler className="h-5 w-5 text-green-600" />
                                                {t("admin.createProduct.createNewSize")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.sizeCode")}</Label>
                                                    <Input
                                                        value={newSize.code}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.sizeCodePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.sizeName")}</Label>
                                                    <Input
                                                        value={newSize.name}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.sizeNamePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.eurSize")}</Label>
                                                    <Input
                                                        value={newSize.eur}
                                                        onChange={(e) =>
                                                            setNewSize({ ...newSize, eur: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.eurSizePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.usSize")}</Label>
                                                    <Input
                                                        value={newSize.us}
                                                        onChange={(e) => setNewSize({ ...newSize, us: e.target.value })}
                                                        placeholder={t("admin.createProduct.usSizePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.xSize")}</Label>
                                                    <Input
                                                        value={newSize.x}
                                                        onChange={(e) => setNewSize({ ...newSize, x: e.target.value })}
                                                        placeholder={t("admin.createProduct.xSizePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
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
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Type Bijoux Creation Form */}
                                {showTypebijouxForm && (
                                    <Card className="bg-purple-50 border-purple-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                                <Package className="h-5 w-5 text-purple-600" />
                                                {t("admin.createProduct.createNewTypeBijoux")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.typebijouxCode")}</Label>
                                                    <Input
                                                        value={newTypebijoux.code}
                                                        onChange={(e) =>
                                                            setNewTypebijoux({ ...newTypebijoux, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.typebijouxCodePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.typebijouxName")}</Label>
                                                    <Input
                                                        value={newTypebijoux.name}
                                                        onChange={(e) =>
                                                            setNewTypebijoux({ ...newTypebijoux, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.typebijouxNamePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleCreateTypebijoux}
                                                    disabled={createTypebijouxMutation.isPending}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                                >
                                                    {createTypebijouxMutation.isPending ? t("admin.createProduct.creating") : t("admin.createProduct.createTypeBijoux")}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowTypebijouxForm(false)}
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Materiaux Creation Form */}
                                {showMateriauxForm && (
                                    <Card className="bg-orange-50 border-orange-200">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                                <Box className="h-5 w-5 text-orange-600" />
                                                {t("admin.createProduct.createNewMateriaux")}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.materiauxCode")}</Label>
                                                    <Input
                                                        value={newMateriaux.code}
                                                        onChange={(e) =>
                                                            setNewMateriaux({ ...newMateriaux, code: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.materiauxCodePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-700">{t("admin.createProduct.materiauxName")}</Label>
                                                    <Input
                                                        value={newMateriaux.name}
                                                        onChange={(e) =>
                                                            setNewMateriaux({ ...newMateriaux, name: e.target.value })
                                                        }
                                                        placeholder={t("admin.createProduct.materiauxNamePlaceholder")}
                                                        className="mt-1 bg-white border-gray-300 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleCreateMateriaux}
                                                    disabled={createMateriauxMutation.isPending}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                                >
                                                    {createMateriauxMutation.isPending ? t("admin.createProduct.creating") : t("admin.createProduct.createMateriaux")}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowMateriauxForm(false)}
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
                                <Card className="bg-gray-50 border-gray-200">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                                <Box className="h-5 w-5 text-blue-600" />
                                                {t("admin.createProduct.productVariants")}
                                            </CardTitle>
                                            <Button
                                                onClick={handleAddVariant}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-500 text-white"
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
                                                <Card key={variant.id} className={`bg-white border-gray-200 ${!canEdit ? 'opacity-75' : ''}`}>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <CardTitle className="text-base text-gray-900">
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
                                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                                                        {t("admin.createProduct.readOnly")}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {variants.length > 1 && canEdit && (
                                                                <Button
                                                                    onClick={() => handleRemoveVariant(variant.id)}
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <Label className="text-gray-700">
                                                                    {t("admin.createProduct.variantName")} <span className="text-red-600">*</span>
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
                                                                    className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-gray-700">
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
                                                                    className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                    disabled={!canEdit}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            {isJewelryProduct ? (
                                                                // Jewelry Product Fields
                                                                <>
                                                                    {/* Jewelry Type */}
                                                                    <div>
                                                                        <Label className="text-gray-700 flex items-center gap-1">
                                                                            <Package className="h-3 w-3" />
                                                                            {t("admin.createProduct.jewelryType")} <span className="text-red-600">*</span>
                                                                        </Label>
                                                                        <div className="flex gap-2 mt-1">
                                                                            <SuperSelect
                                                                                value={variant.typebijouxId}
                                                                                onValueChange={(value) =>
                                                                                    handleVariantChange(
                                                                                        variant.id,
                                                                                        "typebijouxId",
                                                                                        value as string
                                                                                    )
                                                                                }
                                                                                options={typebijouxOptions}
                                                                                placeholder={t("admin.createProduct.selectJewelryType")}
                                                                                className="w-48 max-w-[200px]"
                                                                                disabled={!canEdit || typebijouxLoading}
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => setShowTypebijouxForm(!showTypebijouxForm)}
                                                                                disabled={!canEdit}
                                                                                className="px-3"
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Materials */}
                                                                    <div>
                                                                        <Label className="text-gray-700 flex items-center gap-1">
                                                                            <Box className="h-3 w-3" />
                                                                            {t("admin.createProduct.materials")} <span className="text-red-600">*</span>
                                                                        </Label>
                                                                        <div className="flex gap-2 mt-1">
                                                                            <SuperSelect
                                                                                value={variant.materiauxId}
                                                                                onValueChange={(value) =>
                                                                                    handleVariantChange(
                                                                                        variant.id,
                                                                                        "materiauxId",
                                                                                        value as string
                                                                                    )
                                                                                }
                                                                                options={materiauxOptions}
                                                                                placeholder={t("admin.createProduct.selectMaterials")}
                                                                                className="w-48 max-w-[200px]"
                                                                                disabled={!canEdit || materiauxLoading}
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => setShowMateriauxForm(!showMateriauxForm)}
                                                                                disabled={!canEdit}
                                                                                className="px-3"
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                // Regular Product Fields
                                                                <>
                                                                    {/* Color Selection */}
                                                                    <div>
                                                                        <Label className="text-gray-700 flex items-center gap-1">
                                                                            <Palette className="h-3 w-3" />
                                                                            {t("admin.color") || "Color"} {!isJewelryProduct && <span className="text-red-600">*</span>}
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
                                                                                placeholder={t("admin.createProduct.selectColor") || "Select Color"}
                                                                                disabled={!canEdit}
                                                                                className="flex-1"
                                                                            />
                                                                            {canEdit && (
                                                                                <Button
                                                                                    onClick={() => setShowColorForm(!showColorForm)}
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Size Selection */}
                                                                    <div>
                                                                        <Label className="text-gray-700 flex items-center gap-1">
                                                                            <Ruler className="h-3 w-3" />
                                                                            {t("admin.createProduct.size")} {!isJewelryProduct && <span className="text-red-600">*</span>}
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
                                                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Pricing Section (Admin Only) */}
                                                        {isAdmin && canEdit && (
                                                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                                                <Label className="text-gray-700 flex items-center gap-2">
                                                                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                    </svg>
                                                                    {t("admin.createProduct.pricingPromotion")}
                                                                </Label>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    {/* Currency Selection */}
                                                                    <div>
                                                                        <Label className="text-gray-700 text-sm">{t("admin.createProduct.currency")}</Label>
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
                                                                        <Label className="text-gray-700 text-sm">{t("admin.createProduct.catalogPrice")}</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step={(() => {
                                                                                const selectedCurrency = currencies?.find(c => c.xdeviseid === variant.currencyId);
                                                                                const decimals = selectedCurrency?.xdevisenbrdec ?? 2;
                                                                                if (decimals === 0) return "1";
                                                                                return (1 / Math.pow(10, decimals)).toFixed(decimals);
                                                                            })()}
                                                                            value={variant.catalogPrice || ""}
                                                                            onChange={(e) => {
                                                                                const inputValue = e.target.value;
                                                                                const selectedCurrency = currencies?.find(c => c.xdeviseid === variant.currencyId);
                                                                                const maxDecimals = selectedCurrency?.xdevisenbrdec ?? 2;
                                                                                
                                                                                // Check decimal places
                                                                                const decimalIndex = inputValue.indexOf('.');
                                                                                const actualDecimals = decimalIndex === -1 ? 0 : inputValue.length - decimalIndex - 1;
                                                                                
                                                                                if (actualDecimals <= maxDecimals) {
                                                                                    handleVariantChange(
                                                                                        variant.id,
                                                                                        "catalogPrice",
                                                                                        parseFloat(inputValue) || 0
                                                                                    );
                                                                                }
                                                                            }}
                                                                            placeholder="0.00"
                                                                            className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                        />
                                                                    </div>

                                                                    {/* Promotion Price */}
                                                                    <div>
                                                                        <Label className="text-gray-700 text-sm">{t("admin.createProduct.promotionPriceOptional")}</Label>
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
                                                                            className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                        />
                                                                    </div>

                                                                    {/* Promotion Start Date */}
                                                                    <div>
                                                                        <Label className="text-gray-700 text-sm">{t("admin.createProduct.promotionStartDate")}</Label>
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
                                                                            className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                        />
                                                                    </div>

                                                                    {/* Promotion End Date */}
                                                                    <div className="sm:col-span-2">
                                                                        <Label className="text-gray-700 text-sm">{t("admin.createProduct.promotionEndDate")}</Label>
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
                                                                            className="mt-1 bg-white border-gray-300 text-gray-900"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Media Upload */}
                                                        {canEdit && (
                                                            <div className="space-y-3">
                                                                <Label className="text-gray-700">{t("admin.createProduct.mediaFiles")}</Label>

                                                                {/* Images */}
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Image className="h-4 w-4 text-blue-600" />
                                                                        <span className="text-sm text-gray-700">{t("admin.createProduct.images")}</span>
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
                                                                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
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
                                                                                className="bg-blue-100 text-blue-800 border-blue-200"
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
                                                                                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
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
                                                                        <Video className="h-4 w-4 text-green-600" />
                                                                        <span className="text-sm text-gray-700">{t("admin.createProduct.videos")}</span>
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
                                                                            className="border-green-300 text-green-600 hover:bg-green-50"
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
                                                                                className="bg-green-100 text-green-800 border-green-200"
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
                                                                                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
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
                                                                        <Box className="h-4 w-4 text-purple-600" />
                                                                        <span className="text-sm text-gray-700">{t("admin.createProduct.models3d")}</span>
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
                                                                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                                                        >
                                                                            <Upload className="h-3 w-3 mr-1" />
                                                                            {t("admin.createProduct.upload")}
                                                                        </Button>
                                                                    </div>

                                                                    {/* Background Color Input */}
                                                                    <div className="mb-3">
                                                                        <Label className="text-gray-700 text-sm flex items-center gap-1">
                                                                            <Palette className="h-3 w-3" />
                                                                            3D Model Background Color
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
                                                                                className="w-12 h-8 bg-white border border-gray-300 rounded cursor-pointer"
                                                                                title="Select background color for 3D model"
                                                                            />
                                                                            <Input
                                                                                value={variant.backgroundColor || "#ffffff"}
                                                                                onChange={(e) =>
                                                                                    handleVariantChange(
                                                                                        variant.id,
                                                                                        "backgroundColor",
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                placeholder="#ffffff"
                                                                                className="flex-1 bg-white border-gray-300 text-gray-900 text-sm"
                                                                                maxLength={7}
                                                                            />
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            Background color for the 3D model viewer
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        {variant.models3d.map((file, fileIndex) => (
                                                                            <Badge
                                                                                key={fileIndex}
                                                                                variant="secondary"
                                                                                className="bg-purple-100 text-purple-800 border-purple-200"
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
                                                                                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
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
                                                                <Label className="text-gray-700">{t("admin.createProduct.mediaFilesReadOnly")}</Label>

                                                                {/* Display existing images */}
                                                                {variant.images.length > 0 && (
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Image className="h-4 w-4 text-blue-600" />
                                                                            <span className="text-sm text-gray-700">{t("admin.createProduct.images")}</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {variant.images.map((file, fileIndex) => (
                                                                                <Badge
                                                                                    key={fileIndex}
                                                                                    variant="secondary"
                                                                                    className="bg-blue-100 text-blue-800 border-blue-200"
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
                                                                            <Video className="h-4 w-4 text-green-600" />
                                                                            <span className="text-sm text-gray-700">{t("admin.createProduct.videos")}</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {variant.videos.map((file, fileIndex) => (
                                                                                <Badge
                                                                                    key={fileIndex}
                                                                                    variant="secondary"
                                                                                    className="bg-green-100 text-green-800 border-green-200"
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
                                                                            <Box className="h-4 w-4 text-purple-600" />
                                                                            <span className="text-sm text-gray-700">{t("admin.createProduct.models3d")}</span>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {variant.models3d.map((file, fileIndex) => (
                                                                                <Badge
                                                                                    key={fileIndex}
                                                                                    variant="secondary"
                                                                                    className="bg-purple-100 text-purple-800 border-purple-200"
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
                                            )
                                        })}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {isSubmitting && (
                    <div className="px-6 pb-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">
                                    {isEditMode ? t("admin.createProduct.updatingProduct") : t("admin.createProduct.creatingProduct")}
                                </span>
                                <span className="text-blue-600 font-medium">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <Progress
                                value={progress}
                                className="h-2 bg-gray-200"
                            />
                        </div>
                    </div>
                )}

                {/* Dialog Footer */}
                {!isSubmitting && !(isEditMode && productDetailsLoading) && !(isEditMode && productDetailsError) && (
                    <div className="flex justify-end gap-3 border-t border-gray-200 p-2">
                        <Button
                            onClick={handleCloseDialog}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={
                                createProductMutation.isPending ||
                                updateProductMutation.isPending ||
                                designerLoading
                            }
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition-all duration-300 hover:scale-105"
                        >
                            {isEditMode
                                ? t("admin.createProduct.updateProduct")
                                : t("admin.createProduct.createProduct")}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmation.isOpen} onOpenChange={cancelDeleteVariant}>
            <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        {t("admin.createProduct.confirmDeleteVariant")}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        {t("admin.createProduct.deleteVariantWarning")} {deleteConfirmation.variantName}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 mt-4">
                    <Button
                        onClick={cancelDeleteVariant}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={confirmDeleteVariant}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {t("admin.createProduct.deleteVariant")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Exit Confirmation Dialog */}
        <Dialog open={exitConfirmation} onOpenChange={cancelExit}>
            <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        {t("admin.createProduct.confirmExit")}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        {t("admin.createProduct.exitWarning")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 mt-4">
                    <Button
                        onClick={cancelExit}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={confirmExit}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {t("admin.createProduct.exitWithoutSaving")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
