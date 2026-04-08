"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";


interface ResponsiveDialogProps {
  title?: string;
  description?: string;
  content: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  centerContent?: boolean;
  fullscreen?: boolean;
  isExpanded?: boolean;
  contentClassName?: string;
}

export function ResponsiveDialog({
  title,
  description,
  content,
  children,
  isOpen,
  setIsOpen,
  centerContent = false,
  fullscreen = false,
  isExpanded = false,
  contentClassName,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={fullscreen ? `m-0 rounded-none transition-all duration-300 flex flex-col ${isExpanded ? "max-w-[100vw] w-[100vw] max-h-[80vh] h-[80vh]" : "max-w-[65vw] w-[65vw] max-h-[40vh] h-[40vh]"}` : contentClassName ?? "sm:max-w-[425px]"}>
          <DialogHeader
            className={
              fullscreen || !title
                ? "sr-only"
                : centerContent
                  ? "text-center sm:text-center "
                  : "text-left sm:text-left "
            }
          >
            <DialogTitle>{title ?? ""}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={fullscreen ? `transition-all duration-300 ${isExpanded ? "h-[80vh]" : "h-[40vh]"}` : ""}>
        {!fullscreen && (
          <DrawerHeader className={centerContent ? "text-center " : "text-left "}>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        {fullscreen ? (
          content
        ) : (
          <div className="w-full flex justify-center">
            <div className="px-4 max-w-[500px] w-full flex flex-col items-center justify-center">
              {content}
            </div>
          </div>
        )}
        {!fullscreen && <DrawerFooter className="h-16" />}
      </DrawerContent>
    </Drawer>
  );
}
