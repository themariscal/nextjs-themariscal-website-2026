'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicSectionProps {
    title: string;
    subtitle?: string;
    showAllText?: string;
    onShowAll?: () => void;
    children: React.ReactNode;
    className?: string;
}

export function MusicSection({
    title,
    subtitle,
    showAllText = 'Mostrar todo',
    onShowAll,
    children,
    className,
}: MusicSectionProps) {
    return (
        <section className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight hover:underline cursor-pointer">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>

                {onShowAll && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium hover:underline"
                        onClick={onShowAll}
                    >
                        {showAllText}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="overflow-hidden">
                {children}
            </div>
        </section>
    );
}
