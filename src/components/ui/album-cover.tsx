'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AlbumCoverProps {
    title: string;
    type: string;
    year: string;
    className?: string;
}

export function AlbumCover({ title, type, year, className }: AlbumCoverProps) {
    // Generate a consistent color based on the title
    const getColorFromTitle = (title: string) => {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-red-500 to-pink-600',
            'from-green-500 to-teal-600',
            'from-yellow-500 to-orange-600',
            'from-indigo-500 to-blue-600',
            'from-purple-500 to-pink-600',
            'from-teal-500 to-green-600',
            'from-orange-500 to-red-600',
        ];

        const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const gradient = getColorFromTitle(title);

    // Get initials for the title
    const getInitials = (title: string) => {
        return title
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 3);
    };

    const initials = getInitials(title);

    return (
        <div className={cn('relative w-full h-full rounded-lg overflow-hidden', className)}>
            {/* Background gradient */}
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />

            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-3">
                {/* Top section - Type and year */}
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-xs font-medium text-white">
                            {type}
                        </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-xs font-medium text-white">
                            {year}
                        </span>
                    </div>
                </div>

                {/* Bottom section - Title */}
                <div className="bg-white/20 backdrop-blur-sm rounded p-2">
                    <div className="text-white font-bold text-sm leading-tight">
                        {title}
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full" />
            <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full" />
        </div>
    );
}
