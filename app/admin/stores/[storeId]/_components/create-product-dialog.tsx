"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
    Info
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

interface ProductVariant {
    id: string;
    yvarprodid?: number; // For existing variants
    name: string;
    code?: string;
    colorId: number | null;
    sizeId: number | null;
    images: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    videos: (File | { ymediaid: number; ymediaurl: string; ymediaintitule: string })[];
    models3d: (File | { yobjet3did: number; yobjet3durl: string })[];
    isDeleted?: boolean; // Mark for deletion
}

interface CreateProductDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: number; // If provided, dialog is in edit mode
}

export function CreateProductDialog({ isOpen, onClose, productId }: CreateProductDialogProps) {
    const params = useParams();
    const storeId = parseInt(params.storeId as string);

    // Form state
    const [productCode, setProductCode] = useState("");
    const [productName, setProductName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [fullDescription, setFullDescription] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [variants, setVariants] = useState<ProductVariant[]>([
        {
            id: "1",
            name: "",
            colorId: null,
            sizeId: null,
            images: [],
            videos: [],
            models3d: [],
        }
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
    const { data: designer, isLoading: designerLoading } = useDesigner();
    const { data: productDetails, isLoading: productDetailsLoading } = useProductDetails({
        productId: productId!,
        enabled: isEditMode
    });
    const createColorMutation = useCreateColor();
    const createSizeMutation = useCreateSize();
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    // Effect to populate form when editing
    useEffect(() => {
        if (isEditMode && productDetails) {
            const { product, variants: productVariants } = productDetails;
            
            // Populate product fields
            setProductCode(product.yprodcode || "");
            setProductName(product.yprodintitule || "");
            setShortDescription(product.yprodinfobulle || "");
            setFullDescription(product.yproddetailstech || "");
            setCategoryId(product.xcategprodidfk || null);

            // Populate variants
            const formattedVariants: ProductVariant[] = productVariants.map((variant, index) => ({
                id: variant.yvarprodid?.toString() || `existing-${index}`,
                yvarprodid: variant.yvarprodid,
                name: variant.yvarprodintitule || "",
                code: variant.yvarprodcode || "",
                colorId: variant.xcouleuridfk || null,
                sizeId: variant.xtailleidfk || null,
                images: variant.images || [],
                videos: variant.videos || [],
                models3d: variant.models3d || [],
            }));

            setVariants(formattedVariants.length > 0 ? formattedVariants : [{
                id: "1",
                name: "",
                colorId: null,
                sizeId: null,
                images: [],
                videos: [],
                models3d: [],
            }]);
        } else if (!isEditMode) {
            // Reset form for create mode
            setProductCode("");
            setProductName("");
            setShortDescription("");
            setFullDescription("");
            setCategoryId(null);
            setVariants([{
                id: "1",
                name: "",
                colorId: null,
                sizeId: null,
                images: [],
                videos: [],
                models3d: [],
            }]);
        }
    }, [isEditMode, productDetails]);

    // Prepare options
    const categoryOptions = categories?.map(cat => ({
        value: cat.xcategprodid,
        label: cat.xcategprodintitule
    })) || [];

    const colorOptions = colors?.map(color => ({
        value: color.xcouleurid,
        label: color.xcouleurintitule
    })) || [];

    const sizeOptions = sizes?.map(size => ({
        value: size.xtailleid,
        label: size.xtailleintitule
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
        };
        setVariants([...variants, newVariant]);
    };

    const handleRemoveVariant = (variantId: string) => {
        if (variants.length > 1) {
            setVariants(variants.filter(v => v.id !== variantId));
        }
    };

    const handleVariantChange = (variantId: string, field: keyof ProductVariant, value: any) => {
        setVariants(variants.map(v => 
            v.id === variantId ? { ...v, [field]: value } : v
        ));
    };

    const handleFileUpload = (variantId: string, type: 'images' | 'videos' | 'models3d', files: FileList) => {
        const fileArray = Array.from(files);
        setVariants(variants.map(v => 
            v.id === variantId
                ? {
                    ...v,
                    [type]: type === 'models3d'
                        ? fileArray.slice(0, 1) // Only allow one 3D model
                        : [...v[type], ...fileArray]
                }
                : v
        ));
    };

    const handleRemoveFile = (variantId: string, type: 'images' | 'videos' | 'models3d', index: number) => {
        setVariants(variants.map(v => 
            v.id === variantId ? { 
                ...v, 
                [type]: v[type].filter((_, i) => i !== index) 
            } : v
        ));
    };

    const handleCreateColor = async () => {
        if (!newColor.code || !newColor.name) {
            toast.error("Please fill in color code and name");
            return;
        }

        try {
            await createColorMutation.mutateAsync(newColor);
            toast.success("Color created successfully!");
            setShowColorForm(false);
            setNewColor({ code: "", name: "", hexColor: "#000000", rgbColor: "0,0,0" });
        } catch (error) {
            console.error("Failed to create color:", error);
            toast.error("Failed to create color");
        }
    };

    const handleCreateSize = async () => {
        if (!newSize.code || !newSize.name) {
            toast.error("Please fill in size code and name");
            return;
        }

        try {
            await createSizeMutation.mutateAsync(newSize);
            toast.success("Size created successfully!");
            setShowSizeForm(false);
            setNewSize({ code: "", name: "", eur: "", us: "", x: "" });
        } catch (error) {
            console.error("Failed to create size:", error);
            toast.error("Failed to create size");
        }
    };

    const handleSubmit = async () => {
        if (!productName || !shortDescription || !fullDescription) {
            toast.error("Please fill in all required product fields");
            return;
        }

        if (!designer) {
            toast.error("Designer information not found");
            return;
        }

        // Validate variants
        for (const variant of variants) {
            if (!variant.name || !variant.colorId || !variant.sizeId) {
                toast.error("Please complete all variant information");
                return;
            }
        }

        try {
            if (isEditMode && productId) {
                // Update existing product
                await updateProductMutation.mutateAsync({
                    productId,
                    storeId,
                    designerId: designer.ydesignid,
                    categoryId,
                    productCode: productCode || undefined,
                    productName,
                    shortDescription,
                    fullDescription,
                    variants: variants.map(v => ({
                        id: v.id,
                        yvarprodid: v.yvarprodid,
                        name: v.name,
                        code: v.code,
                        colorId: v.colorId!,
                        sizeId: v.sizeId!,
                        images: v.images,
                        videos: v.videos,
                        models3d: v.models3d,
                        isDeleted: v.isDeleted,
                    })),
                });
                toast.success("Product updated successfully!");
            } else {
                // Create new product
                await createProductMutation.mutateAsync({
                    storeId,
                    designerId: designer.ydesignid,
                    categoryId,
                    productCode: productCode || undefined,
                    productName,
                    shortDescription,
                    fullDescription,
                    variants: variants.map(v => ({
                        name: v.name,
                        code: v.code,
                        colorId: v.colorId!,
                        sizeId: v.sizeId!,
                        images: v.images.filter((img): img is File => img instanceof File),
                        videos: v.videos.filter((vid): vid is File => vid instanceof File),
                        models3d: v.models3d.filter((model): model is File => model instanceof File),
                    })),
                });
                toast.success("Product created successfully!");
            }

            onClose();
        } catch (error) {
            console.error("Failed to create product:", error);
            toast.error(isEditMode ? "Failed to update product" : "Failed to create product");
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-gray-700/50 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="h-6 w-6 text-morpheus-gold-light" />
                        {isEditMode ? "Edit Product" : "Create New Product"}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh] pr-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Product Information & Creation Forms */}
                        <div className="space-y-6">
                            {/* Product Information */}
                            <Card className="bg-gray-800/50 border-gray-700/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-morpheus-gold-light" />
                                        Product Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="category" className="text-gray-300">Category</Label>
                                            <SuperSelect
                                                value={categoryId}
                                                onValueChange={(value) => setCategoryId(value as number)}
                                                options={categoryOptions}
                                                placeholder="Select category"
                                                disabled={categoriesLoading}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="productCode" className="text-gray-300">
                                                Product Code
                                            </Label>
                                            <Input
                                                id="productCode"
                                                value={productCode}
                                                onChange={(e) => setProductCode(e.target.value)}
                                                placeholder="Auto-generated if empty"
                                                className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="productName" className="text-gray-300">
                                            Product Name <span className="text-red-400">*</span>
                                        </Label>
                                        <Input
                                            id="productName"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                            placeholder="Enter product name"
                                            className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="shortDescription" className="text-gray-300 flex items-center gap-1">
                                            Short Description <span className="text-red-400">*</span>
                                            <Info className="h-3 w-3 text-gray-500" />
                                        </Label>
                                        <Input
                                            id="shortDescription"
                                            value={shortDescription}
                                            onChange={(e) => setShortDescription(e.target.value)}
                                            placeholder="Brief description for tooltips"
                                            className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="fullDescription" className="text-gray-300">
                                            Full Description <span className="text-red-400">*</span>
                                        </Label>
                                        <Textarea
                                            id="fullDescription"
                                            value={fullDescription}
                                            onChange={(e) => setFullDescription(e.target.value)}
                                            placeholder="Detailed product description"
                                            className="mt-1 bg-gray-700/50 border-gray-600 text-white min-h-[100px]"
                                            required
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Color Creation Form */}
                            {showColorForm && (
                                <Card className="bg-blue-900/20 border-blue-700/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-blue-400" />
                                            Create New Color
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label className="text-gray-300">Color Code</Label>
                                                <Input
                                                    value={newColor.code}
                                                    onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                                                    placeholder="e.g., RED, BLU"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Color Name</Label>
                                                <Input
                                                    value={newColor.name}
                                                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                                    placeholder="e.g., Red, Blue"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-300">Hex Color</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    type="color"
                                                    value={newColor.hexColor}
                                                    onChange={(e) => {
                                                        const hex = e.target.value;
                                                        setNewColor({
                                                            ...newColor,
                                                            hexColor: hex,
                                                            rgbColor: hexToRgb(hex)
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
                                                            rgbColor: hexToRgb(hex)
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
                                                {createColorMutation.isPending ? "Creating..." : "Create Color"}
                                            </Button>
                                            <Button
                                                onClick={() => setShowColorForm(false)}
                                                variant="outline"
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                Cancel
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
                                            Create New Size
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <Label className="text-gray-300">Size Code</Label>
                                                <Input
                                                    value={newSize.code}
                                                    onChange={(e) => setNewSize({ ...newSize, code: e.target.value })}
                                                    placeholder="e.g., S, M, L, XL"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">Size Name</Label>
                                                <Input
                                                    value={newSize.name}
                                                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                                                    placeholder="e.g., Small, Medium, Large"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-gray-300">EUR Size</Label>
                                                <Input
                                                    value={newSize.eur}
                                                    onChange={(e) => setNewSize({ ...newSize, eur: e.target.value })}
                                                    placeholder="e.g., 36, 38, 40"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">US Size</Label>
                                                <Input
                                                    value={newSize.us}
                                                    onChange={(e) => setNewSize({ ...newSize, us: e.target.value })}
                                                    placeholder="e.g., 6, 8, 10"
                                                    className="mt-1 bg-gray-700/50 border-gray-600 text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-300">X Size</Label>
                                                <Input
                                                    value={newSize.x}
                                                    onChange={(e) => setNewSize({ ...newSize, x: e.target.value })}
                                                    placeholder="e.g., XS, S, M"
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
                                                {createSizeMutation.isPending ? "Creating..." : "Create Size"}
                                            </Button>
                                            <Button
                                                onClick={() => setShowSizeForm(false)}
                                                variant="outline"
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                Cancel
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
                                        Product Variants
                                    </CardTitle>
                                    <Button
                                        onClick={handleAddVariant}
                                        size="sm"
                                        className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Variant
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {variants.map((variant, index) => (
                                    <Card key={variant.id} className="bg-gray-700/30 border-gray-600/50">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base text-white">
                                                    Variant {index + 1}
                                                </CardTitle>
                                                {variants.length > 1 && (
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
                                                        Variant Name <span className="text-red-400">*</span>
                                                    </Label>
                                                    <Input
                                                        value={variant.name}
                                                        onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                                                        placeholder="Enter variant name"
                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-gray-300">
                                                        Variant Code <span className="text-gray-500 text-sm">(optional)</span>
                                                    </Label>
                                                    <Input
                                                        value={variant.code || ""}
                                                        onChange={(e) => handleVariantChange(variant.id, 'code', e.target.value)}
                                                        placeholder="Auto-generated if empty"
                                                        className="mt-1 bg-gray-600/50 border-gray-500 text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Color Selection */}
                                                <div>
                                                    <Label className="text-gray-300 flex items-center gap-1">
                                                        <Palette className="h-3 w-3" />
                                                        Color <span className="text-red-400">*</span>
                                                    </Label>
                                                    <div className="flex gap-2 mt-1">
                                                        <SuperSelect
                                                            value={variant.colorId}
                                                            onValueChange={(value) => handleVariantChange(variant.id, 'colorId', value)}
                                                            options={colorOptions}
                                                            placeholder="Select color"
                                                            disabled={colorsLoading}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            onClick={() => setShowColorForm(!showColorForm)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Size Selection */}
                                                <div>
                                                    <Label className="text-gray-300 flex items-center gap-1">
                                                        <Ruler className="h-3 w-3" />
                                                        Size <span className="text-red-400">*</span>
                                                    </Label>
                                                    <div className="flex gap-2 mt-1">
                                                        <SuperSelect
                                                            value={variant.sizeId}
                                                            onValueChange={(value) => handleVariantChange(variant.id, 'sizeId', value)}
                                                            options={sizeOptions}
                                                            placeholder="Select size"
                                                            disabled={sizesLoading}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            onClick={() => setShowSizeForm(!showSizeForm)}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media Upload */}
                                            <div className="space-y-3">
                                                <Label className="text-gray-300">Media Files</Label>
                                                
                                                {/* Images */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Image className="h-4 w-4 text-blue-400" />
                                                        <span className="text-sm text-gray-300">Images</span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files && handleFileUpload(variant.id, 'images', e.target.files)}
                                                            className="hidden"
                                                            id={`images-${variant.id}`}
                                                        />
                                                        <Button
                                                            onClick={() => document.getElementById(`images-${variant.id}`)?.click()}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Upload
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variant.images.map((file, fileIndex) => (
                                                            <Badge
                                                                key={fileIndex}
                                                                variant="secondary"
                                                                className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                            >
                                                                {file instanceof File ? file.name : file.ymediaintitule}
                                                                <Button
                                                                    onClick={() => handleRemoveFile(variant.id, 'images', fileIndex)}
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
                                                        <span className="text-sm text-gray-300">Videos</span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="video/*"
                                                            onChange={(e) => e.target.files && handleFileUpload(variant.id, 'videos', e.target.files)}
                                                            className="hidden"
                                                            id={`videos-${variant.id}`}
                                                        />
                                                        <Button
                                                            onClick={() => document.getElementById(`videos-${variant.id}`)?.click()}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-green-600 text-green-400 hover:bg-green-900/50"
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Upload
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variant.videos.map((file, fileIndex) => (
                                                            <Badge
                                                                key={fileIndex}
                                                                variant="secondary"
                                                                className="bg-green-500/20 text-green-300 border-green-500/30"
                                                            >
                                                                {file instanceof File ? file.name : file.ymediaintitule}
                                                                <Button
                                                                    onClick={() => handleRemoveFile(variant.id, 'videos', fileIndex)}
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
                                                        <span className="text-sm text-gray-300">3D Models</span>
                                                        <input
                                                            type="file"
                                                            // Only allow one file for 3D models
                                                            multiple={false}
                                                            accept=".glb,.gltf,.obj,.fbx"
                                                            onChange={(e) => e.target.files && handleFileUpload(variant.id, 'models3d', e.target.files)}
                                                            className="hidden"
                                                            id={`models3d-${variant.id}`}
                                                        />
                                                        <Button
                                                            onClick={() => document.getElementById(`models3d-${variant.id}`)?.click()}
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-purple-600 text-purple-400 hover:bg-purple-900/50"
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Upload
                                                        </Button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {variant.models3d.map((file, fileIndex) => (
                                                            <Badge
                                                                key={fileIndex}
                                                                variant="secondary"
                                                                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                            >
                                                                {file instanceof File ? file.name : `3D Model ${fileIndex + 1}`}
                                                                <Button
                                                                    onClick={() => handleRemoveFile(variant.id, 'models3d', fileIndex)}
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
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createProductMutation.isPending || updateProductMutation.isPending || designerLoading || (isEditMode && productDetailsLoading)}
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                    >
                        {createProductMutation.isPending || updateProductMutation.isPending
                            ? (isEditMode ? "Updating Product..." : "Creating Product...")
                            : (isEditMode ? "Update Product" : "Create Product")
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}