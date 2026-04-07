"use client";

import { ResponsiveDialog } from "@/components/dialogs/layout";
import { PropsWithChildren } from "react";
import { useTranslations } from "next-intl";

import { useState } from "react";

export function GetAppDialog({ children }: PropsWithChildren) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const t = useTranslations("dialogs.getApp");

  return (
    <ResponsiveDialog
      centerContent={true}
      title={t("title")}
      description={t("description")}
      isOpen={dialogIsOpen}
      setIsOpen={setDialogIsOpen}
      content={<GetAppDialogContent />}
    >
      <span onClick={() => setDialogIsOpen(true)}>{children}</span>
    </ResponsiveDialog>
  );
}

const GetAppDialogContent = () => {
  const t = useTranslations("dialogs.getApp");

  return (
    <div>
      <div className="flex flex-col justify-center items-center">
        <img
          src="/images/mariscal-qr-black.jpeg"
          alt={t("qrAlt")}
          className="max-w-[200px] w-full h-auto"
        />
        <p className="pt-6 text-sm text-muted-foreground">
          {t("orSearchInStore")}
        </p>
        <div className="flex flex-row justify-center items-center gap-4 mt-4">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/google-play.svg"
              alt={t("googlePlayAlt")}
              className="h-12"
            />
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/app-store.svg"
              alt={t("appStoreAlt")}
              className="h-12"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
