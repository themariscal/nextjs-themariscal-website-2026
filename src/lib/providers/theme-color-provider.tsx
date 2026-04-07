"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const availableThemeColors = [
  { name: "Red", color: "bg-red-500", className: "redTheme" },
  { name: "Rose", color: "bg-rose-600", className: "roseTheme" },
  { name: "Orange", color: "bg-orange-600", className: "orangeTheme" },
  { name: "Green", color: "bg-green-600", className: "greenTheme" },
  { name: "Blue", color: "bg-blue-500", className: "blueTheme" },
  { name: "Yellow", color: "bg-yellow-500", className: "yellowTheme" },
  { name: "Violet", color: "bg-violet-500", className: "violetTheme" },
] as const;

export type ThemeColorName = (typeof availableThemeColors)[number]["name"];

interface ThemeColorContextValue {
  themeColor: ThemeColorName | undefined;
  setThemeColor: (value: ThemeColorName) => void;
  availableColors: typeof availableThemeColors;
}

const ThemeColorContext = createContext<ThemeColorContextValue | undefined>(
  undefined,
);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColorName | undefined>();

  useEffect(() => {
    const savedClass = localStorage.getItem("theme-color");
    if (savedClass) {
      const found = availableThemeColors.find((c) => c.className === savedClass);
      if (found) {
        applyThemeClass(found.className);
        setThemeColorState(found.name);
      }
    }
  }, []);

  const applyThemeClass = (className: string) => {
    const body = document.body;
    availableThemeColors.forEach(({ className }) =>
      body.classList.remove(className),
    );
    body.classList.add(className);
  };

  const setThemeColor = (value: ThemeColorName) => {
    const found = availableThemeColors.find((c) => c.name === value);
    if (!found) return;
    applyThemeClass(found.className);
    localStorage.setItem("theme-color", found.className);
    setThemeColorState(value);
  };

  return (
    <ThemeColorContext.Provider
      value={{
        themeColor,
        setThemeColor,
        availableColors: availableThemeColors,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}