"use client";

import React from "react";
import { useTranslations } from "next-intl";

export const CommunitiesFooter: React.FC = () => {
    const t = useTranslations("appSidebar");

    return (
        <div className="mt-6 pt-4 border-t border-border">
            <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <a href="/rules" className="hover:text-foreground transition-colors">
                        {t("legal.reglas")}
                    </a>
                    <a href="/privacy" className="hover:text-foreground transition-colors">
                        {t("legal.privacidad")}
                    </a>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <a href="/user-agreement" className="hover:text-foreground transition-colors">
                        {t("legal.acuerdo")}
                    </a>
                    <a href="/accessibility" className="hover:text-foreground transition-colors">
                        {t("legal.accesibilidad")}
                    </a>
                </div>
                <div className="pt-2">
                    <span>{t("footer")}</span>
                </div>
            </div>
        </div>
    );
};
