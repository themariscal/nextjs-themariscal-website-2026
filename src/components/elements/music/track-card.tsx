'use client';

import React from 'react';
import { Track } from '@/lib/types/music';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackCardProps {
    track: Track;
    isPlaying?: boolean;
    onPlay?: (track: Track) => void;
    onPause?: () => void;
    onLike?: (track: Track) => void;
    showAlbum?: boolean;
    showDuration?: boolean;
    className?: string;
}

export function TrackCard({
    track,
    isPlaying = false,
    onPlay,
    onPause,
    onLike,
    showAlbum = true,
    showDuration = true,
    className,
}: TrackCardProps) {
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            onPause?.();
        } else {
            onPlay?.(track);
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLike?.(track);
    };

    return (
        <Card className={cn(
            'group hover:bg-accent/50 transition-colors cursor-pointer',
            isPlaying && 'bg-primary/10 border-primary/20',
            className
        )}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Album/Artist Image */}
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden">
                            <img
                                src={track.album.image}
                                alt={track.album.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Play/Pause Button Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4 ml-0.5" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                                'font-medium truncate',
                                isPlaying ? 'text-primary' : 'text-foreground'
                            )}>
                                {track.name}
                            </h3>
                            {track.explicit && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                    E
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">
                                {track.artists.map(artist => artist.name).join(', ')}
                            </span>
                            {showAlbum && (
                                <>
                                    <span>•</span>
                                    <span className="truncate">{track.album.name}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Duration */}
                    {showDuration && (
                        <div className="flex-shrink-0 text-sm text-muted-foreground">
                            {formatDuration(track.duration)}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={handleLike}
                        >
                            <Heart
                                className={cn(
                                    'h-4 w-4',
                                    track.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                                )}
                            />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
