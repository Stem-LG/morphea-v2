'use client'

import { useState } from 'react'

interface CategoryData {
    image: string
    title: string
    subtitle?: string
    link?: string
}

interface CategoriesData {
    category1: CategoryData
    category2: CategoryData
    category3: CategoryData
}

interface ExpandableCategoriesProps {
    data: CategoriesData
}

export default function ExpandableCategories({
    data,
}: ExpandableCategoriesProps) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const categories = [data.category1, data.category2, data.category3]

    const getCardStyles = (index: number) => {
        // Base rotation and position for stacked cards
        const baseRotations = [-5.67, 0, 5.67] // degrees for natural stacking
        const baseTranslations = [-30, 0, 30] // slight offset when not expanded

        if (!isExpanded) {
            return {
                transform: `translateX(${baseTranslations[index]}px) rotate(${baseRotations[index]}deg) translateZ(${index * 10}px)`,
                zIndex: index === 1 ? 30 : 10 - index,
            }
        }

        // When expanded, spread all cards out
        const expandedTranslations = [-460, 0, 460] // nice translations
        return {
            transform: `translateX(${expandedTranslations[index]}px) rotate(${baseRotations[index]}deg) translateZ(${index * 10}px)`,
            zIndex: 20 + index,
            scale: index == 1 ? 1 : 0.9,
        }
    }

    return (
        <section className="relative z-20 bg-white pt-24">
            <div className="mx-auto max-w-7xl px-8">
                <div className="mb-12 text-center">
                    <h2 className="font-recia mb-10 text-5xl font-extrabold text-[#053340]">
                        Nos Catégories
                    </h2>
                    <p className="font-supreme mx-auto max-w-2xl text-2xl text-gray-600">
                        {
                            "Explorez notre univers à travers trois piliers de l'élégance"
                        }
                    </p>
                </div>

                <div
                    className="relative flex h-[560px] items-start justify-center"
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                >
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="group preserve-3d absolute h-[500px] w-96 cursor-pointer transition-all duration-700 ease-in-out"
                            style={getCardStyles(index)}
                        >
                            <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src={category.image}
                                    alt={category.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 transition-colors duration-300 hover:bg-black/30" />
                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                    <h3 className="font-recia mb-2 text-center text-4xl font-medium text-white md:text-3xl">
                                        {category.title}
                                    </h3>
                                    {category.subtitle && (
                                        <p className="font-supreme mb-4 text-center text-xl text-white/90">
                                            {category.subtitle}
                                        </p>
                                    )}
                                    {category.link && isExpanded && (
                                        <div className="text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <a
                                                href={category.link}
                                                className="font-recia font-xl text-white underline transition-all duration-300 hover:no-underline"
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
    )
}
