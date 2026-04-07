"use client";

import { ResponsiveDialog } from "@/components/dialogs/layout";
import { PropsWithChildren, useState } from "react";
import { MariscalFabContent } from "./mariscal-fab-content";

export function MariscalFabDialog({ children }: PropsWithChildren) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleHeightChange = (expanded: boolean) => {
        setIsExpanded(expanded);
    };

    const handleDialogClose = (open: boolean) => {
        setDialogIsOpen(open);
        if (!open) {
            // Reset expansion state when dialog closes
            setIsExpanded(false);
        }
    };

    return (
        <ResponsiveDialog
            isOpen={dialogIsOpen}
            setIsOpen={handleDialogClose}
            content={<MariscalFabContent setDialogIsOpen={setDialogIsOpen} onHeightChange={handleHeightChange} />}
            centerContent={false}
            fullscreen={true}
            isExpanded={isExpanded}
        >
            <span onClick={() => setDialogIsOpen(true)}>{children}</span>
        </ResponsiveDialog>
    );
}
