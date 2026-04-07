"use client";

import React, { useState } from "react";
import { CategoryNavigation } from "./category-navigation";
import { mockCategories } from "@/data/dummy/dummy-videos-data";

export const TagList = () => {
    const [activeCategory, setActiveCategory] = useState('all')
    const [categories, setCategories] = useState(mockCategories)

    const handleCategoryChange = (categoryId: string) => {
        setActiveCategory(categoryId)
        setCategories(prev =>
            prev.map(cat => ({
                ...cat,
                isActive: cat.id === categoryId
            }))
        )
    }

    return (
        <>
            <div className="w-full">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
                    <div className="flex-shrink-0 w-0"></div>
                    <div className="mt-2">
                        <CategoryNavigation
                            categories={categories}
                            onCategoryChange={handleCategoryChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
