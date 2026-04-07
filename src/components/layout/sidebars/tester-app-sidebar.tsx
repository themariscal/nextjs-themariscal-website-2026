"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, User2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const items = [
  {
    title: "Pruebas",
    icon: User2,
    subitems: [
      { title: "Reveneu Cat", url: "/tester/reveneucat" },
      { title: "Hook Purchase", url: "/tester/hookpurchase" },
      { title: "Feature Flags", url: "/tester/feature-flags" },
      { title: "Stripe", url: "/tester/stripe" },
    ],
  },
];

export function TesterAppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="mt-16">
          <SidebarGroupLabel>Tester</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.subitems.some((sub) =>
                  pathname.startsWith(sub.url)
                );

                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subitems.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.title}>
                              <a
                                href={subitem.url}
                                className={
                                  pathname === subitem.url
                                    ? "text-white font-semibold"
                                    : ""
                                }
                              >
                                {subitem.title}
                              </a>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
