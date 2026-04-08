"use client";

import { usePathname } from "next/navigation";
import { User2, Image, Clapperboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Users",
    icon: User2,
    url: "/admin/users",
  },
  {
    title: "Images",
    icon: Image,
    url: "/admin/images/app",
  },
  {
    title: "Shorts",
    icon: Clapperboard,
    url: "/admin/shorts",
  },
];

export function AdminAppSidebar() {
  const pathname = usePathname();
  const matchesPath = (targetUrl: string) => pathname.includes(targetUrl);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="mt-16">
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = matchesPath(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={
                          isActive
                            ? "text-white font-semibold bg-primary/10"
                            : "text-muted-foreground hover:text-white"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
