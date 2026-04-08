import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "The Mariscal",
    template: "%s - The Mariscal",
  },
};

export default function ShortsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
