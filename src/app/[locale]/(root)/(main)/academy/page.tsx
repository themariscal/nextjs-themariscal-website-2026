import { AcademyLayout } from "@/components/elements/academy/academy-layout";
import MainLayout from "@/components/elements/layouts/main-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academia | The Mariscal",
  description:
    "Aprende desarrollo con IA. Cursos de Claude Code, automatización y más. Incluidos en Premium o disponibles por separado.",
};

export default function AcademyPage() {
  return (
    <MainLayout hideSidebar>
      <AcademyLayout />
    </MainLayout>
  );
}
