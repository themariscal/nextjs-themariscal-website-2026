'use client';

import React, { useState } from 'react';
import { Track, Album, Artist, Playlist } from '@/lib/types/music';
import { MusicSection } from './music-section';
import { TrackCard } from './track-card';
import { AlbumCard } from './album-card';
import { ArtistCard } from './artist-card';
import { PlaylistCard } from './playlist-card';
import { NowPlayingBar } from './now-playing-bar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface MusicPageProps {
    recentlyPlayed: Track[];
    madeForYou: Playlist[];
    categories: Array<{
        id: string;
        name: string;
        description?: string;
        image: string;
        color: string;
        tracks?: Track[];
        playlists?: Playlist[];
        artists?: Artist[];
    }>;
    newReleases: Album[];
    popularArtists: Artist[];
    className?: string;
}

export function MusicPage({
    recentlyPlayed,
    madeForYou,
    categories,
    newReleases,
    popularArtists,
    className,
}: MusicPageProps) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(recentlyPlayed[0] || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
    const [shuffleMode, setShuffleMode] = useState(false);

    const handlePlayTrack = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        setDuration(track.duration);
        setCurrentTime(0);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handlePrevious = () => {
        // Implementation for previous track
    };

    const handleNext = () => {
        // Implementation for next track
    };

    const handleSeek = (time: number) => {
        setCurrentTime(time);
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
    };

    const handleToggleRepeat = () => {
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        setRepeatMode(modes[(currentIndex + 1) % modes.length]);
    };

    const handleToggleShuffle = () => {
        setShuffleMode(!shuffleMode);
    };

    const handleToggleLike = () => {
        if (currentTrack) {
            setCurrentTrack({
                ...currentTrack,
                isLiked: !currentTrack.isLiked,
            });
        }
    };

    const handlePlayAlbum = (album: Album) => {
        // Implementation for playing album
    };

    const handlePlayArtist = (artist: Artist) => {
        // Implementation for playing artist
    };

    const handlePlayPlaylist = (playlist: Playlist) => {
        // Implementation for playing playlist
    };

    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Main Content */}
            <ScrollArea className="flex-1">
                <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
                    {/* Recently Played */}
                    {recentlyPlayed.length > 0 && (
                        <MusicSection
                            title="Recientes"
                            subtitle="Canciones que escuchaste recientemente"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                {recentlyPlayed.slice(0, 6).map((track) => (
                                    <div key={track.id} className="space-y-2">
                                        <div className="aspect-square rounded-md bg-muted overflow-hidden">
                                            <img
                                                src={track.album.image}
                                                alt={track.album.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-medium text-sm line-clamp-2">
                                                {track.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {track.artists.map(artist => artist.name).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MusicSection>
                    )}

                    {/* Made for You */}
                    {madeForYou.length > 0 && (
                        <MusicSection
                            title="Hecho para ti"
                            subtitle="Playlists personalizadas basadas en tu música"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                {madeForYou.map((playlist) => (
                                    <PlaylistCard
                                        key={playlist.id}
                                        playlist={playlist}
                                        onPlay={handlePlayPlaylist}
                                    />
                                ))}
                            </div>
                        </MusicSection>
                    )}

                    {/* Categories */}
                    {categories.map((category) => (
                        <MusicSection
                            key={category.id}
                            title={category.name}
                            subtitle={category.description}
                            onShowAll={() => { }}
                        >
                            {category.artists && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                    {category.artists.map((artist) => (
                                        <ArtistCard
                                            key={artist.id}
                                            artist={artist}
                                            onPlay={handlePlayArtist}
                                        />
                                    ))}
                                </div>
                            )}

                            {category.albums && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                    {category.albums.map((album) => (
                                        <AlbumCard
                                            key={album.id}
                                            album={album}
                                            onPlay={handlePlayAlbum}
                                        />
                                    ))}
                                </div>
                            )}
                        </MusicSection>
                    ))}

                    {/* New Releases */}
                    {newReleases.length > 0 && (
                        <MusicSection
                            title="Lanzamientos recientes"
                            subtitle="Los últimos álbumes y singles"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                {newReleases.map((album) => (
                                    <AlbumCard
                                        key={album.id}
                                        album={album}
                                        onPlay={handlePlayAlbum}
                                    />
                                ))}
                            </div>
                        </MusicSection>
                    )}

                    {/* Popular Artists */}
                    {popularArtists.length > 0 && (
                        <MusicSection
                            title="Artistas populares"
                            subtitle="Los artistas más escuchados del momento"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                                {popularArtists.map((artist) => (
                                    <ArtistCard
                                        key={artist.id}
                                        artist={artist}
                                        onPlay={handlePlayArtist}
                                    />
                                ))}
                            </div>
                        </MusicSection>
                    )}
                </div>
            </ScrollArea>

            {/* Now Playing Bar */}
            <NowPlayingBar
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                repeatMode={repeatMode}
                shuffleMode={shuffleMode}
                onPlayPause={handlePlayPause}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleRepeat={handleToggleRepeat}
                onToggleShuffle={handleToggleShuffle}
                onToggleLike={handleToggleLike}
            />
        </div>
    );
}
