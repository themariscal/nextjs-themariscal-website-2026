'use client';

import React from 'react';
import { Track } from '@/lib/types/music';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Repeat,
    Shuffle,
    Volume2,
    VolumeX,
    List,
    Monitor,
    Maximize,
    Heart,
    Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NowPlayingBarProps {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    repeatMode: 'none' | 'one' | 'all';
    shuffleMode: boolean;
    onPlayPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onToggleRepeat: () => void;
    onToggleShuffle: () => void;
    onToggleLike: () => void;
    className?: string;
}

export function NowPlayingBar({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    shuffleMode,
    onPlayPause,
    onPrevious,
    onNext,
    onSeek,
    onVolumeChange,
    onToggleRepeat,
    onToggleShuffle,
    onToggleLike,
    className,
}: NowPlayingBarProps) {
    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!currentTrack) {
        return (
            <div className={cn(
                'h-20 bg-background border-t border-border',
                className
            )} />
        );
    }

    return (
        <div className={cn(
            'h-16 lg:h-20 bg-background border-t border-border px-2 lg:px-4 flex items-center justify-between',
            className
        )}>
            {/* Left: Track Info */}
            <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1 max-w-[30%]">
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    <img
                        src={currentTrack.album.image}
                        alt={currentTrack.album.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">
                            {currentTrack.name}
                        </h4>
                        {currentTrack.explicit && (
                            <span className="text-xs text-muted-foreground">E</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {currentTrack.artists.map(artist => artist.name).join(', ')}
                    </p>
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={onToggleLike}
                >
                    <Heart
                        className={cn(
                            'h-4 w-4',
                            currentTrack.isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                        )}
                    />
                </Button>
            </div>

            {/* Center: Player Controls */}
            <div className="flex flex-col items-center gap-1 lg:gap-2 flex-1 max-w-[40%]">
                {/* Control Buttons */}
                <div className="flex items-center gap-1 lg:gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={onToggleShuffle}
                    >
                        <Shuffle className={cn(
                            'h-4 w-4',
                            shuffleMode ? 'text-primary' : 'text-muted-foreground'
                        )} />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={onPrevious}
                    >
                        <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary hover:bg-primary/90"
                        onClick={onPlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                        )}
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={onNext}
                    >
                        <SkipForward className="h-4 w-4" />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={onToggleRepeat}
                    >
                        <Repeat className={cn(
                            'h-4 w-4',
                            repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'
                        )} />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {formatTime(currentTime)}
                    </span>

                    <div className="flex-1">
                        <Slider
                            value={[progressPercentage]}
                            onValueChange={([value]) => onSeek((value / 100) * duration)}
                            max={100}
                            step={0.1}
                            className="w-full"
                        />
                    </div>

                    <span className="text-xs text-muted-foreground w-10">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Right: Additional Controls */}
            <div className="hidden lg:flex items-center gap-1 min-w-0 flex-1 max-w-[30%] justify-end">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                >
                    <Mic className="h-4 w-4" />
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                >
                    <List className="h-4 w-4" />
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                >
                    <Monitor className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <div className="w-20">
                        <Slider
                            value={[volume]}
                            onValueChange={([value]) => onVolumeChange(value)}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                >
                    <Maximize className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
