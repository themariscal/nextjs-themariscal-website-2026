import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoreHorizontal, } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { ThemeColorToggle } from "./theme-color-toggle";
import { LanguageSelector } from "./language-selector";
import { CustomAlertDialog } from "../alerts/custom-alert-dialog";

import { LoginDialog } from "../dialogs/auth/login-dialog";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LogoutDialog } from "../dialogs/auth/logout-dialog";

export function AccountSheet() {
  const t = useTranslations("settings");
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  return (
    <Tooltip>
      <Sheet>
        <SheetTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </SheetTrigger>
        <TooltipContent>{t("tooltip")}</TooltipContent>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("title")}</SheetTitle>
            <SheetDescription>
              {t("description")}
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="flex gap-3 ">
              <div className="w-1/2">
                <ThemeColorToggle />
              </div>
              <div className="w-1/2">
                <ModeToggle />
              </div>
            </div>

            <div className="w-full">
              <LanguageSelector />
            </div>

          </div>
          <SheetFooter>
            {isLoaded && !isSignedIn && (
              <LoginDialog>
                <Button type="button" className="w-full">
                  {t("login")}
                </Button>
              </LoginDialog>
            )}
            {isLoaded && isSignedIn && (
              <LogoutDialog>
                <Button type="submit" className="cursor-pointer">
                  {t("logout.button")}
                </Button>
              </LogoutDialog>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </Tooltip>
  );
}
