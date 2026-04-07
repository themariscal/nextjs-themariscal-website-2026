"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    List,
    Briefcase,
    BarChart3,
    Plus,
    Settings,
    Heart,
    Bell,
    Shield,
    CreditCard
} from "lucide-react";

interface SidebarNavigationProps {
    onNavigate?: (path: string) => void;
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
    const navigationItems = [
        {
            icon: List,
            label: "Preferences",
            path: "/jobs/preferences"
        },
        {
            icon: Briefcase,
            label: "My jobs",
            path: "/jobs/my-jobs"
        },
        {
            icon: BarChart3,
            label: "My Career Insights",
            path: "/jobs/insights"
        }
    ];

    const accountItems = [
        {
            icon: Settings,
            label: "Settings",
            path: "/account/settings"
        },
        {
            icon: Heart,
            label: "Favorites",
            path: "/account/favorites"
        },
        {
            icon: Bell,
            label: "Notifications",
            path: "/account/notifications"
        },
        {
            icon: Shield,
            label: "Privacy",
            path: "/account/privacy"
        },
        {
            icon: CreditCard,
            label: "Subscription",
            path: "/account/subscription"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Navigation Items */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        {navigationItems.map((item) => (
                            <Button
                                key={item.path}
                                variant="ghost"
                                className="w-full justify-start h-10 px-3"
                                onClick={() => onNavigate?.(item.path)}
                            >
                                <item.icon className="h-4 w-4 mr-3" />
                                <span className="text-sm">{item.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Post Job Button */}
            <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Post a free job
            </Button>

            {/* Footer Links */}
            <div className="space-y-2 text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-2">
                    <button className="text-left hover:text-foreground transition-colors">
                        About
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Accessibility
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Help Center
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Privacy & Terms
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Ad Choices
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Advertising
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Business Services
                    </button>
                    <button className="text-left hover:text-foreground transition-colors">
                        Get the LinkedIn app
                    </button>
                </div>
                <div className="pt-2">
                    <button className="text-left hover:text-foreground transition-colors">
                        More
                    </button>
                </div>
            </div>

            {/* LinkedIn Footer */}
            <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">in</span>
                    </div>
                    <span>LinkedIn Corporation © 2025</span>
                </div>
            </div>
        </div>
    );
}
