"use client";

import { api } from "#convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

type Params = {
  locale?: string;
};

export default function AccountCoursesPage() {
  const params = useParams() as Params;
  const locale = params.locale ?? "en";
  const courses = useQuery(api.academyCourses.getMyPurchasedCourses, {});

  if (courses === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis Cursos</h1>

      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aún no tienes cursos adquiridos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cuando adquieras un curso, lo verás aquí.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.enrollmentId}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-video w-full overflow-hidden rounded-md border sm:w-64">
                  <Image
                    src={`https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`}
                    alt={course.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 256px"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {course.isCompleted
                      ? "Completado"
                      : course.hasStarted
                        ? "En progreso"
                        : "No iniciado"}
                  </p>
                  <h2 className="line-clamp-2 text-lg font-semibold">{course.name}</h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progreso</span>
                      <span>{course.progressPercent}%</span>
                    </div>
                    <Progress value={course.progressPercent} className="h-2" />
                  </div>
                </div>
                <div className="sm:pl-2">
                  <Button asChild>
                    <Link href={`/${locale}/account/courses/${course.slug}`}>
                      {course.isCompleted
                        ? "Ver progreso"
                        : course.hasStarted
                          ? "Continuar curso"
                          : "Ver curso"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
