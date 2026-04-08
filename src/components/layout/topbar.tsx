"use client";

import React, { ComponentType, ReactNode, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { AccountSheet } from "@/components/layout/account-sheet";
import { CommandDialogGeneral } from "@/components/dialogs/command-dialog-general";
import { GetAppDialog } from "@/components/dialogs/get-app-dialog";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MobileSidebarDrawer } from "@/components/layout/mobile-sidebar-drawer";
import { appSidebarData } from "@/data/sidebar-data";

import { QrCode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";

import Image from "next/image";
import { getNavigationLinks } from "@/data/topbar-data";
import { LoginDialog } from "@/components/dialogs/auth/login-dialog";
import { UserAccountPopover } from "@/components/popovers/user-account-popover";

const NavLink = ({
  children,
  href,
  FlyoutContent,
}: {
  children: ReactNode;
  href: string;
  FlyoutContent?: ComponentType;
}) => {
  const [open, setOpen] = useState(false);

  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative h-fit w-fit"
    >
      <Link
        href={href}
        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {children}
        <span
          style={{
            transform: showFlyout ? "scaleX(1)" : "scaleX(0)",
          }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 ease-out"
        />
      </Link>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-card text-card-foreground rounded-xl shadow-lg"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-card" />
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Topbar = ({ hideSidebar = false }: { hideSidebar?: boolean }) => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const t = useTranslations("header");
  const tSections = useTranslations("headerSections");

  const [commandDialogOpen, setCommandDialogOpen] = React.useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-border/40
        bg-background/70 dark:bg-background/60 dark:border-border/30"
    >
      <div className="mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center w-full lg:w-auto">


          {/* Mobile sidebar drawer - Show on mobile or when hideSidebar is true */}
          <div className={`${hideSidebar ? 'block' : 'md:hidden'}`}>
            <MobileSidebarDrawer data={appSidebarData} />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                type="button"
                className="p-0 cursor-pointer"
                onClick={() => router.push("/")}
              >

                <Image
                  src="/android-chrome-192x192.png"
                  alt="The Mariscal"
                  className="ml-2"
                  height={50}
                  width={50}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("tooltips.logo")}</TooltipContent>
          </Tooltip>


          <div className="flex-1 max-w-2xl mx-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative flex justify-center items-center w-full lg:max-w-[220px]">
                  <div className="relative w-full flex justify-center items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder=""
                      className="pl-10 pr-32 w-full cursor-text hover:cursor-text"
                      onClick={() => setCommandDialogOpen(true)}
                      readOnly
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                      <span className="text-muted-foreground text-sm pl-5">
                        {t("search.placeholder")}
                      </span>
                      <div className="hidden lg:flex items-center gap-1 text-muted-foreground text-sm">
                        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("search.tooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation links in the middle */}
        <div className="hidden lg:flex items-center gap-8 ">
          {getNavigationLinks(tSections).map((link) => (
            <NavLink
              key={link.text}
              href={link.href}
              FlyoutContent={link.component}
            >
              {link.text}
            </NavLink>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="hidden md:block">
            <GetAppDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden xl:block">{t("navigation.obtenerApp")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("navigation.obtenerAppTooltip")}
                </TooltipContent>
              </Tooltip>
            </GetAppDialog>
          </div>
          {isLoaded && !isSignedIn && (
            <LoginDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" type="button" className="cursor-pointer">
                    {t("navigation.ingresar")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("navigation.ingresarTooltip")}
                </TooltipContent>
              </Tooltip>
            </LoginDialog>
          )}

          {isLoaded && isSignedIn && <UserAccountPopover />}

          <AccountSheet />
        </div>
      </div>
      <div className="hidden">
        <CommandDialogGeneral
          open={commandDialogOpen}
          onOpenChange={setCommandDialogOpen}
        />
      </div>
    </header>
  );
};

export default Topbar;
