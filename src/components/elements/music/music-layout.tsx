'use client';

import React from 'react';
import { MusicSidebar } from './music-sidebar';
import { MusicRightSidebar } from './music-right-sidebar';
import { MusicPage } from './music-page';
import { MobileMusicNav } from './mobile-music-nav';
import { MobileMusicRightNav } from './mobile-music-right-nav';
import { featuredContent } from '@/data/dummy/dummy-music-data';
import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicLayoutProps {
    className?: string;
}

export function MusicLayout({ className }: MusicLayoutProps) {
    return (
        <div className={cn('flex h-full bg-background', className)}>
            {/* Desktop Left Sidebar */}
            <MusicSidebar className="hidden lg:flex" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Navigation */}
                <div className="lg:hidden p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <MobileMusicNav />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Music2 className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <span className="font-bold">The Mariscal</span>
                            </div>
                        </div>
                        <MobileMusicRightNav />
                    </div>
                </div>

                <MusicPage
                    recentlyPlayed={featuredContent.recentlyPlayed.map(rp => rp.track)}
                    madeForYou={featuredContent.madeForYou}
                    categories={featuredContent.categories}
                    newReleases={featuredContent.newReleases}
                    popularArtists={featuredContent.popularArtists}
                />
            </div>

            {/* Desktop Right Sidebar */}
            <MusicRightSidebar className="hidden lg:flex" />
        </div>
    );
}
