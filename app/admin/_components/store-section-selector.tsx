"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin } from "lucide-react";
import { TourData } from "@/app/_consts/tourdata";

interface StoreSectionSelectorProps {
    selectedSection: string | null;
    onSectionSelect: (sectionId: string, storeName: string, sectionTitle: string) => void;
    tourData: TourData;
}

export function StoreSectionSelector({ selectedSection, onSectionSelect, tourData }: StoreSectionSelectorProps) {
    // Extract stores and sections from tour data
    const storesWithSections = tourData.scenes
        .map((scene) => ({
            id: scene.id,
            name: scene.name,
            sections: scene.infoSpots
                .filter((spot) => spot.action.modalType === "products-list")
                .map((spot) => ({
                    id: spot.action.id!,
                    title: spot.title,
                    text: spot.text,
                })),
        }))
        .filter((store) => store.sections.length > 0);

    return (
        <div className="p-4 lg:p-6">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Select Store & Section</h2>

            {storesWithSections.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No stores with product sections found.</p>
                </div>
            ) : (
                <div className="grid gap-4 lg:gap-6">
                    {storesWithSections.map((store) => (
                        <Card key={store.id} className="border-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                                    <Store className="h-4 w-4 lg:h-5 lg:w-5" />
                                    {store.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 lg:gap-3">
                                    {store.sections.map((section) => (
                                        <Button
                                            key={section.id}
                                            variant={selectedSection === section.id ? "default" : "outline"}
                                            className="justify-start h-auto p-3 lg:p-4 text-left"
                                            onClick={() => onSectionSelect(section.id, store.name, section.title)}
                                        >
                                            <div className="w-full">
                                                <div className="flex items-start gap-2 mb-1">
                                                    <MapPin className="h-3 w-3 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0" />
                                                    <span className="font-medium text-sm lg:text-base break-words">
                                                        {section.title}
                                                    </span>
                                                </div>
                                                <p className="text-xs lg:text-sm text-gray-600 ml-5 lg:ml-6 break-words">
                                                    {section.text}
                                                </p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
