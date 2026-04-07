'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ArtistPlaceholderProps {
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function ArtistPlaceholder({ name, size = 'md', className }: ArtistPlaceholderProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base',
        xl: 'w-20 h-20 text-lg',
    };

    return (
        <div
            className={cn(
                'rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary',
                sizeClasses[size],
                className
            )}
        >
            {getInitials(name)}
        </div>
    );
}
