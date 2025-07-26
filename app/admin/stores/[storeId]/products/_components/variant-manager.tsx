"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    Palette,
    Ruler,
    DollarSign,
    Truck,
    Edit,
    Save,
    X,
    Box,
    Image,
    Eye,
    Link,
    ArrowUp,
    ArrowDown,
    Video,
    PlusCircle
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MediaObject {
    id?: string;
    url: string;
    type: 'model3d' | 'image' | 'video';
    order: number;
    isActive: boolean;
    description?: string;
}

interface ProductVariant {
    id?: string;
    color: string;
    colorCode: string;
    size: string;
    media: MediaObject[];
}

interface VariantManagerProps {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
    colors: any[];
    sizes: any[];
    onCreateColor?: (color: { name: string; code: string; hex: string; rgb: string }) => Promise<any>;
    onCreateSize?: (size: { name: string; code: string; eur?: string; us?: string; x?: string }) => Promise<any>;
}

export function VariantManager({
    variants,
    onVariantsChange,
    colors,
    sizes,
    onCreateColor,
    onCreateSize
}: VariantManagerProps) {
    const { t } = useLanguage();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showColorDialog, setShowColorDialog] = useState(false);
    const [showSizeDialog, setShowSizeDialog] = useState(false);
    const [newColor, setNewColor] = useState({ name: '', code: '', hex: '#000000', rgb: '0,0,0' });
    const [newSize, setNewSize] = useState({ name: '', code: '', eur: '', us: '', x: '' });
    const [isCreatingColor, setIsCreatingColor] = useState(false);
    const [isCreatingSize, setIsCreatingSize] = useState(false);

    const createNewVariant = (): ProductVariant => ({
        id: Date.now().toString(),
        color: "",
        colorCode: "",
        size: "",
        media: []
    });

    const handleAddVariant = () => {
        const newVariant = createNewVariant();
        onVariantsChange([...variants, newVariant]);
        setEditingIndex(variants.length);
    };

    const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
        const updatedVariants = variants.map((variant, i) =>
            i === index ? { ...variant, [field]: value } : variant
        );
        onVariantsChange(updatedVariants);
    };

    const handleColorChange = (index: number, colorName: string) => {
        const selectedColor = colors.find(c => c.xcouleurintitule === colorName);
        const updatedVariants = variants.map((variant, i) => {
            if (i === index) {
                return {
                    ...variant,
                    color: colorName,
                    colorCode: selectedColor ? (selectedColor.xcouleurhexa || selectedColor.xcouleurcode || '#6B7280') : ''
                };
            }
            return variant;
        });
        onVariantsChange(updatedVariants);
    };

    const handleRemoveVariant = (index: number) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        onVariantsChange(updatedVariants);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };


    const handleSaveVariant = (index: number) => {
        setEditingIndex(null);
    };

    const handleCancelEdit = (index: number) => {
        setEditingIndex(null);
    };

    // Color creation functions
    const handleCreateColor = async () => {
        if (!onCreateColor || !newColor.name.trim()) return;
        
        setIsCreatingColor(true);
        try {
            const createdColor = await onCreateColor({
                name: newColor.name.trim(),
                code: newColor.code.trim() || newColor.name.trim().toUpperCase().replace(/\s+/g, '_'),
                hex: newColor.hex,
                rgb: newColor.rgb
            });
            
            // Reset form
            setNewColor({ name: '', code: '', hex: '#000000', rgb: '0,0,0' });
            setShowColorDialog(false);
        } catch (error) {
            console.error('Failed to create color:', error);
        } finally {
            setIsCreatingColor(false);
        }
    };

    // Size creation functions
    const handleCreateSize = async () => {
        if (!onCreateSize || !newSize.name.trim()) return;
        
        setIsCreatingSize(true);
        try {
            const createdSize = await onCreateSize({
                name: newSize.name.trim(),
                code: newSize.code.trim() || newSize.name.trim().toUpperCase().replace(/\s+/g, '_'),
                eur: newSize.eur.trim(),
                us: newSize.us.trim(),
                x: newSize.x.trim()
            });
            
            // Reset form
            setNewSize({ name: '', code: '', eur: '', us: '', x: '' });
            setShowSizeDialog(false);
        } catch (error) {
            console.error('Failed to create size:', error);
        } finally {
            setIsCreatingSize(false);
        }
    };

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `${r},${g},${b}`;
        }
        return '0,0,0';
    };

    // Media management functions
    const createNewMediaObject = (type: 'model3d' | 'image' | 'video'): MediaObject => ({
        id: Date.now().toString(),
        url: "",
        type,
        order: 0,
        isActive: true,
        description: ""
    });

    const handleAddMedia = (variantIndex: number, type: 'model3d' | 'image' | 'video') => {
        const newMedia = createNewMediaObject(type);
        const updatedVariants = variants.map((variant, i) =>
            i === variantIndex
                ? { ...variant, media: [...variant.media, { ...newMedia, order: variant.media.length }] }
                : variant
        );
        onVariantsChange(updatedVariants);
    };

    const handleUpdateMedia = (variantIndex: number, mediaIndex: number, field: keyof MediaObject, value: any) => {
        const updatedVariants = variants.map((variant, i) =>
            i === variantIndex
                ? {
                    ...variant,
                    media: variant.media.map((media, j) =>
                        j === mediaIndex ? { ...media, [field]: value } : media
                    )
                }
                : variant
        );
        onVariantsChange(updatedVariants);
    };

    const handleRemoveMedia = (variantIndex: number, mediaIndex: number) => {
        const updatedVariants = variants.map((variant, i) =>
            i === variantIndex
                ? {
                    ...variant,
                    media: variant.media.filter((_, j) => j !== mediaIndex)
                        .map((media, j) => ({ ...media, order: j }))
                }
                : variant
        );
        onVariantsChange(updatedVariants);
    };

    const handleMoveMedia = (variantIndex: number, mediaIndex: number, direction: 'up' | 'down') => {
        const variant = variants[variantIndex];
        if ((direction === 'up' && mediaIndex === 0) || (direction === 'down' && mediaIndex === variant.media.length - 1)) {
            return;
        }

        const newMedia = [...variant.media];
        const targetIndex = direction === 'up' ? mediaIndex - 1 : mediaIndex + 1;
        
        [newMedia[mediaIndex], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[mediaIndex]];
        newMedia[mediaIndex].order = mediaIndex;
        newMedia[targetIndex].order = targetIndex;
        
        const updatedVariants = variants.map((v, i) =>
            i === variantIndex ? { ...v, media: newMedia } : v
        );
        onVariantsChange(updatedVariants);
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Card className="bg-gradient-to-br from-morpheus-blue-dark/40 to-morpheus-blue-light/40 border-slate-700/50 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-white text-xl">
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-morpheus-gold-light" />
                        Product Variants
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {variants.length === 0 ? (
                    <div className="text-center py-8">
                        <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            No variants added yet
                        </h3>
                        <p className="text-gray-300 mb-4">
                            Add product variants with different colors, sizes, and media
                        </p>
                        <Button
                            type="button"
                            onClick={handleAddVariant}
                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Variant
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {variants.map((variant, index) => (
                            <Card
                                key={variant.id || index}
                                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-6 h-6 rounded-full border-2 border-white/20"
                                                style={{ backgroundColor: variant.colorCode || '#gray' }}
                                            />
                                            <div>
                                                <h4 className="text-white font-medium">
                                                    {variant.color || 'Unnamed'} - {variant.size || 'No Size'}
                                                </h4>
                                                <p className="text-gray-300 text-sm">
                                                    {variant.media.length} media
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingIndex === index ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleSaveVariant(index)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelEdit(index)}
                                                        className="border-slate-600 text-white hover:bg-slate-700/50"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingIndex(index)}
                                                    className="border-slate-600 text-white hover:bg-slate-700/50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveVariant(index)}
                                                className="border-red-600 text-red-400 hover:bg-red-600/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {editingIndex === index && (
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Color Selection */}
                                            <div>
                                                <Label className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Palette className="h-4 w-4" />
                                                    Color
                                                </Label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={variant.color}
                                                        onChange={(e) => handleColorChange(index, e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                                    >
                                                        <option value="">Select color</option>
                                                        {colors.map((color) => (
                                                            <option key={color.xcouleurid} value={color.xcouleurintitule}>
                                                                {color.xcouleurintitule}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {onCreateColor && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => setShowColorDialog(true)}
                                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-white px-2"
                                                            title="Create new color"
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Size Selection */}
                                            <div>
                                                <Label className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Ruler className="h-4 w-4" />
                                                    Size
                                                </Label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={variant.size}
                                                        onChange={(e) => handleUpdateVariant(index, 'size', e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                                    >
                                                        <option value="">Select size</option>
                                                        {sizes.map((size) => (
                                                            <option key={size.xtailleid} value={size.xtailleintitule}>
                                                                {size.xtailleintitule}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {onCreateSize && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => setShowSizeDialog(true)}
                                                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-white px-2"
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Media Management Section */}
                                        <div className="col-span-full border-t border-slate-600 pt-4 mt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-white font-medium flex items-center gap-2">
                                                    <Box className="h-4 w-4" />
                                                    Media for this variant
                                                </h5>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleAddMedia(index, 'model3d')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    >
                                                        <Box className="h-3 w-3 mr-1" />
                                                        3D Model
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleAddMedia(index, 'image')}
                                                        variant="outline"
                                                        className="border-slate-600 text-white hover:bg-slate-700/50"
                                                    >
                                                        <Image className="h-3 w-3 mr-1" />
                                                        Image
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleAddMedia(index, 'video')}
                                                        variant="outline"
                                                        className="border-slate-600 text-white hover:bg-slate-700/50"
                                                    >
                                                        <Video className="h-3 w-3 mr-1" />
                                                        Video
                                                    </Button>
                                                </div>
                                            </div>

                                            {variant.media.length === 0 ? (
                                                <div className="text-center py-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                                                    <p className="text-gray-400 text-sm">No media added for this variant</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {variant.media.map((media, mediaIndex) => (
                                                        <div
                                                            key={media.id || mediaIndex}
                                                            className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/30"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    {media.type === 'model3d' ? (
                                                                        <Box className="h-4 w-4 text-blue-400" />
                                                                    ) : media.type === 'video' ? (
                                                                        <Video className="h-4 w-4 text-purple-400" />
                                                                    ) : (
                                                                        <Image className="h-4 w-4 text-green-400" />
                                                                    )}
                                                                    <span className="text-white text-sm font-medium">
                                                                        {media.type === 'model3d' ? '3D Model' : media.type === 'video' ? 'Video' : 'Image'} #{media.order + 1}
                                                                    </span>
                                                                    {media.url && (
                                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                                            isValidUrl(media.url)
                                                                                ? 'bg-green-500/20 text-green-400'
                                                                                : 'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                            {isValidUrl(media.url) ? 'Valid' : 'Invalid URL'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleMoveMedia(index, mediaIndex, 'up')}
                                                                        disabled={mediaIndex === 0}
                                                                        className="border-slate-600 text-white hover:bg-slate-700/50 p-1 h-6 w-6"
                                                                    >
                                                                        <ArrowUp className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleMoveMedia(index, mediaIndex, 'down')}
                                                                        disabled={mediaIndex === variant.media.length - 1}
                                                                        className="border-slate-600 text-white hover:bg-slate-700/50 p-1 h-6 w-6"
                                                                    >
                                                                        <ArrowDown className="h-3 w-3" />
                                                                    </Button>
                                                                    {media.url && isValidUrl(media.url) && (
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => window.open(media.url, '_blank')}
                                                                            className="border-slate-600 text-white hover:bg-slate-700/50 p-1 h-6 w-6"
                                                                        >
                                                                            <Eye className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleRemoveMedia(index, mediaIndex)}
                                                                        className="border-red-600 text-red-400 hover:bg-red-600/10 p-1 h-6 w-6"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                                <div className="lg:col-span-2">
                                                                    <Label className="text-white text-xs font-medium flex items-center gap-1">
                                                                        <Link className="h-3 w-3" />
                                                                        {media.type === 'model3d' ? '3D Model URL' : media.type === 'video' ? 'Video URL' : 'Image URL'}
                                                                    </Label>
                                                                    <Input
                                                                        value={media.url}
                                                                        onChange={(e) => handleUpdateMedia(index, mediaIndex, 'url', e.target.value)}
                                                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light text-sm"
                                                                        placeholder={
                                                                            media.type === 'model3d'
                                                                                ? 'https://example.com/model.glb'
                                                                                : media.type === 'video'
                                                                                ? 'https://example.com/video.mp4'
                                                                                : 'https://example.com/image.jpg'
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-white text-xs font-medium">
                                                                        Description
                                                                    </Label>
                                                                    <Input
                                                                        value={media.description || ''}
                                                                        onChange={(e) => handleUpdateMedia(index, mediaIndex, 'description', e.target.value)}
                                                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light text-sm"
                                                                        placeholder="Brief description"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        id={`media-active-${index}-${mediaIndex}`}
                                                                        checked={media.isActive}
                                                                        onCheckedChange={(checked) => handleUpdateMedia(index, mediaIndex, 'isActive', checked)}
                                                                    />
                                                                    <Label htmlFor={`media-active-${index}-${mediaIndex}`} className="text-white text-xs font-medium">
                                                                        Active
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Color Creation Dialog */}
            {showColorDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Palette className="h-5 w-5 text-morpheus-gold-light" />
                                Create New Color
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-white text-sm font-medium">Color Name</Label>
                                <Input
                                    value={newColor.name}
                                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="e.g., Ocean Blue"
                                />
                            </div>
                            <div>
                                <Label className="text-white text-sm font-medium">Color Code</Label>
                                <Input
                                    value={newColor.code}
                                    onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="e.g., OCEAN_BLUE (auto-generated if empty)"
                                />
                            </div>
                            <div>
                                <Label className="text-white text-sm font-medium">Hex Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={newColor.hex}
                                        onChange={(e) => {
                                            const hex = e.target.value;
                                            setNewColor({
                                                ...newColor,
                                                hex,
                                                rgb: hexToRgb(hex)
                                            });
                                        }}
                                        className="w-16 h-10 bg-slate-700 border-slate-600 rounded cursor-pointer"
                                    />
                                    <Input
                                        value={newColor.hex}
                                        onChange={(e) => {
                                            const hex = e.target.value;
                                            setNewColor({
                                                ...newColor,
                                                hex,
                                                rgb: hexToRgb(hex)
                                            });
                                        }}
                                        className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-white text-sm font-medium">RGB Values</Label>
                                <Input
                                    value={newColor.rgb}
                                    onChange={(e) => setNewColor({ ...newColor, rgb: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="255,255,255"
                                />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCreateColor}
                                    disabled={!newColor.name.trim() || isCreatingColor}
                                    className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white"
                                >
                                    {isCreatingColor ? 'Creating...' : 'Create Color'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowColorDialog(false);
                                        setNewColor({ name: '', code: '', hex: '#000000', rgb: '0,0,0' });
                                    }}
                                    className="border-slate-600 text-white hover:bg-slate-700/50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Size Creation Dialog */}
            {showSizeDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Ruler className="h-5 w-5 text-morpheus-gold-light" />
                                Create New Size
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-white text-sm font-medium">Size Name</Label>
                                <Input
                                    value={newSize.name}
                                    onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="e.g., Medium, 42, XL"
                                />
                            </div>
                            <div>
                                <Label className="text-white text-sm font-medium">Size Code</Label>
                                <Input
                                    value={newSize.code}
                                    onChange={(e) => setNewSize({ ...newSize, code: e.target.value })}
                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                    placeholder="e.g., M, 42, XL (auto-generated if empty)"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label className="text-white text-xs font-medium">EU Size</Label>
                                    <Input
                                        value={newSize.eur}
                                        onChange={(e) => setNewSize({ ...newSize, eur: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light text-sm"
                                        placeholder="42"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white text-xs font-medium">US Size</Label>
                                    <Input
                                        value={newSize.us}
                                        onChange={(e) => setNewSize({ ...newSize, us: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light text-sm"
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white text-xs font-medium">Generic</Label>
                                    <Input
                                        value={newSize.x}
                                        onChange={(e) => setNewSize({ ...newSize, x: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light text-sm"
                                        placeholder="L"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCreateSize}
                                    disabled={!newSize.name.trim() || isCreatingSize}
                                    className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white"
                                >
                                    {isCreatingSize ? 'Creating...' : 'Create Size'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowSizeDialog(false);
                                        setNewSize({ name: '', code: '', eur: '', us: '', x: '' });
                                    }}
                                    className="border-slate-600 text-white hover:bg-slate-700/50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    );
}