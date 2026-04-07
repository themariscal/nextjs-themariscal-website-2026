'use client';

import React from 'react';
import { LibrarySidebar } from './library-sidebar';
import { ArtistMainContent } from './artist-main-content';
import { ArtistRightSidebar } from './artist-right-sidebar';
import { cn } from '@/lib/utils';
import { Artist } from '@/data/dummy/artist-data';

interface ArtistPageLayoutProps {
    artist: Artist;
    className?: string;
}

export function ArtistPageLayout({ artist, className }: ArtistPageLayoutProps) {
    return (
        <div className={cn('flex h-[calc(100vh-5rem)] bg-background', className)}>
            {/* Left Sidebar - Library */}
            <LibrarySidebar className="hidden lg:flex" />

            {/* Main Content - Artist Page */}
            <ArtistMainContent artist={artist} />

            {/* Right Sidebar - Artist Info */}
            <ArtistRightSidebar artist={artist} className="hidden xl:flex" />
        </div>
    );
}
