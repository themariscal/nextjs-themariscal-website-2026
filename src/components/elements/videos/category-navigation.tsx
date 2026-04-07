"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import { Category } from '@/lib/types/videos'



interface CategoryNavigationProps {
    categories: Category[]
    onCategoryChange?: (categoryId: string) => void
    className?: string
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
    categories,
    onCategoryChange,
    className = ''
}) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={category.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => onCategoryChange?.(category.id)}
                        className={`
              shrink-0 whitespace-nowrap transition-all duration-200
              ${category.isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'hover:bg-accent hover:text-accent-foreground border-border'
                            }
              ${category.isLive ? 'border-red-500 text-red-600 dark:text-red-400' : ''}
            `}
                    >
                        <span className="flex items-center gap-2">
                            {category.name}
                            {category.isLive && (
                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                            {category.badge && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-0"
                                >
                                    {category.badge}
                                </Badge>
                            )}
                        </span>
                    </Button>
                ))}

                {/* Show More Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 hover:bg-accent"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
