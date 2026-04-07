"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebars/sidebar";
import { appSidebarData } from "../../../data/sidebar-data";
import Topbar from "@/components/layout/topbar";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { MusicPlayer } from "@/components/elements/music/music-player";
import { FloatingActionButton } from "@/components/layout/floating-action-button";

export default function MainLayout({
    children,
    hideSidebar = false,
}: Readonly<{
    hideSidebar?: boolean;
    children: React.ReactNode;
}>) {
    const { isCollapsed, toggleSidebar, setCollapsed } = useSidebarStore();
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('mobile');
                setCollapsed(false); // Reset to default state
            } else if (width < 1024) {
                setScreenSize('tablet');
                setCollapsed(true); // Force collapsed on tablet
            } else {
                setScreenSize('desktop');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [setCollapsed]);

    const handleToggleSidebar = () => {
        // Only allow toggle on desktop
        if (screenSize === 'desktop') {
            console.log('Toggling sidebar from', isCollapsed, 'to', !isCollapsed);
            toggleSidebar();
        }
    };

    return (
        <SidebarProvider>
            <Topbar hideSidebar={hideSidebar} />

            {/* Sidebar - Hidden on mobile, when hideSidebar is true, collapsed on tablet, toggleable on desktop */}
            {screenSize !== 'mobile' && !hideSidebar && (
                <div className="fixed top-16 left-0 h-[calc(100vh-4rem-5rem)] z-50 transition-all duration-300">
                    <AppSidebar
                        data={appSidebarData}
                        isCollapsed={isCollapsed}
                        onToggle={handleToggleSidebar}
                        canToggle={screenSize === 'desktop'}
                    />
                </div>
            )}

            {/* Main content - adjusted for fixed music player */}
            <main className="w-full pb-20">
                <div className="w-full mt-20">
                    {children}
                </div>
            </main>

            {/* Fixed Music Player */}
            <MusicPlayer />

            {/* Floating Action Button */}
            <FloatingActionButton />
        </SidebarProvider>
    );
}
