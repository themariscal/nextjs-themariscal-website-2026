import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminAcademyCoursesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Courses</h1>
      <Button asChild className="cursor-pointer">
        <Link href="/admin/academy/courses/new" className="inline-flex items-center gap-2">
          <Plus className="size-4" />
          Agregar curso
        </Link>
      </Button>
    </div>
  );
}

