'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Home,
    Search,
    Library,
    Plus,
    Heart,
    Music2,
    Download,
    ChevronRight,
    List,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicSidebarProps {
    className?: string;
}

export function MusicSidebar({ className }: MusicSidebarProps) {
    const navigationItems = [
        { icon: Home, label: 'Inicio', active: true },
        { icon: Search, label: 'Buscar', active: false },
        { icon: Library, label: 'Tu biblioteca', active: false },
    ];

    const libraryItems = [
        { icon: Plus, label: 'Crear playlist', action: true },
        { icon: Heart, label: 'Tus me gusta', count: '721 canciones' },
        { icon: Download, label: 'Tus episodios' },
    ];

    const playlists = [
        { name: 'Descubrimiento semanal', type: 'Playlist' },
        { name: 'El regreso', type: 'Álbum', artist: 'Andrés Calamaro' },
        { name: 'Lima', type: 'Álbum', artist: 'Kapanga' },
        { name: 'Cherry Poppin\' Daddies', type: 'Artista' },
        { name: 'Despertate', type: 'Álbum', artist: 'Rey Peón' },
        { name: 'La Pasión de San Miguel de Tucumán', type: 'Álbum', artist: 'San Miguel' },
        { name: 'Demonaco', type: 'Artista' },
        { name: 'La Union Verdadera', type: 'Álbum', artist: 'Resistencia Suburbana' },
        { name: 'El Acustico', type: 'Álbum', artist: 'Memphis La Blusera' },
        { name: 'Kapangstock', type: 'Álbum', artist: 'Kapanga' },
        { name: 'Worrrrssss!!!!', type: 'Álbum', artist: 'Resistencia Suburbana' },
        { name: 'Riviera Paradise', type: 'Playlist' },
        { name: 'Dummy', type: 'Álbum', artist: 'Portishead' },
        { name: 'Portishead', type: 'Artista' },
    ];

    return (
        <div className={cn(
            'w-64 bg-background border-r border-border flex flex-col h-full',
            className
        )}>
            {/* Logo */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">The Mariscal</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-3">
                <nav className="space-y-1">
                    {navigationItems.map((item) => (
                        <Button
                            key={item.label}
                            variant={item.active ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start gap-3 h-10',
                                item.active && 'bg-accent text-accent-foreground'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Button>
                    ))}
                </nav>
            </div>

            <Separator className="my-4" />

            {/* Library Section */}
            <div className="px-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-sm">Tu biblioteca</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Library Items */}
                <div className="space-y-1 mb-4">
                    {libraryItems.map((item) => (
                        <Button
                            key={item.label}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-8 text-sm"
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="truncate">{item.label}</span>
                            {item.count && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {item.count}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                <Separator className="mb-4" />

                {/* Playlists */}
                <ScrollArea className="flex-1">
                    <div className="space-y-1 pr-2">
                        {playlists.map((playlist, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start gap-3 h-8 text-sm hover:bg-accent/50"
                            >
                                <div className="w-4 h-4 bg-muted rounded-sm flex-shrink-0" />
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="truncate font-medium">{playlist.name}</div>
                                    {playlist.artist && (
                                        <div className="text-xs text-muted-foreground truncate">
                                            {playlist.type} • {playlist.artist}
                                        </div>
                                    )}
                                    {!playlist.artist && (
                                        <div className="text-xs text-muted-foreground">
                                            {playlist.type}
                                        </div>
                                    )}
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Recent Section */}
            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Recientes</span>
                </div>

                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-8 text-sm"
                    >
                        <List className="w-4 h-4" />
                        <span>Ver todo</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
