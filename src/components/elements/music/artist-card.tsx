'use client';

import React from 'react';
import { Artist } from '@/lib/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtistCardProps {
    artist: Artist;
    onPlay?: (artist: Artist) => void;
    onMore?: (artist: Artist) => void;
    onFollow?: (artist: Artist) => void;
    isFollowing?: boolean;
    className?: string;
}

export function ArtistCard({
    artist,
    onPlay,
    onMore,
    onFollow,
    isFollowing = false,
    className,
}: ArtistCardProps) {
    const formatFollowers = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlay?.(artist);
    };

    const handleMore = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMore?.(artist);
    };

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFollow?.(artist);
    };

    return (
        <Card className={cn(
            'group hover:bg-accent/50 transition-colors cursor-pointer',
            className
        )}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Artist Image */}
                    <div className="relative">
                        <div className="aspect-square rounded-full bg-muted overflow-hidden">
                            <img
                                src={artist.image}
                                alt={artist.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
                                onClick={handlePlay}
                            >
                                <Play className="h-4 w-4 ml-0.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Artist Info */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <h3 className="font-medium text-sm leading-tight truncate">
                                    {artist.name}
                                </h3>
                                {artist.isVerified && (
                                    <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                onClick={handleMore}
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{formatFollowers(artist.followers)} oyentes mensuales</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {artist.genres.slice(0, 2).map((genre, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs px-2 py-0"
                                    >
                                        {genre}
                                    </Badge>
                                ))}
                                {artist.genres.length > 2 && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                        +{artist.genres.length - 2}
                                    </Badge>
                                )}
                            </div>

                            <Button
                                size="sm"
                                variant={isFollowing ? "secondary" : "default"}
                                className="w-full text-xs"
                                onClick={handleFollow}
                            >
                                {isFollowing ? 'Siguiendo' : 'Seguir'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
