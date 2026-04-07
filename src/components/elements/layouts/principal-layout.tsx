"use client";

import React, { ReactNode } from "react";


import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export const PrincipalLayout = ({ hero, content, rightSidebar }: { hero?: ReactNode, content: ReactNode, rightSidebar?: ReactNode }) => {
    const { isCollapsed } = useSidebarStore();

    return <div className="w-full">
        {hero &&
            <div className={cn("w-full transition-normal duration-300", isCollapsed ? ' md:pl-24' : 'md:pl-64')}>
                {hero}
            </div>
        }
        <div className={cn("w-full transition-normal duration-300", isCollapsed ? 'md:pl-24' : 'md:pl-64')}>
            <section className="w-full">
                <div className="w-full flex max-w-6xl mx-auto">
                    <div className="flex-1">
                        {content}
                    </div>

                    {rightSidebar &&
                        <div className="hidden lg:block lg:w-90 xl:w-100 p-4 sticky top-20 self-start" style={{ height: 'calc(100vh - 80px)' }}>
                            {rightSidebar}
                        </div>
                    }
                </div>
            </section>
        </div>
    </div>
};