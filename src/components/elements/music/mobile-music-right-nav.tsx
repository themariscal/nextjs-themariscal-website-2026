'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MusicRightSidebar } from './music-right-sidebar';
import { TrendingUp } from 'lucide-react';

interface MobileMusicRightNavProps {
    className?: string;
}

export function MobileMusicRightNav({ className }: MobileMusicRightNavProps) {
    return (
        <div className={className}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                        <TrendingUp className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                    <SheetTitle className="sr-only">Explorar música</SheetTitle>
                    <MusicRightSidebar />
                </SheetContent>
            </Sheet>
        </div>
    );
}
