'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Heart,
    Share2,
    MoreHorizontal,
    Play,
    Shuffle,
    Check,
    User,
    Music,
    Calendar,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Artist {
    id: string;
    name: string;
    displayName: string;
    monthlyListeners: string;
    description: string;
    backgroundImage: string;
    profileImage: string;
    isFollowing: boolean;
    topTrack: {
        title: string;
        artist: string;
        isLiked: boolean;
    };
    credits: {
        role: string;
        name: string;
    }[];
    genres: string[];
    location: string;
    verified: boolean;
}

interface ArtistPageProps {
    artist: Artist;
    className?: string;
}

export function ArtistPage({ artist, className }: ArtistPageProps) {
    return (
        <div className={cn('h-full bg-background', className)}>
            <ScrollArea className="h-full">
                {/* Hero Section with Background */}
                <div className="relative h-80 overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${artist.backgroundImage})`,
                            filter: 'blur(20px) brightness(0.3)',
                            transform: 'scale(1.1)'
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-6">
                        <div className="flex items-end justify-between">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold text-white mb-2">
                                    {artist.topTrack.title}
                                </h1>
                                <p className="text-xl text-white/80">
                                    {artist.topTrack.artist}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {artist.topTrack.isLiked && (
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-8">
                    {/* About Artist Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Acerca del artista</h2>

                        <div className="flex gap-6">
                            {/* Artist Profile Image */}
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                                    <Image
                                        src={artist.profileImage}
                                        alt={artist.name}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Artist Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold">{artist.displayName}</h3>
                                        {artist.verified && (
                                            <Check className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <p className="text-muted-foreground">
                                        {artist.monthlyListeners} oyentes mensuales
                                    </p>
                                </div>

                                <Button
                                    variant={artist.isFollowing ? "outline" : "default"}
                                    className="w-fit"
                                >
                                    {artist.isFollowing ? "Siguiendo" : "Seguir"}
                                </Button>

                                <p className="text-muted-foreground leading-relaxed">
                                    {artist.description}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {artist.genres.map((genre, index) => (
                                        <Badge key={index} variant="secondary">
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        <span>{artist.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Music className="w-4 h-4" />
                                        <span>Artista</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Credits Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Créditos</h2>
                            <Button variant="ghost" size="sm">
                                Mostrar todo
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {artist.credits.map((credit, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors">
                                    <div>
                                        <p className="font-medium">{credit.name}</p>
                                        <p className="text-sm text-muted-foreground">{credit.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <Button size="lg" className="flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            Reproducir
                        </Button>
                        <Button variant="outline" size="lg" className="flex items-center gap-2">
                            <Shuffle className="w-5 h-5" />
                            Aleatorio
                        </Button>
                        <Button variant="outline" size="lg" className="flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            Me gusta
                        </Button>
                        <Button variant="outline" size="lg" className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Compartir
                        </Button>
                        <Button variant="outline" size="lg">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
