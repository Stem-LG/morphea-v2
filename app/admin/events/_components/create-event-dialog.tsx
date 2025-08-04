"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Upload, X, MapPin, Store, Users } from "lucide-react";
import { useCreateEvent } from "../_hooks/use-create-event";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { MallMultiSelect } from "./mall-multi-select";
import { BoutiqueMultiSelect } from "./boutique-multi-select";
import { DesignerAssignment } from "./designer-assignment";

interface CreateEventDialogProps {
    children: React.ReactNode;
}

interface DesignerAssignment {
    boutiqueId: number;
    designerId: number | null;
}

export function CreateEventDialog({ children }: CreateEventDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        startDate: "",
        endDate: "",
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedMallIds, setSelectedMallIds] = useState<number[]>([]);
    const [selectedBoutiqueIds, setSelectedBoutiqueIds] = useState<number[]>([]);
    const [designerAssignments, setDesignerAssignments] = useState<DesignerAssignment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const queryClient = useQueryClient();
    const createEventMutation = useCreateEvent();
    const { t } = useLanguage();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            // Create preview URLs
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeSelectedFile = (index: number) => {
        // Revoke the object URL to prevent memory leaks
        if (imagePreviews[index]) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeAllFiles = () => {
        // Revoke all object URLs
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setImagePreviews([]);
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
        
        // Check if all boutiques have designers assigned
        const unassignedBoutiques = selectedBoutiqueIds.filter(boutiqueId =>
            !designerAssignments.some(assignment =>
                assignment.boutiqueId === boutiqueId && assignment.designerId !== null
            )
        );
        if (unassignedBoutiques.length > 0) {
            return 'Please assign designers to all selected boutiques';
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
            // Create the event with all the new data
            await createEventMutation.mutateAsync({
                code: formData.code.trim() || undefined,
                name: formData.name.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                imageFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
                selectedMallIds,
                selectedBoutiqueIds,
                designerAssignments
            });

            // Invalidate and refetch events
            await queryClient.invalidateQueries({ queryKey: ["events"] });

            // Reset form and close dialog
            resetForm();
            setIsOpen(false);
            
            // Show success message
            toast.success(t('admin.events.eventCreatedSuccess'));

        } catch (error) {
            console.error("Error creating event:", error);
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            toast.error(errorMessage);
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
        removeAllFiles();
        setSelectedMallIds([]);
        setSelectedBoutiqueIds([]);
        setDesignerAssignments([]);
    };

    const handleMallSelectionChange = (mallIds: number[]) => {
        setSelectedMallIds(mallIds);
        // Clear boutique selections when malls change
        const validBoutiqueIds = selectedBoutiqueIds.filter(boutiqueId => {
            // This would need to be checked against the actual boutiques data
            // For now, we'll clear all selections when malls change
            return false;
        });
        setSelectedBoutiqueIds([]);
        setDesignerAssignments([]);
    };

    const handleBoutiqueSelectionChange = (boutiqueIds: number[]) => {
        setSelectedBoutiqueIds(boutiqueIds);
        // Remove designer assignments for boutiques that are no longer selected
        const validAssignments = designerAssignments.filter(assignment =>
            boutiqueIds.includes(assignment.boutiqueId)
        );
        setDesignerAssignments(validAssignments);
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-morpheus-gold-light" />
                        {t('admin.events.createNewEvent')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex gap-6 h-[calc(95vh-120px)]">
                    {/* Left Column - Basic Event Information */}
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* Basic Event Information */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">{t('admin.events.eventCodeOptional')}</Label>
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

                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-300">{t('admin.events.eventImagesOptional')}</Label>
                                {selectedFiles.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeAllFiles}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        disabled={isSubmitting}
                                    >
                                        {t('admin.events.clearAll')}
                                    </Button>
                                )}
                            </div>

                            {/* Upload Area */}
                            <Card className="bg-gray-800/30 border-gray-600 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-6">
                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                    <div className="text-center">
                                        <Label
                                            htmlFor="image-upload"
                                            className="text-morpheus-gold-light hover:text-morpheus-gold-dark cursor-pointer text-sm"
                                        >
                                            {t('admin.events.clickToUpload')}
                                        </Label>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('admin.events.fileSupport')}
                                        </p>
                                    </div>
                                    <Input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                </CardContent>
                            </Card>

                            {/* Image Previews */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-gray-300 text-sm">
                                        {t('admin.events.selectedImages')} ({selectedFiles.length})
                                    </Label>
                                    <ScrollArea className="h-40">
                                        <div className="grid grid-cols-1 gap-2 pr-2">
                                            {selectedFiles.map((file, index) => (
                                                <Card key={index} className="bg-gray-800/30 border-gray-600">
                                                    <CardContent className="p-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                                                                <img
                                                                    src={imagePreviews[index]}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                                                                <p className="text-xs text-gray-400">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeSelectedFile(index)}
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

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4 sticky bottom-0">
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
                                {isSubmitting ? t('admin.events.creating') : t('admin.events.createEvent')}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Mall, Boutique & Designer Selection */}
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

                        {/* Designer Assignment */}
                        <div className="space-y-3">
                            <Label className="text-white flex items-center gap-2">
                                <Users className="h-4 w-4 text-morpheus-gold-light" />
                                {t('admin.events.designers.assignDesigners')}
                            </Label>
                            <DesignerAssignment
                                selectedMallIds={selectedMallIds}
                                selectedBoutiqueIds={selectedBoutiqueIds}
                                designerAssignments={designerAssignments}
                                onAssignmentChange={setDesignerAssignments}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}