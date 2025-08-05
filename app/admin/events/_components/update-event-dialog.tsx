"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Upload, X, Plus, MapPin, Store } from "lucide-react";
import { useUpdateEvent } from "../_hooks/use-update-event";
import { useEventDetails } from "../_hooks/use-event-details";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { MallMultiSelect } from "./mall-multi-select";
import { BoutiqueMultiSelect } from "./boutique-multi-select";

interface MediaItem {
    ymediaid: number;
    ymediaurl: string;
    ymediaintitule: string;
}

interface EventData {
    yeventid: number;
    yeventcode: string;
    yeventintitule: string;
    yeventdatedeb: string;
    yeventdatefin: string;
    yeventmedia?: Array<{
        ymedia: MediaItem;
    }>;
}


interface UpdateEventDialogProps {
    children: React.ReactNode;
    event: EventData;
}

export function UpdateEventDialog({ children, event }: UpdateEventDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        startDate: "",
        endDate: "",
    });
    const [existingImages, setExistingImages] = useState<MediaItem[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);
    const [selectedMallIds, setSelectedMallIds] = useState<number[]>([]);
    const [selectedBoutiqueIds, setSelectedBoutiqueIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();
    const updateEventMutation = useUpdateEvent();
    const { data: eventDetails, isLoading: isLoadingDetails } = useEventDetails(event?.yeventid);
    const { t } = useLanguage();

    // Initialize form data when event changes or dialog opens
    useEffect(() => {
        if (event && isOpen) {
            setFormData({
                code: event.yeventcode || "",
                name: event.yeventintitule || "",
                startDate: event.yeventdatedeb || "",
                endDate: event.yeventdatefin || "",
            });
            
            // Set existing images
            const images = event.yeventmedia?.map(em => em.ymedia) || [];
            setExistingImages(images);
            setImagesToRemove([]);
            setNewFiles([]);
            setNewImagePreviews([]);
        }
    }, [event, isOpen]);

    // Initialize mall/boutique data when event details are loaded
    useEffect(() => {
        if (eventDetails && isOpen) {
            setSelectedMallIds(eventDetails.selectedMallIds);
            setSelectedBoutiqueIds(eventDetails.selectedBoutiqueIds);
        }
    }, [eventDetails, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setNewFiles(prev => [...prev, ...files]);
            // Create preview URLs
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setNewImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeNewFile = (index: number) => {
        // Revoke the object URL to prevent memory leaks
        if (newImagePreviews[index]) {
            URL.revokeObjectURL(newImagePreviews[index]);
        }
        
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (mediaId: number) => {
        setImagesToRemove(prev => [...prev, mediaId]);
    };

    const restoreExistingImage = (mediaId: number) => {
        setImagesToRemove(prev => prev.filter(id => id !== mediaId));
    };

    const clearAllNewFiles = () => {
        // Revoke all object URLs
        newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setNewFiles([]);
        setNewImagePreviews([]);
    };

    const validateForm = () => {
        if (!formData.name.trim()) return t('admin.events.validation.nameRequired');
        if (!formData.startDate) return t('admin.events.validation.startDateRequired');
        if (!formData.endDate) return t('admin.events.validation.endDateRequired');
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            return t('admin.events.validation.endDateAfterStart');
        }
        if (selectedMallIds.length === 0) return 'Please select at least one mall';
        if (selectedBoutiqueIds.length === 0) return 'Please select at least one boutique';
        
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            // Update the event with all the new data
            await updateEventMutation.mutateAsync({
                eventId: event.yeventid,
                code: formData.code.trim() || undefined,
                name: formData.name.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                imagesToAdd: newFiles.length > 0 ? newFiles : undefined,
                imagesToRemove: imagesToRemove.length > 0 ? imagesToRemove : undefined,
                selectedMallIds,
                selectedBoutiqueIds
            });

            // Invalidate and refetch events
            await queryClient.invalidateQueries({ queryKey: ["events"] });
            await queryClient.invalidateQueries({ queryKey: ["event-details", event.yeventid] });

            // Close dialog
            setIsOpen(false);
            
            // Show success message
            toast.success(t('admin.events.eventUpdatedSuccess'));

        } catch (error) {
            console.error("Error updating event:", error);
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        clearAllNewFiles();
        setImagesToRemove([]);
        if (event) {
            setFormData({
                code: event.yeventcode || "",
                name: event.yeventintitule || "",
                startDate: event.yeventdatedeb || "",
                endDate: event.yeventdatefin || "",
            });
            const images = event.yeventmedia?.map(em => em.ymedia) || [];
            setExistingImages(images);
        }
        if (eventDetails) {
            setSelectedMallIds(eventDetails.selectedMallIds);
            setSelectedBoutiqueIds(eventDetails.selectedBoutiqueIds);
        }
    };

    const handleMallSelectionChange = (mallIds: number[]) => {
        setSelectedMallIds(mallIds);
        // Clear boutique selections when malls change
        setSelectedBoutiqueIds([]);
    };

    const handleBoutiqueSelectionChange = (boutiqueIds: number[]) => {
        setSelectedBoutiqueIds(boutiqueIds);
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    };

    const getVisibleExistingImages = () => {
        return existingImages.filter(img => !imagesToRemove.includes(img.ymediaid));
    };

    if (isLoadingDetails) {
        return (
            <Dialog open={isOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light max-w-7xl max-h-[95vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                            {t('admin.events.updateEventTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-morpheus-gold-light mx-auto mb-4"></div>
                            <p>Loading event details...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.events.updateEventTitle')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex gap-6 h-[calc(95vh-120px)]">
                    {/* Left Column - Basic Event Information */}
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* Basic Event Information */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">{t('admin.events.eventCode')}</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={(e) => handleInputChange("code", e.target.value)}
                                        placeholder={t('admin.events.eventCodePlaceholder')}
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">{t('admin.events.eventName')}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        placeholder={t('admin.events.eventNamePlaceholder')}
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">{t('admin.events.startDate')}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">{t('admin.events.endDate')}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                                        className="bg-gray-800/50 border-gray-600 text-white"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Management Section */}
                        <div className="space-y-4">
                            <Label className="text-gray-300">{t('admin.events.eventImages')}</Label>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-gray-300 text-sm">
                                            {t('admin.events.currentImages')} ({getVisibleExistingImages().length})
                                        </Label>
                                        {imagesToRemove.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setImagesToRemove([])}
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                disabled={isSubmitting}
                                            >
                                                {t('admin.events.restoreAll')}
                                            </Button>
                                        )}
                                    </div>
                                    <ScrollArea className="h-32">
                                        <div className="grid grid-cols-1 gap-2 pr-2">
                                        {existingImages.map((image) => {
                                            const isMarkedForRemoval = imagesToRemove.includes(image.ymediaid);
                                            return (
                                                <Card
                                                    key={image.ymediaid}
                                                    className={`border-gray-600 transition-all ${
                                                        isMarkedForRemoval
                                                            ? "bg-red-900/20 border-red-500/30 opacity-50"
                                                            : "bg-gray-800/30"
                                                    }`}
                                                >
                                                    <CardContent className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                                                                <img
                                                                    src={image.ymediaurl}
                                                                    alt={image.ymediaintitule}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm font-medium truncate">
                                                                    {image.ymediaintitule}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {isMarkedForRemoval
                                                                        ? t('admin.events.markedForRemoval')
                                                                        : t('admin.events.currentImage')}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    isMarkedForRemoval
                                                                        ? restoreExistingImage(image.ymediaid)
                                                                        : removeExistingImage(image.ymediaid)
                                                                }
                                                                className={`flex-shrink-0 h-8 w-8 p-0 ${
                                                                    isMarkedForRemoval
                                                                        ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                                        : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                                }`}
                                                                disabled={isSubmitting}
                                                            >
                                                                {isMarkedForRemoval ? (
                                                                    <Plus className="h-3 w-3" />
                                                                ) : (
                                                                    <X className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* Add New Images */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300 text-sm">{t('admin.events.addNewImages')}</Label>
                                    {newFiles.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAllNewFiles}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            disabled={isSubmitting}
                                        >
                                            {t('admin.events.clearAll')}
                                        </Button>
                                    )}
                                </div>

                                {/* Upload Area */}
                                <Card className="bg-gray-800/30 border-gray-600 border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-4">
                                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                        <div className="text-center">
                                            <Label
                                                htmlFor="new-image-upload"
                                                className="text-morpheus-gold-light hover:text-morpheus-gold-dark cursor-pointer text-sm"
                                            >
                                                {t('admin.events.clickToAddMore')}
                                            </Label>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {t('admin.events.fileSupport')}
                                            </p>
                                        </div>
                                        <Input
                                            id="new-image-upload"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleNewFileSelect}
                                            className="hidden"
                                            disabled={isSubmitting}
                                        />
                                    </CardContent>
                                </Card>

                                {/* New Image Previews */}
                                {newFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-300 text-sm">{t('admin.events.newImages')} ({newFiles.length})</Label>
                                        <ScrollArea className="h-32">
                                            <div className="grid grid-cols-1 gap-2 pr-2">
                                            {newFiles.map((file, index) => (
                                                <Card key={index} className="bg-green-900/20 border-green-500/30">
                                                    <CardContent className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                                                                <img
                                                                    src={newImagePreviews[index]}
                                                                    alt={`New image ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm font-medium truncate">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {t('admin.events.newImage')}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeNewFile(index)}
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0 h-8 w-8 p-0"
                                                                disabled={isSubmitting}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800/50"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                            >
                                {isSubmitting ? t('admin.events.updating') : t('admin.events.updateEvent')}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Mall & Boutique Selection */}
                    <div className="flex-1 space-y-6 overflow-y-auto pl-2">
                        {/* Mall Selection */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-morpheus-gold-light" />
                                {t('admin.events.malls.selectMalls')}
                            </Label>
                            <MallMultiSelect
                                selectedMallIds={selectedMallIds}
                                onSelectionChange={handleMallSelectionChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Boutique Selection */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <Store className="h-4 w-4 text-morpheus-gold-light" />
                                {t('admin.events.boutiques.selectBoutiques')}
                            </Label>
                            <BoutiqueMultiSelect
                                selectedMallIds={selectedMallIds}
                                selectedBoutiqueIds={selectedBoutiqueIds}
                                onSelectionChange={handleBoutiqueSelectionChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
