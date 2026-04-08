"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { BookOpen, ExternalLink, Plus, Rows } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type CourseItem = {
  _id: Id<"academyCourses">;
  _creationTime: number;
  name: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  description: string;
  languageName: string | null;
  instructorName: string | null;
};

function toFriendlySlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminAcademyCoursesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "en";

  const courses = useQuery(api.academyCourses.getCoursesNewest, {});
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"academyCourses"> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedCourse = (courses ?? []).find((course) => course._id === selectedCourseId) ?? null;

  return (
    <AdminFormLayout
      title="Courses"
      description="Gestión de cursos de Academy, ordenados del más nuevo al más antiguo."
      containerClassName="max-w-6xl"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary">{courses?.length ?? 0} cursos</Badge>
        <Button asChild className="cursor-pointer">
          <Link href={`/${locale}/admin/academy/courses/new`} className="inline-flex items-center gap-2">
            <Plus className="size-4" />
            Agregar curso
          </Link>
        </Button>
      </div>

      {!courses ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 p-3">
                <Skeleton className="aspect-video w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No hay cursos cargados todavía.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(courses as CourseItem[]).map((course) => (
            <Card
              key={course._id}
              className="cursor-pointer overflow-hidden"
              onClick={() => {
                setSelectedCourseId(course._id);
                setDialogOpen(true);
              }}
            >
              <CardHeader className="px-3 pt-3 pb-2">
                <CardTitle className="line-clamp-2 text-sm">{course.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={`https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`}
                    alt={course.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 30vw"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{course.languageName ?? "-"}</span>
                  <span>{course.instructorName ?? "-"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedCourse ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCourse.name}</DialogTitle>
                <DialogDescription>Detalle del curso seleccionado.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="rounded-md border border-border/60 p-3">
                  <p className="whitespace-pre-wrap text-muted-foreground">{selectedCourse.description}</p>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-foreground">Idioma:</span> {selectedCourse.languageName ?? "-"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Instructor:</span> {selectedCourse.instructorName ?? "-"}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setDialogOpen(false);
                    router.push(`/${locale}/admin/academy/courses/${selectedCourse._id}/edit`);
                  }}
                >
                  <BookOpen className="size-4" />
                  Editar curso
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    setDialogOpen(false);
                    router.push(`/${locale}/admin/academy/courses/${selectedCourse._id}/sections`);
                  }}
                >
                  <Rows className="size-4" />
                  Ver secciones
                </Button>
                <Button asChild variant="outline" className="cursor-pointer">
                  <a
                    href={`/${locale}/academy/courses/${toFriendlySlug(selectedCourse.name)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Ver en la web
                  </a>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminFormLayout>
  );
}
