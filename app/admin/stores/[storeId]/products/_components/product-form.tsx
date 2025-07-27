"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Package,
    Save,
    X,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/client";
import { VariantManager } from "./variant-manager";

interface ProductFormProps {
    storeId: string;
    productId?: string;
}

interface ProductFormData {
    yprodintitule: string;
    yprodcode: string;
    yproddetailstech: string;
    yprodinfobulle: string;
    xcategprodidfk: string;
    yprodstatut: string;
}

interface FormErrors {
    [key: string]: string;
}

export function ProductForm({ storeId, productId }: ProductFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState<ProductFormData>({
        yprodintitule: "",
        yprodcode: "",
        yproddetailstech: "",
        yprodinfobulle: "",
        xcategprodidfk: "",
        yprodstatut: "not_approved"
    });

    const [variants, setVariants] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [colors, setColors] = useState<any[]>([]);
    const [sizes, setSizes] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const { data: user } = useAuth();
    const supabase = createClient();

    // Fetch real data from database
    useEffect(() => {
        const fetchFormData = async () => {
            try {
                setIsLoadingData(true);

                // Fetch categories (global)
                const { data: categoriesData, error: categoriesError } = await supabase
                    .schema('morpheus')
                    .from('xcategprod')
                    .select('*')
                    .order('xcategprodintitule');

                // Fetch colors
                const { data: colorsData, error: colorsError } = await supabase
                    .schema('morpheus')
                    .from('xcouleur')
                    .select('*')
                    .order('xcouleurintitule');

                // Fetch sizes
                const { data: sizesData, error: sizesError } = await supabase
                    .schema('morpheus')
                    .from('xtaille')
                    .select('*')
                    .order('xtailleintitule');

                // Fetch currencies
                const { data: currenciesData, error: currenciesError } = await supabase
                    .schema('morpheus')
                    .from('xdevise')
                    .select('*')
                    .order('xdeviseintitule');

                if (!categoriesError) setCategories(categoriesData || []);
                if (!colorsError) setColors(colorsData || []);
                if (!sizesError) setSizes(sizesData || []);
                if (!currenciesError) setCurrencies(currenciesData || []);

            } catch (error) {
                console.error('Error fetching form data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchFormData();
    }, [supabase]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.yprodintitule.trim()) {
            newErrors.yprodintitule = "Product name is required";
        }

        if (!formData.yprodcode.trim()) {
            newErrors.yprodcode = "Product code is required";
        }

        if (!formData.yproddetailstech.trim()) {
            newErrors.yproddetailstech = "Product description is required";
        }

        if (!formData.xcategprodidfk) {
            newErrors.xcategprodidfk = "Category is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof ProductFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Validate that we have at least one variant
        if (variants.length === 0) {
            setErrors({ submit: 'At least one product variant is required' });
            return;
        }

        // Validate that all variants have required fields
        for (const variant of variants) {
            if (!variant.color || !variant.size) {
                setErrors({ submit: 'All variants must have color, size, and price specified' });
                return;
            }
        }

        setIsSubmitting(true);
        setErrors({});
        setSuccessMessage("");

        try {
            // Generate unique product ID
            const productId = Date.now();

            // Create the main product using direct Supabase call
            const { error: productError } = await supabase
                .schema('morpheus')
                .from('yprod')
                .insert({
                    yprodid: productId,
                    yprodintitule: formData.yprodintitule,
                    yprodcode: formData.yprodcode,
                    yproddetailstech: formData.yproddetailstech,
                    yprodinfobulle: formData.yprodinfobulle,
                    xcategprodidfk: formData.xcategprodidfk ? parseInt(formData.xcategprodidfk) : null,
                    ydesignidfk: parseInt(storeId), // Link to store/design
                    yprodstatut: 'not_approved', // New products start as pending approval
                    sysdate: new Date().toISOString(),
                    sysaction: 'insert',
                    sysuser: user?.email || 'system'
                })
                .select()
                .single();

            if (productError) {
                throw new Error('Failed to create product: ' + productError.message);
            }

            // Create product variants if provided
            const createdVariants = [];
            if (variants.length > 0) {
                for (const [index, variant] of variants.entries()) {
                    const variantId = Date.now() + index + 1000; // Ensure unique IDs
                    
                    // Find matching color and size IDs with improved error handling
                    const colorMatch = colors.find(c =>
                        c.xcouleurintitule && variant.color &&
                        c.xcouleurintitule.trim().toLowerCase() === variant.color.trim().toLowerCase()
                    );
                    const sizeMatch = sizes.find(s =>
                        s.xtailleintitule && variant.size &&
                        s.xtailleintitule.trim().toLowerCase() === variant.size.trim().toLowerCase()
                    );
                    const currencyMatch = currencies.find(c => c.xdeviseintitule === 'USD') || currencies[0]; // Default to USD or first currency

                    // Ensure we have valid foreign key references
                    if (!colorMatch) {
                        const errorMsg = `Color "${variant.color}" not found in database. Available colors: ${colors.map(c => c.xcouleurintitule).join(', ')}`;
                        console.error(errorMsg);
                        throw new Error(`Variant ${index + 1}: ${errorMsg}`);
                    }
                    if (!sizeMatch) {
                        const errorMsg = `Size "${variant.size}" not found in database. Available sizes: ${sizes.map(s => s.xtailleintitule).join(', ')}`;
                        console.error(errorMsg);
                        throw new Error(`Variant ${index + 1}: ${errorMsg}`);
                    }
                    if (!currencyMatch) {
                        const errorMsg = 'No currency found in database';
                        console.error(errorMsg);
                        throw new Error(`Variant ${index + 1}: ${errorMsg}`);
                    }
                    
                    const { data: newVariant, error: variantError } = await supabase
                        .schema('morpheus')
                        .from('yvarprod')
                        .insert({
                            yprodidfk: productId,
                            yvarprodid: variantId,
                            yvarprodcode: `${formData.yprodcode}-${variant.color}-${variant.size}`,
                            yvarprodintitule: `${formData.yprodintitule} - ${variant.color} ${variant.size}`,
                            yvarprodgenre: variant.size || '',
                            yvarprodprixcatalogue: parseFloat(variant.price) || 0,
                            yvarprodnbrjourlivraison: parseInt(variant.deliveryTime) || 7,
                            xcouleuridfk: colorMatch.xcouleurid,
                            xtailleidfk: sizeMatch.xtailleid,
                            xdeviseidfk: currencyMatch.xdeviseid,
                            sysdate: new Date().toISOString(),
                            sysaction: 'insert',
                            sysuser: user?.email || 'system'
                        })
                        .select()
                        .single();

                    if (variantError) {
                        console.error('Error creating variant:', variantError);
                        throw new Error(`Failed to create variant: ${variantError.message}`);
                    } else {
                        createdVariants.push(newVariant);
                    }
                }
            }

            // Create media and 3D objects from variants
            if (createdVariants.length > 0) {
                for (const [variantIndex, variant] of createdVariants.entries()) {
                    const originalVariant = variants[variantIndex];
                    if (originalVariant?.media && originalVariant.media.length > 0) {
                        for (const [mediaIndex, mediaObj] of originalVariant.media.entries()) {
                            if (!mediaObj.url || !mediaObj.url.trim()) {
                                continue; // Skip empty URLs
                            }

                            if (mediaObj.type === 'model3d') {
                                // Create 3D object linked to variant
                                const { error: object3dError } = await supabase
                                    .schema('morpheus')
                                    .from('yobjet3d')
                                    .insert({
                                        yobjet3did: Date.now() + variantIndex * 1000 + mediaIndex + 2000,
                                        yobjet3durl: mediaObj.url,
                                        yobjet3dcouleur: originalVariant.color || 'Default',
                                        yobjet3dorder: mediaObj.order || mediaIndex,
                                        yvarprodidfk: variant.yvarprodid,
                                        yobjet3daction: 'insert',
                                        sysdate: new Date().toISOString(),
                                        sysuser: user?.email || 'system'
                                    });

                                if (object3dError) {
                                    console.error('Error creating 3D object:', object3dError);
                                }
                            } else if (mediaObj.type === 'image' || mediaObj.type === 'video') {
                                // Create media entry
                                const mediaId = Date.now() + variantIndex * 1000 + mediaIndex + 3000;
                                
                                // First create the media record
                                const { error: mediaError } = await supabase
                                    .schema('morpheus')
                                    .from('ymedia')
                                    .insert({
                                        ymediaid: mediaId,
                                        ymediacode: `${formData.yprodcode}-${originalVariant.color}-${mediaIndex}`,
                                        ymediaintitule: mediaObj.description || `${formData.yprodintitule} - ${originalVariant.color} ${mediaObj.type === 'video' ? 'Video' : 'Image'}`,
                                        ymediadate: new Date().toISOString(),
                                        ymediaboolphotoprod: mediaObj.type === 'image' ? 'true' : 'false',
                                        ymediaboolphotoevent: 'false',
                                        ymediaboolvideocapsule: mediaObj.type === 'video' ? 'true' : 'false',
                                        sysdate: new Date().toISOString(),
                                        sysaction: 'insert',
                                        sysuser: user?.email || 'system'
                                    });

                                if (mediaError) {
                                    console.error('Error creating media:', mediaError);
                                    continue;
                                }

                                // Then link it to the variant
                                const { error: variantMediaError } = await supabase
                                    .schema('morpheus')
                                    .from('yvarprodmedia')
                                    .insert({
                                        yvarprodmediaid: Date.now() + variantIndex * 1000 + mediaIndex + 4000,
                                        yvarprodidfk: variant.yvarprodid,
                                        ymediaidfk: mediaId,
                                        sysdate: new Date().toISOString(),
                                        sysaction: 'insert',
                                        sysuser: user?.email || 'system'
                                    });

                                if (variantMediaError) {
                                    console.error('Error linking media to variant:', variantMediaError);
                                }
                            }
                        }
                    }
                }
            }

            setSuccessMessage("Product created successfully!");
            
            // Redirect after a short delay
            setTimeout(() => {
                router.push(`/admin/stores/${storeId}`);
            }, 2000);

        } catch (error) {
            console.error('Error creating product:', error);
            setErrors({
                submit: error instanceof Error ? error.message : 'Failed to create product'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push(`/admin/stores/${storeId}`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-slate-600"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {productId ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-gray-300 mt-1">
                        {productId ? 'Update product information and variants' : 'Add a new product to your store'}
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-500/20 border border-green-400 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {errors.submit}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Product Information */}
                <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white text-xl">
                            <Package className="h-5 w-5 text-morpheus-gold-light" />
                            Product Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name" className="text-white text-sm font-medium">
                                    Product Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.yprodintitule}
                                    onChange={(e) => handleInputChange("yprodintitule", e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="Enter product name"
                                />
                                {errors.yprodintitule && (
                                    <p className="text-red-400 text-sm mt-1">{errors.yprodintitule}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="code" className="text-white text-sm font-medium">
                                    Product Code *
                                </Label>
                                <Input
                                    id="code"
                                    value={formData.yprodcode}
                                    onChange={(e) => handleInputChange("yprodcode", e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="Enter product code"
                                />
                                {errors.yprodcode && (
                                    <p className="text-red-400 text-sm mt-1">{errors.yprodcode}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-white text-sm font-medium">
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.yproddetailstech}
                                onChange={(e) => handleInputChange("yproddetailstech", e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                placeholder="Enter product description"
                                rows={4}
                            />
                            {errors.yproddetailstech && (
                                <p className="text-red-400 text-sm mt-1">{errors.yproddetailstech}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category" className="text-white text-sm font-medium">
                                    Category *
                                </Label>
                                <select
                                    id="category"
                                    value={formData.xcategprodidfk}
                                    onChange={(e) => handleInputChange("xcategprodidfk", e.target.value)}
                                    disabled={isLoadingData}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-morpheus-gold-light focus:ring-morpheus-gold-light disabled:opacity-50"
                                >
                                    <option value="">
                                        {isLoadingData ? "Loading categories..." : "Select a category"}
                                    </option>
                                    {categories.map((category) => (
                                        <option key={category.xcategprodid} value={category.xcategprodid}>
                                            {category.xcategprodintitule}
                                        </option>
                                    ))}
                                </select>
                                {errors.xcategprodidfk && (
                                    <p className="text-red-400 text-sm mt-1">{errors.xcategprodidfk}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="tooltip" className="text-white text-sm font-medium">
                                    Info Tooltip
                                </Label>
                                <Input
                                    id="tooltip"
                                    value={formData.yprodinfobulle}
                                    onChange={(e) => handleInputChange("yprodinfobulle", e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="Enter tooltip text"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Variant Management */}
                <VariantManager
                    variants={variants}
                    onVariantsChange={setVariants}
                    colors={colors}
                    sizes={sizes}
                    onCreateColor={async (colorData) => {
                        try {
                            const newColorId = Date.now();
                            const { data: newColor, error } = await supabase
                                .schema('morpheus')
                                .from('xcouleur')
                                .insert({
                                    xcouleurid: newColorId,
                                    xcouleurintitule: colorData.name,
                                    xcouleurcode: colorData.code,
                                    xcouleurhexa: colorData.hex,
                                    xcouleurrvb: colorData.rgb,
                                    sysdate: new Date().toISOString(),
                                    sysaction: 'insert',
                                    sysuser: user?.email || 'system'
                                })
                                .select()
                                .single();

                            if (error) throw error;
                            
                            // Update local colors state to ensure immediate availability
                            setColors(prev => [...prev, newColor]);
                            return newColor;
                        } catch (error) {
                            console.error('Failed to create color:', error);
                            throw error;
                        }
                    }}
                    onCreateSize={async (sizeData) => {
                        try {
                            const newSizeId = Date.now();
                            const { data: newSize, error } = await supabase
                                .schema('morpheus')
                                .from('xtaille')
                                .insert({
                                    xtailleid: newSizeId,
                                    xtailleintitule: sizeData.name,
                                    xtaillecode: sizeData.code,
                                    xtailleeur: sizeData.eur || null,
                                    xtailleus: sizeData.us || null,
                                    xtaillex: sizeData.x || null,
                                    sysdate: new Date().toISOString(),
                                    sysaction: 'insert',
                                    sysuser: user?.email || 'system'
                                })
                                .select()
                                .single();

                            if (error) throw error;

                            // Update local sizes state
                            setSizes(prev => [...prev, newSize]);
                            return newSize;
                        } catch (error) {
                            console.error('Failed to create size:', error);
                            throw error;
                        }
                    }}
                />


                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-end pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="border-slate-600 text-white hover:bg-slate-700/50"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating Product...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Product
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}