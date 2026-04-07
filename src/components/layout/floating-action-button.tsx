"use client";

import { MariscalFabDialog } from "@/components/dialogs/mariscal-fab-dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
    className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
    return (
        <MariscalFabDialog>
            <button
                className={cn(
                    "fixed bottom-20 right-6 z-50",
                    "w-14 h-14 rounded-full shadow-lg",
                    "bg-primary hover:bg-primary/90",
                    "flex items-center justify-center",
                    "transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    className
                )}
                aria-label="Abrir diálogo de Mariscal"
            >
                <Image
                    src="/android-chrome-192x192.png"
                    alt="The Mariscal Logo"
                    width={28}
                    height={28}
                    className="rounded-full"
                />
            </button>
        </MariscalFabDialog>
    );
}
