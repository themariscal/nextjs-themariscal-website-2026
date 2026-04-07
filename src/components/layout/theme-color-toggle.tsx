"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeColor } from "@/lib/providers/theme-color-provider";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function ThemeColorToggle() {
  const { themeColor, setThemeColor, availableColors } = useThemeColor();
  const t = useTranslations("settings.theme");

  return (
    <Select value={themeColor} onValueChange={setThemeColor}>
      <SelectTrigger className="w-full ring-offset-transparent focus:ring-transparent">
        <SelectValue placeholder={t("selectColor")} />
      </SelectTrigger>
      <SelectContent className="border-muted">
        {availableColors.map(({ name, color }) => (
          <SelectItem key={name} value={name}>
            <div className="flex items-center space-x-3">
              <div className={cn("rounded-full w-5 h-5", color)} />
              <div className="text-sm">{t(`colors.${name.toLowerCase()}`)}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
