"use client";

import * as React from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { LANG_TABS, type Lang } from "@/i18n/config";

export function LanguageSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations("languages");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as Lang });
    };

    const currentLanguage = LANG_TABS.find((lang) => lang.id === locale);

    if (!mounted) return null;

    return (
        <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full ring-offset-transparent focus:ring-transparent">
                <SelectValue>
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{currentLanguage?.label}</span>
                        <span className="text-sm">{t(currentLanguage?.id as Lang)}</span>
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-muted">
                {LANG_TABS.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.label}</span>
                            <span className="text-sm">{t(lang.id)}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
