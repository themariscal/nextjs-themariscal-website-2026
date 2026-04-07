"use client";

import { usePathname } from "next/navigation";
import { User2, Heart, Bell, Settings, Shield, CreditCard } from "lucide-react";

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

const accountItems = [
  {
    title: "Mi cuenta",
    icon: User2,
    url: "/account",
  },
  {
    title: "Mis favoritos",
    icon: Heart,
    url: "/account/favorites",
  },
  {
    title: "Notificaciones",
    icon: Bell,
    url: "/account/notifications",
  },
  {
    title: "Configuración",
    icon: Settings,
    url: "/account/settings",
  },
  {
    title: "Privacidad",
    icon: Shield,
    url: "/account/privacy",
  },
  {
    title: "Suscripción",
    icon: CreditCard,
    url: "/account/subscription",
  },
];

export function AccountAppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="mt-16">
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => {
                const isActive = pathname === item.url;

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
