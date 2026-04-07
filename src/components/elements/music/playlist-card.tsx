'use client';

import React from 'react';
import { Playlist } from '@/lib/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, MoreHorizontal, Music2, Users, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistCardProps {
    playlist: Playlist;
    onPlay?: (playlist: Playlist) => void;
    onMore?: (playlist: Playlist) => void;
    className?: string;
}

export function PlaylistCard({
    playlist,
    onPlay,
    onMore,
    className,
}: PlaylistCardProps) {
    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlay?.(playlist);
    };

    const handleMore = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMore?.(playlist);
    };

    return (
        <Card className={cn(
            'group hover:bg-accent/50 transition-colors cursor-pointer',
            className
        )}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Playlist Cover */}
                    <div className="relative">
                        <div className="aspect-square rounded-md bg-muted overflow-hidden">
                            <img
                                src={playlist.image}
                                alt={playlist.name}
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

                    {/* Playlist Info */}
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm leading-tight line-clamp-2">
                                {playlist.name}
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

                        {playlist.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {playlist.description}
                            </p>
                        )}

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground truncate">
                                {playlist.owner.name}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Music2 className="h-3 w-3" />
                                    <span>{playlist.totalTracks} canciones</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0"
                                >
                                    {playlist.isPublic ? 'Pública' : 'Privada'}
                                </Badge>
                                {playlist.isCollaborative && (
                                    <Badge variant="outline" className="text-xs px-2 py-0">
                                        <Users className="h-2 w-2 mr-1" />
                                        Colaborativa
                                    </Badge>
                                )}
                                {!playlist.isPublic && (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
