"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Upload, X } from "lucide-react";
import { useCreateEvent } from "../_hooks/use-create-event";
import { useUploadFile } from "@/app/_hooks/use-upload-file";
import { useCreateMedia } from "@/app/_hooks/use-create-media";
import { useQueryClient } from "@tanstack/react-query";

interface CreateEventDialogProps {
    children: React.ReactNode;
}

export function CreateEventDialog({ children }: CreateEventDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        startDate: "",
        endDate: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();
    const createEventMutation = useCreateEvent();
    const uploadFileMutation = useUploadFile();
    const createMediaMutation = useCreateMedia();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
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
            alert(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            let mediaId: number | undefined;

            // If there's a selected file, upload it and create media record
            if (selectedFile) {
                // Upload file to storage
                const fileUrl = await uploadFileMutation.mutateAsync({
                    file: selectedFile,
                    type: "image"
                });

                // Create media record in database
                const mediaData = await createMediaMutation.mutateAsync({
                    name: `${formData.name} Image`,
                    type: "eventImage",
                    url: fileUrl
                });

                // Get the media ID from the created record
                if (mediaData && mediaData.length > 0) {
                    mediaId = mediaData[0].ymediaid;
                }
            }

            // Create the event
            await createEventMutation.mutateAsync({
                code: formData.code.trim() || undefined,
                name: formData.name.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                mediaId
            });

            // Invalidate and refetch events
            await queryClient.invalidateQueries({ queryKey: ["events"] });

            // Reset form and close dialog
            setFormData({
                code: "",
                name: "",
                startDate: "",
                endDate: "",
            });
            removeSelectedFile();
            setIsOpen(false);
            
            // Optionally show success message
            alert("Event created successfully!");

        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            name: "",
            startDate: "",
            endDate: "",
        });
        removeSelectedFile();
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-morpheus-purple/20 to-morpheus-blue/10 border-morpheus-purple/30 backdrop-blur-sm max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                        Create New Event
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Event Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-300">Event Code (Optional)</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => handleInputChange("code", e.target.value)}
                                placeholder="Auto-generated if empty"
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

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <Label className="text-gray-300">Event Image (Optional)</Label>
                        
                        {!selectedFile ? (
                            <Card className="bg-gray-800/30 border-gray-600 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-8">
                                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                                    <div className="text-center">
                                        <Label
                                            htmlFor="image-upload"
                                            className="text-morpheus-gold-light hover:text-morpheus-gold-dark cursor-pointer"
                                        >
                                            Click to upload image
                                        </Label>
                                        <p className="text-sm text-gray-400 mt-1">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-gray-800/30 border-gray-600">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">
                                                    {selectedFile.name}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeSelectedFile}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                    disabled={isSubmitting}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        {imagePreview && (
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-morpheus-gold-dark hover:bg-morpheus-gold-light text-black font-medium"
                        >
                            {isSubmitting ? "Creating..." : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}