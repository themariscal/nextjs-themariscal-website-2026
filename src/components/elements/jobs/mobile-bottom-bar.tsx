"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MessageCircle,
    MoreHorizontal,
    Maximize2,
    ArrowUp,
    CheckCircle,
    X
} from "lucide-react";

interface MobileBottomBarProps {
    onMessage?: () => void;
    onMore?: () => void;
    onExpand?: () => void;
    onScrollTop?: () => void;
    notification?: {
        message: string;
        onDismiss?: () => void;
    };
}

export function MobileBottomBar({
    onMessage,
    onMore,
    onExpand,
    onScrollTop,
    notification
}: MobileBottomBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 lg:hidden">
            {/* Notification Banner */}
            {notification && (
                <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                            {notification.message}
                        </span>
                    </div>
                    {notification.onDismiss && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={notification.onDismiss}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            )}

            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4">
                    {/* Premium Badge */}
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs">
                        PREMIUM
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {/* Message Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={onMessage}
                    >
                        <MessageCircle className="h-5 w-5" />
                    </Button>

                    {/* More Options */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={onMore}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>

                    {/* Expand */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={onExpand}
                    >
                        <Maximize2 className="h-5 w-5" />
                    </Button>

                    {/* Scroll to Top */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={onScrollTop}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
