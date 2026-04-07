'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MusicSidebar } from './music-sidebar';
import { Menu, Music2 } from 'lucide-react';

interface MobileMusicNavProps {
    className?: string;
}

export function MobileMusicNav({ className }: MobileMusicNavProps) {
    return (
        <div className={className}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navegación de música</SheetTitle>
                    <MusicSidebar />
                </SheetContent>
            </Sheet>
        </div>
    );
}
