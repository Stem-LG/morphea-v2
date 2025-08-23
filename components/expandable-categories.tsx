"use client";

import { useState } from 'react';

interface CategoryData {
    image: string;
    title: string;
    subtitle?: string;
    link?: string;
}

interface CategoriesData {
    category1: CategoryData;
    category2: CategoryData;
    category3: CategoryData;
}

interface ExpandableCategoriesProps {
    data: CategoriesData;
}

export default function ExpandableCategories({ data }: ExpandableCategoriesProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const categories = [data.category1, data.category2, data.category3];

    const getCardStyles = (index: number) => {
        // Base rotation and position for stacked cards
        const baseRotations = [-3, 0, 3]; // degrees for natural stacking
        const baseTranslations = [-30, 0, 30]; // slight offset when not expanded
        
        if (!isExpanded) {
            return {
                transform: `translateX(${baseTranslations[index]}px) rotate(${baseRotations[index]}deg) translateZ(${index * 10}px)`,
                zIndex: index === 1 ? 30 : 20 - index,
            };
        }
        
        // When expanded, spread all cards out
        const expandedTranslations = [-400, 0, 400]; // much wider spread
        return {
            transform: `translateX(${expandedTranslations[index]}px) rotate(${baseRotations[index]}deg) translateZ(${index * 10}px)`,
            zIndex: 20 + index,
        };
    };

    return (
        <section className="relative z-20 bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-teal-700 mb-6">
                        Nos Catégories
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explorez notre univers à travers trois piliers de l'élégance
                    </p>
                </div>
                
                <div 
                    className="relative flex justify-center items-center h-[800px] perspective-1000"
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                >
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="absolute w-96 h-[500px] cursor-pointer transition-all duration-700 ease-in-out preserve-3d"
                            style={getCardStyles(index)}
                        >
                            <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
                                <img 
                                    src={category.image} 
                                    alt={category.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors duration-300" />
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    <h3 className="text-2xl md:text-3xl font-serif font-medium text-white mb-2">
                                        {category.title}
                                    </h3>
                                    {category.subtitle && (
                                        <p className="text-sm text-white/90 mb-4">
                                            {category.subtitle}
                                        </p>
                                    )}
                                    {category.link && isExpanded && (
                                        <div className="opacity-0 animate-[fadeIn_0.5s_0.3s_both]">
                                            <a 
                                                href={category.link} 
                                                className="text-white underline font-medium hover:no-underline transition-all duration-300"
                                            >
                                                Découvrir
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}