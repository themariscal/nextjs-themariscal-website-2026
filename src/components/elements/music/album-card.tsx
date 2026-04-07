'use client';

import React from 'react';
import { Album } from '@/lib/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlbumCardProps {
    album: Album;
    onPlay?: (album: Album) => void;
    onMore?: (album: Album) => void;
    className?: string;
}

export function AlbumCard({
    album,
    onPlay,
    onMore,
    className,
}: AlbumCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.getFullYear().toString();
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlay?.(album);
    };

    const handleMore = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMore?.(album);
    };

    return (
        <Card className={cn(
            'group hover:bg-accent/50 transition-colors cursor-pointer',
            className
        )}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Album Cover */}
                    <div className="relative">
                        <div className="aspect-square rounded-md bg-muted overflow-hidden">
                            <img
                                src={album.image}
                                alt={album.name}
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

                    {/* Album Info */}
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm leading-tight line-clamp-2">
                                {album.name}
                            </h3>
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
                            <p className="text-xs text-muted-foreground truncate">
                                {album.artist.name}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(album.releaseDate)}</span>
                                </div>
                                <span>•</span>
                                <span>{album.totalTracks} canciones</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0"
                                >
                                    {album.type === 'album' ? 'Álbum' :
                                        album.type === 'single' ? 'Single' : 'Compilación'}
                                </Badge>
                                {album.artist.isVerified && (
                                    <Badge variant="outline" className="text-xs px-2 py-0">
                                        ✓ Verificado
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
