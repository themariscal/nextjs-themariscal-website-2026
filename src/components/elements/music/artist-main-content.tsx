'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Play,
    Shuffle,
    MoreHorizontal,
    Check,
    Music2,
    Disc3,
    Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Artist } from '@/data/dummy/artist-data';
import { useMusicStore } from '@/lib/stores/music-store';
import { ArtistImage } from '@/components/ui/artist-image';
import { AlbumCover } from '@/components/ui/album-cover';

interface ArtistMainContentProps {
    artist: Artist;
    className?: string;
}

export function ArtistMainContent({ artist, className }: ArtistMainContentProps) {
    const { setCurrentTrack, setQueue, currentTrack } = useMusicStore();

    const popularTracks = artist.popularTracks || [
        { title: 'Abu Dhabi', plays: '6,274,038', duration: '2:29', isPlaying: false },
        { title: 'Forza', plays: '20,981,976', duration: '2:40', isPlaying: false },
        { title: 'Fantazija', plays: '21,931,284', duration: '2:24', isPlaying: true },
        { title: 'Urban Flow', plays: '15,234,567', duration: '2:55', isPlaying: false },
        { title: 'City Lights', plays: '8,765,432', duration: '3:12', isPlaying: false },
    ];

    // Convert popular tracks to Track format for the store
    const tracks = popularTracks.map((track, index) => ({
        id: `${artist.id}-${index}`,
        title: track.title,
        artist: artist.displayName,
        duration: track.duration,
        plays: track.plays,
        image: artist.profileImage,
        isLiked: false,
    }));

    const handleTrackDoubleClick = (track: any) => {
        setCurrentTrack(track);
        setQueue(tracks);
    };

    const releases = artist.releases || [
        { title: 'Urban Dreams', type: 'Álbum', year: '2024', image: '/images/albums/urban-dreams.jpg' },
        { title: 'City Vibes', type: 'EP', year: '2023', image: '/images/albums/city-vibes.jpg' },
        { title: 'Street Stories', type: 'Sencillo', year: '2023', image: '/images/albums/street-stories.jpg' },
    ];

    return (
        <div className={cn('flex-1 bg-background flex flex-col h-full', className)}>
            <ScrollArea className="flex-1">
                {/* Hero Section */}
                <div className="relative h-80 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${artist.backgroundImage})`,
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-8">
                        <div className="flex items-end justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        <Check className="w-3 h-3 mr-1" />
                                        Artista verificado
                                    </Badge>
                                </div>
                                <h1 className="text-6xl font-bold text-foreground mb-2">
                                    {artist.displayName}
                                </h1>
                                <p className="text-xl text-foreground/80">
                                    {artist.monthlyListeners} oyentes mensuales
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-6">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-6">
                                <Play className="w-5 h-5 mr-2" />
                                Reproducir
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-6">
                                <Shuffle className="w-5 h-5 mr-2" />
                                Aleatorio
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 px-6">
                                Seguir
                            </Button>
                            <Button size="lg" variant="outline" className="h-12 w-12 p-0">
                                <MoreHorizontal className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-8">
                    {/* Popular Tracks */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Popular</h2>
                        <div className="space-y-2">
                            {popularTracks.map((track, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
                                        currentTrack?.id === `${artist.id}-${index}` && "bg-accent/30"
                                    )}
                                    onDoubleClick={() => handleTrackDoubleClick(tracks[index])}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                                        {currentTrack?.id === `${artist.id}-${index}` ? (
                                            <Music2 className="w-4 h-4 text-primary" />
                                        ) : (
                                            <span className="text-sm font-medium">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                        <Music2 className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={cn(
                                            "font-medium truncate",
                                            currentTrack?.id === `${artist.id}-${index}` && "text-primary"
                                        )}>
                                            {track.title}
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {track.plays}
                                    </div>
                                    <div className="text-sm text-muted-foreground w-12 text-right">
                                        {track.duration}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button variant="ghost" className="text-sm">
                                Ver más
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Discography */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Discografía</h2>
                            <Button variant="ghost" className="text-sm">
                                Mostrar todo
                            </Button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 mb-6">
                            <Button variant="ghost" className="text-sm font-medium">
                                Lanzamientos populares
                            </Button>
                            <Button variant="ghost" className="text-sm">
                                Álbumes
                            </Button>
                            <Button variant="ghost" className="text-sm">
                                Sencillos y EP
                            </Button>
                        </div>

                        {/* Releases Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {releases.map((release, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="w-full aspect-square mb-3">
                                        <AlbumCover
                                            title={release.title}
                                            type={release.type}
                                            year={release.year}
                                            className="w-full h-full group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm truncate">{release.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {release.type} • {release.year}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
