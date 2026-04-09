"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SectionElement = {
  _id: Id<"academyCourseSectionElements">;
  title: string;
  type: "video" | "quiz" | "resource" | "note";
  contentUrl?: string;
  durationLabel?: string;
};

type CourseSection = {
  _id: Id<"academyCourseSections">;
  name: string;
  elements: SectionElement[];
};

type PlayerData = {
  accessDenied: boolean;
  course?: {
    _id: Id<"academyCourses">;
    name: string;
    description: string;
    youtubeVideoId: string;
    slug: string;
  };
  sections?: CourseSection[];
  completedElementIds?: Id<"academyCourseSectionElements">[];
} | null;

type RouteParams = {
  locale?: string;
  courseSlug?: string;
};

export default function PurchasedCoursePlayerPage() {
  const params = useParams() as RouteParams;
  const router = useRouter();
  const locale = params.locale ?? "en";
  const courseSlug = params.courseSlug ?? "";
  const toggleCompleted = useMutation(api.academyCourses.toggleCourseElementCompleted);

  const playerData = useQuery(api.academyCourses.getPurchasedCoursePlayerBySlug, {
    slug: courseSlug,
  }) as PlayerData | undefined;

  const sections = useMemo(() => playerData?.sections ?? [], [playerData?.sections]);

  const firstElement = useMemo(() => {
    for (const section of sections) {
      if (section.elements.length > 0) {
        return section.elements[0];
      }
    }
    return null;
  }, [sections]);

  const [activeElement, setActiveElement] = useState<SectionElement | null>(null);
  const [completedSet, setCompletedSet] = useState<Set<Id<"academyCourseSectionElements">>>(
    new Set()
  );
  const [pendingCompletionElementId, setPendingCompletionElementId] = useState<
    Id<"academyCourseSectionElements"> | null
  >(null);

  useEffect(() => {
    if (!playerData) return;

    if (playerData.accessDenied) {
      router.replace(`/${locale}/academy/courses/${courseSlug}`);
      return;
    }

    const completed = new Set(playerData.completedElementIds ?? []);
    setCompletedSet(completed);

    if (firstElement) {
      setActiveElement(firstElement);
    }
  }, [courseSlug, firstElement, locale, playerData, router]);

  const activeVideoId = useMemo(() => {
    if (!activeElement) return playerData?.course?.youtubeVideoId ?? "";
    if (activeElement.contentUrl) {
      const fromContentUrl = extractYouTubeVideoId(activeElement.contentUrl);
      if (fromContentUrl) return fromContentUrl;
    }
    return playerData?.course?.youtubeVideoId ?? "";
  }, [activeElement, playerData?.course?.youtubeVideoId]);

  if (playerData === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  if (playerData === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Curso no encontrado</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (playerData.accessDenied) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Redirigiendo al curso...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const course = playerData.course;
  if (!course) return null;

  const handleToggleCompleted = async (
    sectionId: Id<"academyCourseSections">,
    elementId: Id<"academyCourseSectionElements">
  ) => {
    if (pendingCompletionElementId) return;
    setPendingCompletionElementId(elementId);

    try {
      const result = await toggleCompleted({
        courseId: course._id,
        sectionId,
        elementId,
      });

      setCompletedSet((previous) => {
        const next = new Set(previous);
        if (result.completed) {
          next.add(elementId);
        } else {
          next.delete(elementId);
        }
        return next;
      });
    } finally {
      setPendingCompletionElementId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Mis Cursos</h1>
        <p className="text-sm text-muted-foreground">{course.name}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="relative aspect-video overflow-hidden rounded-md border bg-black">
              {activeVideoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId}`}
                  title="Video del curso"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : null}
            </div>

            {activeElement ? (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Viendo ahora</p>
                <h2 className="text-xl font-semibold">{activeElement.title}</h2>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenido del Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => (
              <div key={section._id} className="space-y-2">
                <p className="text-sm font-semibold">{section.name}</p>

                <div className="space-y-2">
                  {section.elements.map((element) => {
                    const isActive = activeElement?._id === element._id;
                    const isCompleted = completedSet.has(element._id);

                    return (
                      <button
                        key={element._id}
                        type="button"
                        className={cn(
                          "w-full rounded-md border p-2 text-left transition-colors",
                          isActive ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"
                        )}
                        onClick={() => {
                          setActiveElement(element);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <p className="line-clamp-2 text-sm font-medium">{element.title}</p>
                            <div className="flex items-center gap-2">
                              {isActive ? (
                                <Badge variant="default" className="gap-1">
                                  <PlayCircle className="size-3" />
                                  Viendo ahora
                                </Badge>
                              ) : null}
                              {isCompleted ? (
                                <Badge variant="secondary" className="gap-1">
                                  <CheckCircle2 className="size-3" />
                                  Completada
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isCompleted ? "secondary" : "outline"}
                            disabled={pendingCompletionElementId === element._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleToggleCompleted(section._id, element._id);
                            }}
                          >
                            {pendingCompletionElementId === element._id
                              ? "..."
                              : isCompleted
                                ? "Desmarcar"
                                : "Completar"}
                          </Button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este curso aún no tiene secciones.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
