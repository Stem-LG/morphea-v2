"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryImageHeaderProps {
    category: {
        xcategprodid: number;
        xcategprodintitule: string;
        media?: {
            ymediaurl: string;
            ymediaintitule?: string;
        } | null;
    };
    onBack: () => void;
}

export function CategoryImageHeader({ category, onBack }: CategoryImageHeaderProps) {
    return (
        <div className="relative">
            {/* Back button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0"
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Category image or fallback */}
            {category.media?.ymediaurl ? (
                <div className="relative h-48 w-full">
                    <img
                        src={category.media.ymediaurl}
                        alt={category.media.ymediaintitule || category.xcategprodintitule}
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Category title overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                            {category.xcategprodintitule}
                        </h2>
                    </div>
                </div>
            ) : (
                <div className="relative h-48 w-full bg-gradient-to-br from-morpheus-blue-dark to-morpheus-blue-light flex items-center justify-center">
                    {/* Fallback design when no image */}
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                                {category.xcategprodintitule.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {category.xcategprodintitule}
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
}
