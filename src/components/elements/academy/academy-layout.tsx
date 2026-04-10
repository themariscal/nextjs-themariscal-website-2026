"use client";

import { YouTubeShorts } from "@/components/elements/home/youtube-shorts";
import { api } from "#convex/_generated/api";
import { useQuery } from "convex/react";
import { AcademyCoursesGrid } from "./academy-courses-grid";
import { AcademyMasterclassSidebar } from "./academy-masterclass-sidebar";
import type { CourseWithAccess } from "./course-card";

export function AcademyLayout() {
  const courses = useQuery(api.academyCourses.getAcademyCoursesWithAccess);

  // undefined = loading, null = not found, CourseWithAccess = loaded
  const masterclass: CourseWithAccess | null | undefined = courses
    ? (courses.find((c) => c.slug === "claude-code-masterclass") ?? null)
    : undefined;

  return (
    <div className="flex min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 py-6 space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-4">Shorts de la Academia</h2>
          <YouTubeShorts page="academy" />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6">Todos los cursos</h2>
          <AcademyCoursesGrid courses={courses} />
        </section>
      </div>

      {/* Sticky right sidebar — desktop only */}
      <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 px-4 py-6">
        <div className="sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Curso Estrella
          </p>
          <AcademyMasterclassSidebar masterclass={masterclass} />
        </div>
      </aside>
    </div>
  );
}
