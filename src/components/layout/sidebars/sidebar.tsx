"use client";

import { AppSidebarProps } from "@/lib/types/sidebar";
import { SidebarContent } from "@/components/layout/sidebar-content";

export function AppSidebar({ data, isCollapsed = false, onToggle, canToggle = true }: AppSidebarProps) {
  return (
    <SidebarContent
      data={data}
      isCollapsed={isCollapsed}
      onToggle={onToggle}
      canToggle={canToggle}
      isMobile={false}
    />
  );
}