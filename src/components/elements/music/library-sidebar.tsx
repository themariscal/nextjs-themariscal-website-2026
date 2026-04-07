'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Maximize2,
    Search,
    List,
    Heart,
    Download,
    Music2,
    User,
    Disc3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibrarySidebarProps {
    className?: string;
}

export function LibrarySidebar({ className }: LibrarySidebarProps) {
    const libraryItems = [
        { type: 'playlist', title: 'Tus me gusta', subtitle: 'Playlist • 721 canciones', icon: Heart },
        { type: 'playlist', title: 'Tus episodios', subtitle: 'Playlist', icon: Download },
        { type: 'playlist', title: 'Descubrimiento semanal', subtitle: 'Playlist', icon: Music2 },
        { type: 'album', title: 'El regreso', subtitle: 'Álbum • Andrés Calamaro', icon: Disc3 },
        { type: 'album', title: 'Lima', subtitle: 'Álbum • Kapanga', icon: Disc3 },
        { type: 'artist', title: 'Cherry Poppin\' Daddies', subtitle: 'Artista', icon: User },
        { type: 'album', title: 'Despertate', subtitle: 'Álbum • Rey Peón', icon: Disc3 },
        { type: 'album', title: 'La Pasión de San Miguel de Tucumán', subtitle: 'Álbum • San Miguel', icon: Disc3 },
        { type: 'artist', title: 'Demonaco', subtitle: 'Artista', icon: User },
        { type: 'album', title: 'La Union Verdadera', subtitle: 'Álbum • Resistencia Suburbana', icon: Disc3 },
        { type: 'album', title: 'El Acustico', subtitle: 'Álbum • Memphis La Blusera', icon: Disc3 },
        { type: 'album', title: 'Kapangstock', subtitle: 'Álbum • Kapanga', icon: Disc3 },
        { type: 'playlist', title: 'Riviera Paradise', subtitle: 'Playlist', icon: Music2 },
        { type: 'album', title: 'Dummy', subtitle: 'Álbum • Portishead', icon: Disc3 },
        { type: 'artist', title: 'Portishead', subtitle: 'Artista', icon: User },
    ];

    return (
        <div className={cn(
            'w-64 bg-background border-r border-border flex flex-col h-full',
            className
        )}>
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Tu biblioteca</h2>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="sm" className="text-sm">
                        Playlists
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm">
                        Artistas
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm">
                        Álbumes
                    </Button>
                    <Button variant="ghost" size="sm" className="text-sm">
                        Podcasts y
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Buscar en tu biblioteca"
                            className="pl-10 h-8 text-sm"
                        />
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <List className="w-4 h-4" />
                    </Button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                        Recientes
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Library Items */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-1">
                    {libraryItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.title}</div>
                                <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
