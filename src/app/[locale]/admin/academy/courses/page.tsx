import Link from "next/link";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminAcademyCoursesPage() {
  return (
    <AdminFormLayout title="Courses" description="Gestión de cursos de Academy.">
      <Button asChild className="cursor-pointer">
        <Link href="/admin/academy/courses/new" className="inline-flex items-center gap-2">
          <Plus className="size-4" />
          Agregar curso
        </Link>
      </Button>
    </AdminFormLayout>
  );
}
