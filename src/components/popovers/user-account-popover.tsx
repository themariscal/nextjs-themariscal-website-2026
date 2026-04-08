"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  User,
  Heart,
  Settings,
  LogOut,
  Bell,
  Shield,
  CreditCard,
  ShieldCheck,
  FlaskConical,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useClerk, useAuth, useUser } from "@clerk/nextjs";
import { IsAdminComponent } from "@/components/auth/is-admin-component";
import { LogoutDialog } from "../dialogs/auth/logout-dialog";
import { useTranslations } from "next-intl";

export function UserAccountPopover() {
  const { user, isLoaded } = useUser();
  const { orgId } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const t = useTranslations("header.userAccount");

  const email = user?.emailAddresses?.[0]?.emailAddress || 'test@test.com';
  const displayName = user?.username || t("defaultUser");
  const userPhotoURL = user?.imageUrl || 'https://github.com/shadcn.png';


  const handleMenuItemClick = async (action: () => void | Promise<void>) => {
    await action();
    setOpen(false);
  };

  const menuItems = [
    {
      icon: User,
      label: t("myAccount"),
      action: () => router.push("/account"),
    },
    {
      icon: Heart,
      label: t("myFavorites"),
      action: () => router.push("/account/favorites"),
    },
    {
      icon: Bell,
      label: t("notifications"),
      action: () => router.push("/account/notifications"),
    },
    {
      icon: Settings,
      label: t("settings"),
      action: () => router.push("/account/settings"),
    },
    {
      icon: Shield,
      label: t("privacy"),
      action: () => router.push("/account/privacy"),
    },
    {
      icon: CreditCard,
      label: t("subscription"),
      action: () => router.push("/account/subscription"),
    },
  ];

  const adminMenuItem = {
    icon: ShieldCheck,
    label: t("admin"),
    action: async () => {
      const adminMembership = user?.organizationMemberships.find(
        (membership) =>
          membership.role === "org:admin" ||
          membership.permissions.includes("org:admin")
      );

      if (adminMembership && orgId !== adminMembership.organization.id) {
        await setActive({ organization: adminMembership.organization.id });
      }

      router.push("/admin");
    },
  };

  const testerMenuItem = {
    icon: FlaskConical,
    label: t("tester"),
    action: async () => {
      const adminMembership = user?.organizationMemberships.find(
        (membership) =>
          membership.role === "org:admin" ||
          membership.permissions.includes("org:admin")
      );

      if (adminMembership && orgId !== adminMembership.organization.id) {
        await setActive({ organization: adminMembership.organization.id });
      }

      router.push("/testing");
    },
  };

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <Button variant="outline" className="cursor-pointer" disabled>
        <Avatar className="size-6 rounded-full">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline ml-2">{t("loading")}</span>
      </Button>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Avatar className="size-6 rounded-full">
            <AvatarImage
              src={userPhotoURL || "https://github.com/shadcn.png"}
              alt={displayName}
              className="rounded-full"
            />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{displayName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="size-10 rounded-full">
              <AvatarImage
                src={userPhotoURL || "https://github.com/shadcn.png"}
                alt={displayName}
                className="rounded-full"
              />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-1">
            <IsAdminComponent fallback={null}>
              <Button
                variant="ghost"
                className="cursor-pointer w-full justify-start h-10 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => void handleMenuItemClick(adminMenuItem.action)}
              >
                <ShieldCheck className="size-4 mr-3" />
                {adminMenuItem.label}
              </Button>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="cursor-pointer w-full justify-start h-10 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => void handleMenuItemClick(testerMenuItem.action)}
              >
                <FlaskConical className="size-4 mr-3" />
                {testerMenuItem.label}
              </Button>
              <Separator className="my-2" />
            </IsAdminComponent>

            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="cursor-pointer w-full justify-start h-10 px-3"
                  onClick={() => void handleMenuItemClick(item.action)}
                >
                  <Icon className="size-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}

            <Separator className="my-2" />

            <LogoutDialog>
              <Button
                variant="ghost"
                className="cursor-pointer w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="size-4 mr-3" />
                {t("logout")}
              </Button>
            </LogoutDialog>

          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
