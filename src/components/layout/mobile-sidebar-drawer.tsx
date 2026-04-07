"use client";

import { Menu } from "lucide-react";
import { AppSidebarProps } from "@/lib/types/sidebar";
import { SidebarContent } from "@/components/layout/sidebar-content";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

export function MobileSidebarDrawer({ data }: { data: AppSidebarProps['data'] }) {
    return (
        <Drawer direction="left">
            <DrawerTrigger asChild>
                <button
                    className="p-2 rounded-md hover:bg-muted/50 transition-colors border border-border/50 hover:border-border"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5 text-muted-foreground" />
                </button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-3/4 max-w-sm">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Menú de navegación</DrawerTitle>
                </DrawerHeader>
                <SidebarContent
                    data={data}
                    isCollapsed={false}
                    canToggle={false}
                    isMobile={true}
                />
            </DrawerContent>
        </Drawer>
    );
}
