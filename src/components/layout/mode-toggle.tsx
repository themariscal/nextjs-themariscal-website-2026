"use client";

import * as React from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const t = useTranslations("settings.theme");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      name: t("light"),
      value: "light",
      icon: <Sun className="w-5 h-5" />,
    },
    {
      name: t("dark"),
      value: "dark",
      icon: <Moon className="w-5 h-5" />,
    },
    {
      name: t("system"),
      value: "system",
      icon: <Laptop className="w-5 h-5" />,
    },
  ];

  const current = themes.find((t) => t.value === theme) ?? themes[2];

  if (!mounted) return null;

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-full ring-offset-transparent focus:ring-transparent">
        <SelectValue>
          <div className="flex items-center gap-3">
            {current.icon}
            <span className="text-sm">{current.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-muted">
        {themes.map((t) => (
          <SelectItem key={t.value} value={t.value}>
            <div className="flex items-center gap-3">
              {t.icon}
              <span className="text-sm">{t.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
