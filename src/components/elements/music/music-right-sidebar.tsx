'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Users,
    Calendar,
    TrendingUp,
    Star,
    Play,
    MoreHorizontal,
    Heart,
    Share2,
    Download,
    Check,
    Music,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { lisandroSkar, andresCalamaro, kapanga, Artist } from '@/data/dummy/artist-data';

interface MusicRightSidebarProps {
    className?: string;
}

export function MusicRightSidebar({ className }: MusicRightSidebarProps) {
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

    const trendingArtists = [
        { id: 'lisandro-skar', name: 'Lisandro Skar', listeners: '374,369', image: '/images/artists/lisandro-skar.jpg', artist: lisandroSkar },
        { id: 'andres-calamaro', name: 'Andrés Calamaro', listeners: '1.2M', image: '/images/artists/calamaro.jpg', artist: andresCalamaro },
        { id: 'kapanga', name: 'El Mariscal', listeners: '892K', image: '/images/artists/kapanga.jpg', artist: kapanga },
        { id: 'rey-peon', name: 'Rey Peón', listeners: '456K', image: '/images/artists/rey-peon.jpg', artist: null },
        { id: 'resistencia-suburbana', name: 'Resistencia Suburbana', listeners: '678K', image: '/images/artists/resistencia.jpg', artist: null },
    ];

    const recentActivity = [
        { type: 'playlist', name: 'Descubrimiento semanal', time: '2 horas' },
        { type: 'album', name: 'El regreso', artist: 'Andrés Calamaro', time: '1 día' },
        { type: 'artist', name: 'El Mariscal', time: '3 días' },
        { type: 'playlist', name: 'Tus me gusta', time: '1 semana' },
    ];

    const friendsActivity = [
        { name: 'María', action: 'agregó a', item: 'Lima - El Mariscal', time: '1 hora' },
        { name: 'Carlos', action: 'está escuchando', item: 'Cherry Poppin\' Daddies', time: '2 horas' },
        { name: 'Ana', action: 'creó la playlist', item: 'Rock Nacional', time: '1 día' },
    ];

    return (
        <div className={cn(
            'w-80 bg-background border-l border-border flex flex-col h-full',
            className
        )}>
            {selectedArtist ? (
                // Artist Information View - Full Artist Page Content
                <>
                    {/* Hero Section with Background */}
                    <div className="relative h-48 overflow-hidden">
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${selectedArtist.backgroundImage})`,
                                filter: 'blur(20px) brightness(0.3)',
                                transform: 'scale(1.1)'
                            }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-end p-4">
                            <div className="flex items-end justify-between">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-foreground mb-1">
                                        {selectedArtist.topTrack.title}
                                    </h1>
                                    <p className="text-lg text-foreground/80">
                                        {selectedArtist.topTrack.artist}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedArtist.topTrack.isLiked && (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {/* About Artist Section */}
                            <div>
                                <h2 className="text-xl font-bold mb-4">Acerca del artista</h2>

                                <div className="flex gap-4">
                                    {/* Artist Profile Image */}
                                    <div className="flex-shrink-0">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                                            <Image
                                                src={selectedArtist.profileImage}
                                                alt={selectedArtist.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Artist Info */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold">{selectedArtist.displayName}</h3>
                                                {selectedArtist.verified && (
                                                    <Check className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {selectedArtist.monthlyListeners} oyentes mensuales
                                            </p>
                                        </div>

                                        <Button
                                            variant={selectedArtist.isFollowing ? "outline" : "default"}
                                            size="sm"
                                            className="w-fit"
                                        >
                                            {selectedArtist.isFollowing ? "Siguiendo" : "Seguir"}
                                        </Button>

                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {selectedArtist.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1">
                                            {selectedArtist.genres.map((genre, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {genre}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>{selectedArtist.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Music className="w-3 h-3" />
                                                <span>Artista</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Credits Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Créditos</h2>
                                    <Button variant="ghost" size="sm">
                                        Mostrar todo
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {selectedArtist.credits.map((credit, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                            <div>
                                                <p className="font-medium text-sm">{credit.name}</p>
                                                <p className="text-xs text-muted-foreground">{credit.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Reproducir
                                </Button>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    Me gusta
                                </Button>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Compartir
                                </Button>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </>
            ) : (
                // Default Explore View
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">Explorar</h2>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            {/* Trending Artists */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Artistas en tendencia</h3>
                                </div>

                                <div className="space-y-3">
                                    {trendingArtists.map((artist, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => artist.artist && setSelectedArtist(artist.artist)}
                                        >
                                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{artist.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {artist.listeners} oyentes mensuales
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-8">
                                                Seguir
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Recent Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Actividad reciente</h3>
                                </div>

                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                                {activity.type === 'playlist' && <Play className="w-5 h-5 text-muted-foreground" />}
                                                {activity.type === 'album' && <Star className="w-5 h-5 text-muted-foreground" />}
                                                {activity.type === 'artist' && <User className="w-5 h-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{activity.name}</div>
                                                {activity.artist && (
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {activity.artist}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground">
                                                    {activity.time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Friends Activity */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Amigos</h3>
                                </div>

                                <div className="space-y-3">
                                    {friendsActivity.map((friend, index) => (
                                        <div key={index} className="p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-medium text-primary-foreground">
                                                        {friend.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm">
                                                        <span className="font-medium">{friend.name}</span>
                                                        <span className="text-muted-foreground"> {friend.action} </span>
                                                        <span className="font-medium">{friend.item}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {friend.time}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Quick Actions */}
                            <div>
                                <h3 className="font-semibold mb-4">Acciones rápidas</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="h-10">
                                        <Heart className="w-4 h-4 mr-2" />
                                        Favoritos
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10">
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Compartir
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10">
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10">
                                        <Play className="w-4 h-4 mr-2" />
                                        Reproducir
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </>
            )}
        </div>
    );
}
