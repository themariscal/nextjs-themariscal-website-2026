import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard, type CourseWithAccess } from "./course-card";

interface AcademyCoursesGridProps {
  courses: CourseWithAccess[] | undefined;
}

export function AcademyCoursesGrid({ courses }: AcademyCoursesGridProps) {
  if (courses === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No hay cursos disponibles.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
}
