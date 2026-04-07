"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebars/sidebar";
import { appSidebarData } from "../../../data/sidebar-data";
import Topbar from "@/components/layout/topbar";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export default function RootLayout({
  children,
}: Readonly<{
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
      {children}
    </SidebarProvider>
  );
}
