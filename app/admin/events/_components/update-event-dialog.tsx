"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Upload, X, Plus } from "lucide-react";
import { useUpdateEvent } from "../_hooks/use-update-event";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();
    const updateEventMutation = useUpdateEvent();

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
        if (!formData.name.trim()) return "Event name is required";
        if (!formData.startDate) return "Start date is required";
        if (!formData.endDate) return "End date is required";
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            return "End date must be after start date";
        }
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
            // Update the event
            await updateEventMutation.mutateAsync({
                eventId: event.yeventid,
                code: formData.code.trim() || undefined,
                name: formData.name.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                imagesToAdd: newFiles.length > 0 ? newFiles : undefined,
                imagesToRemove: imagesToRemove.length > 0 ? imagesToRemove : undefined
            });

            // Invalidate and refetch events
            await queryClient.invalidateQueries({ queryKey: ["events"] });

            // Close dialog
            setIsOpen(false);
            
            // Show success message
            toast.success("Event updated successfully!");

        } catch (error) {
            console.error("Error updating event:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to update event. Please try again.";
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

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                        Update Event
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Event Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Event Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleInputChange("code", e.target.value)}
                                placeholder="Event code"
                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">Event Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter event name"
                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Start Date</Label>
                            <Input
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange("startDate", e.target.value)}
                                className="bg-gray-800/50 border-gray-600 text-white"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300">End Date</Label>
                            <Input
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange("endDate", e.target.value)}
                                className="bg-gray-800/50 border-gray-600 text-white"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Image Management Section */}
                    <div className="space-y-4">
                        <Label className="text-gray-300">Event Images</Label>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-300 text-sm">
                                        Current Images ({getVisibleExistingImages().length})
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
                                            Restore All
                                        </Button>
                                    )}
                                </div>
                                <ScrollArea className="h-40">
                                    <div className="grid grid-cols-1 gap-3 pr-4">
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
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                            <img
                                                                src={image.ymediaurl}
                                                                alt={image.ymediaintitule}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium truncate">
                                                                {image.ymediaintitule}
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                {isMarkedForRemoval
                                                                    ? "Marked for removal"
                                                                    : "Current image"}
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
                                                            className={`flex-shrink-0 ${
                                                                isMarkedForRemoval
                                                                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                                    : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                            }`}
                                                            disabled={isSubmitting}
                                                        >
                                                            {isMarkedForRemoval ? (
                                                                <Plus className="h-4 w-4" />
                                                            ) : (
                                                                <X className="h-4 w-4" />
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
                                <Label className="text-gray-300 text-sm">Add New Images</Label>
                                {newFiles.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllNewFiles}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        disabled={isSubmitting}
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            {/* Upload Area */}
                            <Card className="bg-gray-800/30 border-gray-600 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-6">
                                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                    <div className="text-center">
                                        <Label
                                            htmlFor="new-image-upload"
                                            className="text-morpheus-gold-light hover:text-morpheus-gold-dark cursor-pointer"
                                        >
                                            Click to add more images
                                        </Label>
                                        <p className="text-sm text-gray-400 mt-1">
                                            PNG, JPG, GIF up to 10MB each • Multiple files supported
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
                                <div className="space-y-3">
                                    <Label className="text-gray-300 text-sm">New Images ({newFiles.length})</Label>
                                    <ScrollArea className="h-40">
                                        <div className="grid grid-cols-1 gap-3 pr-4">
                                        {newFiles.map((file, index) => (
                                            <Card key={index} className="bg-green-900/20 border-green-500/30">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                                                            <img
                                                                src={newImagePreviews[index]}
                                                                alt={`New image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white font-medium truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB • New image
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeNewFile(index)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                                                            disabled={isSubmitting}
                                                        >
                                                            <X className="h-4 w-4" />
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
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-morpheus-gold-dark to-morpheus-gold-light hover:from-morpheus-gold-dark hover:to-morpheus-gold-light text-white font-semibold transition-all duration-300 hover:scale-105"
                        >
                            {isSubmitting ? "Updating..." : "Update Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}