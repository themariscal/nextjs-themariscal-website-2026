'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Artist } from '@/data/dummy/artist-data';
import { ArtistImage } from '@/components/ui/artist-image';

interface ArtistRightSidebarProps {
    artist: Artist;
    className?: string;
}

export function ArtistRightSidebar({ artist, className }: ArtistRightSidebarProps) {
    return (
        <div className={cn(
            'w-80 bg-background border-l border-border flex flex-col h-full',
            className
        )}>
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Current Track */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tus me gusta</h3>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-muted-foreground">kapang</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{artist.topTrack.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{artist.topTrack.artist}</div>
                            </div>
                            {artist.topTrack.isLiked && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* About Artist */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Acerca del artista</h3>

                        <div className="space-y-4">
                            <ArtistImage
                                src={artist.profileImage}
                                alt={artist.displayName}
                                name={artist.displayName}
                                width={80}
                                height={80}
                                className="w-20 h-20"
                            />

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg">{artist.displayName}</h4>
                                    {artist.verified && (
                                        <Check className="w-4 h-4 text-primary" />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {artist.monthlyListeners} oyentes mensuales
                                </p>

                                <Button
                                    variant={artist.isFollowing ? "outline" : "default"}
                                    size="sm"
                                    className={cn(
                                        "w-full mb-3",
                                        !artist.isFollowing && "bg-primary hover:bg-primary/90"
                                    )}
                                >
                                    {artist.isFollowing ? "Siguiendo" : "Seguir"}
                                </Button>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {artist.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Credits */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Créditos</h3>
                            <Button variant="ghost" size="sm" className="text-xs">
                                Mostrar todo
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {artist.credits.map((credit, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{credit.name}</p>
                                        <p className="text-xs text-muted-foreground">{credit.role}</p>
                                    </div>
                                    {index === 0 && (
                                        <Button size="sm" variant="outline" className="h-6 text-xs">
                                            Seguir
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
