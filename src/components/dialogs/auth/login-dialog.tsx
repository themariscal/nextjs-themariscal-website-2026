"use client";

import { ResponsiveDialog } from "@/components/dialogs/layout";
import { PropsWithChildren } from "react";

import { useState } from "react";
import { LoginContent } from "./login-content";


export function LoginDialog({ children }: PropsWithChildren) {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <ResponsiveDialog
      isOpen={dialogIsOpen}
      setIsOpen={setDialogIsOpen}
      content={<LoginContent setDialogIsOpen={setDialogIsOpen} />}
    >
      <span onClick={() => setDialogIsOpen(true)}>{children}</span>
    </ResponsiveDialog>
  );
}
