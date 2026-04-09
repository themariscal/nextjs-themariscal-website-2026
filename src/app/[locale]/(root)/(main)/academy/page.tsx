import MainLayout from "@/components/elements/layouts/main-layout";
import { AcademyLayout } from "@/components/elements/academy/academy-layout";

export default function AcademyPage() {
  return (
    <MainLayout hideSidebar>
      <AcademyLayout />
    </MainLayout>
  );
}
