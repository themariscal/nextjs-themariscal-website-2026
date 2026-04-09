"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import Topbar from "@/components/layout/topbar";
import { AccountAppSidebar } from "@/components/layout/sidebars/account-app-sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isCoursesRoute = pathname.includes("/account/courses");

    return (
        <SidebarProvider>
            <Topbar />
            {!isCoursesRoute ? (
                <div className="pt-12">
                    <AccountAppSidebar />
                </div>
            ) : null}

            <main className="w-full">
                <div
                    className={cn(
                        "mt-20 w-full",
                        isCoursesRoute ? "max-w-none px-0" : "mx-auto max-w-3xl px-4"
                    )}
                >
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
