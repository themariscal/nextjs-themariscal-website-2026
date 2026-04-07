'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArtistPlaceholder } from './artist-placeholder';
import { cn } from '@/lib/utils';

interface ArtistImageProps {
    src: string;
    alt: string;
    name: string;
    width: number;
    height: number;
    className?: string;
    placeholder?: boolean;
}

export function ArtistImage({
    src,
    alt,
    name,
    width,
    height,
    className,
    placeholder = false
}: ArtistImageProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // If placeholder is requested or image failed to load, show placeholder
    if (placeholder || imageError) {
        const size = width <= 32 ? 'sm' : width <= 48 ? 'md' : width <= 64 ? 'lg' : 'xl';
        return (
            <ArtistPlaceholder
                name={name}
                size={size}
                className={className}
            />
        );
    }

    return (
        <div className={cn('relative overflow-hidden rounded-lg', className)}>
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <ArtistPlaceholder
                        name={name}
                        size={width <= 32 ? 'sm' : width <= 48 ? 'md' : width <= 64 ? 'lg' : 'xl'}
                    />
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    'w-full h-full object-cover transition-opacity duration-200',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />
        </div>
    );
}
