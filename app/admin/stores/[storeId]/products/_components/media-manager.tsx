"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Trash2,
    Box,
    Eye,
    Edit,
    Save,
    X,
    Link,
    Palette,
    ArrowUp,
    ArrowDown,
    Image,
    Video
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface MediaObject {
    id?: string;
    url: string;
    type: 'model3d' | 'image' | 'video';
    color: string;
    colorCode: string;
    order: number;
    isActive: boolean;
    description?: string;
}

interface MediaManagerProps {
    mediaObjects: MediaObject[];
    onMediaChange: (mediaObjects: MediaObject[]) => void;
    colors: any[];
}

export function MediaManager({ mediaObjects, onMediaChange, colors }: MediaManagerProps) {
    // Add default color if colors array is empty
    const availableColors = colors.length > 0 ? colors : [
        { xcouleurid: "default", xcouleurintitule: "Default", xcouleurcode: "#6B7280" }
    ];
    const { t } = useLanguage();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const createNewMediaObject = (type: 'model3d' | 'image' | 'video'): MediaObject => ({
        id: Date.now().toString(),
        url: "",
        type,
        color: "Default",
        colorCode: "#6B7280",
        order: mediaObjects.length,
        isActive: true,
        description: ""
    });

    const handleAddMedia = (type: 'model3d' | 'image' | 'video') => {
        const newMedia = createNewMediaObject(type);
        onMediaChange([...mediaObjects, newMedia]);
        setEditingIndex(mediaObjects.length);
    };

    const handleUpdateMedia = (index: number, field: keyof MediaObject, value: any) => {
        const updatedMedia = mediaObjects.map((media, i) => 
            i === index ? { ...media, [field]: value } : media
        );
        onMediaChange(updatedMedia);
    };

    const handleRemoveMedia = (index: number) => {
        const updatedMedia = mediaObjects.filter((_, i) => i !== index);
        // Reorder remaining items
        const reorderedMedia = updatedMedia.map((media, i) => ({ ...media, order: i }));
        onMediaChange(reorderedMedia);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === mediaObjects.length - 1)) {
            return;
        }

        const newMedia = [...mediaObjects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap items
        [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
        
        // Update order values
        newMedia[index].order = index;
        newMedia[targetIndex].order = targetIndex;
        
        onMediaChange(newMedia);
    };

    const handleColorChange = (index: number, colorName: string) => {
        const selectedColor = availableColors.find(c => c.xcouleurintitule === colorName);
        handleUpdateMedia(index, 'color', colorName);
        if (selectedColor) {
            handleUpdateMedia(index, 'colorCode', selectedColor.xcouleurcode || '#6B7280');
        }
    };

    const handleSaveMedia = () => {
        setEditingIndex(null);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
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
                        <Box className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.mediaManager.title')}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            onClick={() => handleAddMedia('model3d')}
                            className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            <Box className="h-4 w-4 mr-2" />
                            {t('admin.mediaManager.add3DModel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleAddMedia('image')}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700/50"
                        >
                            <Image className="h-4 w-4 mr-2" />
                            {t('admin.mediaManager.addImage')}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleAddMedia('video')}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700/50"
                        >
                            <Video className="h-4 w-4 mr-2" />
                            {t('admin.mediaManager.addVideo')}
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {mediaObjects.length === 0 ? (
                    <div className="text-center py-8">
                        <Box className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            {t('admin.mediaManager.noMediaAddedYet')}
                        </h3>
                        <p className="text-gray-300 mb-4">
                            {t('admin.mediaManager.noMediaDescription')}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                type="button"
                                onClick={() => handleAddMedia('model3d')}
                                className="bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-[#695029] hover:to-[#d4c066] text-white"
                            >
                                <Box className="h-4 w-4 mr-2" />
                                {t('admin.mediaManager.add3DModel')}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleAddMedia('image')}
                                variant="outline"
                                className="border-slate-600 text-white hover:bg-slate-700/50"
                            >
                                <Image className="h-4 w-4 mr-2" />
                                {t('admin.mediaManager.addImage')}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleAddMedia('video')}
                                variant="outline"
                                className="border-slate-600 text-white hover:bg-slate-700/50"
                            >
                                <Video className="h-4 w-4 mr-2" />
                                {t('admin.mediaManager.addVideo')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mediaObjects.map((media, index) => (
                            <Card
                                key={media.id || index}
                                className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600/50"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {media.type === 'model3d' ? (
                                                    <Box className="h-5 w-5 text-blue-400" />
                                                ) : media.type === 'video' ? (
                                                    <Video className="h-5 w-5 text-purple-400" />
                                                ) : (
                                                    <Image className="h-5 w-5 text-green-400" />
                                                )}
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/20"
                                                    style={{ backgroundColor: media.colorCode }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">
                                                    {media.type === 'model3d' ? t('admin.mediaManager.model3D') : media.type === 'video' ? t('admin.mediaManager.video') : t('admin.mediaManager.image')} - {media.color}
                                                </h4>
                                                <p className="text-gray-300 text-sm">
                                                    {t('admin.mediaManager.orderLabel')}: {media.order + 1}
                                                    {media.url && (
                                                        <span className="ml-2">
                                                            • {isValidUrl(media.url) ? t('admin.mediaManager.validUrl') : t('admin.mediaManager.invalidUrl')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Move buttons */}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMoveMedia(index, 'up')}
                                                disabled={index === 0}
                                                className="border-slate-600 text-white hover:bg-slate-700/50 p-1"
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMoveMedia(index, 'down')}
                                                disabled={index === mediaObjects.length - 1}
                                                className="border-slate-600 text-white hover:bg-slate-700/50 p-1"
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                            
                                            {/* Preview button */}
                                            {media.url && isValidUrl(media.url) && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(media.url, '_blank')}
                                                    className="border-slate-600 text-white hover:bg-slate-700/50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            
                                            {/* Edit/Save buttons */}
                                            {editingIndex === index ? (
                                                <>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleSaveMedia()}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancelEdit()}
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
                                            
                                            {/* Delete button */}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveMedia(index)}
                                                className="border-red-600 text-red-400 hover:bg-red-600/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {editingIndex === index && (
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {/* URL Input */}
                                            <div className="lg:col-span-2">
                                                <Label className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Link className="h-4 w-4" />
                                                    {media.type === 'model3d' ? t('admin.mediaManager.model3DUrl') : media.type === 'video' ? t('admin.mediaManager.videoUrl') : t('admin.mediaManager.imageUrl')}
                                                </Label>
                                                <Input
                                                    value={media.url}
                                                    onChange={(e) => handleUpdateMedia(index, 'url', e.target.value)}
                                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                                    placeholder={
                                                        media.type === 'model3d'
                                                            ? t('admin.mediaManager.model3DUrlPlaceholder')
                                                            : media.type === 'video'
                                                            ? t('admin.mediaManager.videoUrlPlaceholder')
                                                            : t('admin.mediaManager.imageUrlPlaceholder')
                                                    }
                                                />
                                                {media.url && !isValidUrl(media.url) && (
                                                    <p className="text-red-400 text-sm mt-1">{t('admin.mediaManager.pleaseEnterValidUrl')}</p>
                                                )}
                                            </div>

                                            {/* Color Selection */}
                                            <div>
                                                <Label className="text-white text-sm font-medium flex items-center gap-2">
                                                    <Palette className="h-4 w-4" />
                                                    {t('admin.mediaManager.associatedColor')}
                                                </Label>
                                                <select
                                                    value={media.color}
                                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                                >
                                                    {availableColors.map((color) => (
                                                        <option key={color.xcouleurid} value={color.xcouleurintitule}>
                                                            {color.xcouleurintitule}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <Label className="text-white text-sm font-medium">
                                                    {t('admin.mediaManager.descriptionOptional')}
                                                </Label>
                                                <Input
                                                    value={media.description || ''}
                                                    onChange={(e) => handleUpdateMedia(index, 'description', e.target.value)}
                                                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 focus:border-morpheus-gold-light focus:ring-morpheus-gold-light"
                                                    placeholder={t('admin.mediaManager.briefDescriptionPlaceholder')}
                                                />
                                            </div>

                                            {/* Active Status */}
                                            <div className="flex items-center space-x-2 lg:col-span-2">
                                                <Switch
                                                    id={`media-active-${index}`}
                                                    checked={media.isActive}
                                                    onCheckedChange={(checked) => handleUpdateMedia(index, 'isActive', checked)}
                                                />
                                                <Label htmlFor={`media-active-${index}`} className="text-white text-sm font-medium">
                                                    {t('admin.mediaManager.activeStatus')}
                                                </Label>
                                            </div>
                                        </div>

                                        {/* Preview Section */}
                                        {media.url && isValidUrl(media.url) && (
                                            <div className="border-t border-slate-600 pt-4">
                                                <Label className="text-white text-sm font-medium mb-2 block">
                                                    {t('admin.mediaManager.preview')}
                                                </Label>
                                                {media.type === 'image' ? (
                                                    <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                                                        <img
                                                            src={media.url}
                                                            alt="Preview"
                                                            className="max-h-full max-w-full object-contain rounded"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                target.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <div className="hidden text-gray-400 text-sm">
                                                            {t('admin.mediaManager.failedToLoadImage')}
                                                        </div>
                                                    </div>
                                                ) : media.type === 'video' ? (
                                                    <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                                                        <video
                                                            src={media.url}
                                                            className="max-h-full max-w-full object-contain rounded"
                                                            controls
                                                            onError={(e) => {
                                                                const target = e.target as HTMLVideoElement;
                                                                target.style.display = 'none';
                                                                target.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <div className="hidden text-gray-400 text-sm">
                                                            {t('admin.mediaManager.failedToLoadVideo')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-600">
                                                        <div className="text-center text-gray-400">
                                                            <Box className="h-8 w-8 mx-auto mb-2" />
                                                            <p className="text-sm">{t('admin.mediaManager.model3DPreview')}</p>
                                                            <p className="text-xs">{t('admin.mediaManager.clickPreviewButtonToView')}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}