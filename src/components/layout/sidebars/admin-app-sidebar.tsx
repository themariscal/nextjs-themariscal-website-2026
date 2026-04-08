"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Clapperboard, GraduationCap, Image, User2 } from "lucide-react";

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
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const academyItems = [
  {
    title: "Courses",
    url: "/admin/academy/courses",
  },
];

export function AdminAppSidebar() {
  const pathname = usePathname();
  const matchesPath = (targetUrl: string) => pathname.includes(targetUrl);
  const academyIsActive = academyItems.some((item) => matchesPath(item.url));

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

              <Collapsible
                defaultOpen={academyIsActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <GraduationCap className="h-4 w-4" />
                      <span>Academy</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {academyItems.map((academyItem) => (
                        <SidebarMenuSubItem key={academyItem.title}>
                          <a
                            href={academyItem.url}
                            className={
                              matchesPath(academyItem.url)
                                ? "text-white font-semibold"
                                : ""
                            }
                          >
                            {academyItem.title}
                          </a>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
