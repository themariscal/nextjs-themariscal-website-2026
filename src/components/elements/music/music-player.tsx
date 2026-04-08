'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Volume2,
    Mic,
    List,
    Monitor,
    Maximize,
    Heart,
    ChevronDown,
    ChevronUp,
    Music2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicStore } from '@/lib/stores/music-store';
import { ArtistImage } from '@/components/ui/artist-image';

interface MusicPlayerProps {
    className?: string;
}

export function MusicPlayer({ className }: MusicPlayerProps) {
    const {
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        isPlayerCollapsed,
        isShuffled,
        isRepeated,
        togglePlayPause,
        setVolume,
        setCurrentTime,
        nextTrack,
        previousTrack,
        toggleShuffle,
        toggleRepeat,
        togglePlayerCollapsed
    } = useMusicStore();

    // Format time helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle progress change
    const handleProgressChange = (value: number[]) => {
        const newTime = (value[0] / 100) * duration;
        setCurrentTime(newTime);
    };

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
    };

    return (
        <div className={cn(
            'fixed bottom-0 left-0 right-0 z-50 overflow-visible',
            className
        )}>
            <div
                className={cn(
                    'absolute left-1/2 z-10 -translate-x-1/2 transition-all duration-300 ease-out',
                    isPlayerCollapsed
                        ? 'bottom-0 translate-y-0'
                        : 'top-0 -translate-y-[calc(100%-1px)]'
                )}
            >
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                        'h-9 min-w-36 rounded-t-xl rounded-b-none border-b-0 bg-background/95 px-5 shadow-md backdrop-blur-md',
                        'inline-flex items-center justify-center gap-2'
                    )}
                    onClick={togglePlayerCollapsed}
                    aria-label={isPlayerCollapsed ? 'Mostrar reproductor de musica' : 'Ocultar reproductor de musica'}
                >
                    {isPlayerCollapsed && <Music2 className="h-4 w-4" />}
                    {isPlayerCollapsed ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div
                className={cn(
                    'h-20 border-t border-border/50 bg-background/80 px-4 backdrop-blur-md transition-transform duration-300 ease-out',
                    'flex items-center justify-between',
                    isPlayerCollapsed && 'translate-y-full pointer-events-none'
                )}
            >
            {/* Left Section - Track Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {currentTrack ? (
                    <>
                        <ArtistImage
                            src={currentTrack.image || ''}
                            alt={currentTrack.title}
                            name={currentTrack.title}
                            width={56}
                            height={56}
                            className="w-14 h-14 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 flex-shrink-0"
                                >
                                    <Heart className={cn(
                                        "w-4 h-4",
                                        currentTrack.isLiked ? "text-red-500 fill-current" : "text-muted-foreground"
                                    )} />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-muted-foreground">No hay canción seleccionada</h4>
                            <p className="text-xs text-muted-foreground">Selecciona una canción para reproducir</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Center Section - Playback Controls */}
            <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={toggleShuffle}
                    >
                        <Shuffle className={cn(
                            "w-4 h-4",
                            isShuffled ? "text-primary" : "text-muted-foreground"
                        )} />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={previousTrack}
                    >
                        <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        className="h-10 w-10 p-0 bg-primary hover:bg-primary/90"
                        onClick={togglePlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5 ml-0.5" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={nextTrack}
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={toggleRepeat}
                    >
                        <Repeat className={cn(
                            "w-4 h-4",
                            isRepeated ? "text-primary" : "text-muted-foreground"
                        )} />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {currentTrack ? formatTime(currentTime) : "0:00"}
                    </span>
                    <Slider
                        value={currentTrack && duration > 0 ? [(currentTime / duration) * 100] : [0]}
                        onValueChange={handleProgressChange}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={!currentTrack}
                    />
                    <span className="text-xs text-muted-foreground w-10">
                        {currentTrack ? formatTime(duration) : "0:00"}
                    </span>
                </div>
            </div>

            {/* Right Section - Additional Controls */}
            <div className="flex items-center gap-2 flex-1 justify-end">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <List className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-20"
                    />
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Maximize className="w-4 h-4 text-muted-foreground" />
                </Button>
            </div>
            </div>
        </div>
    );
}
