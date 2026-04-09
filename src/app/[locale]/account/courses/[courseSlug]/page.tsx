"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ChevronDown, Circle, Clock3, PlayCircle } from "lucide-react";
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
      <div className="space-y-3 px-4 pb-6 lg:px-6">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-[70vh] w-full" />
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

  const tabs = ["Overview", "Q&A", "Notes", "Announcements", "Reviews", "Learning tools"];

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
    <div className="w-full bg-background">
      <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 border-y border-border/60 bg-gradient-to-b from-background via-background to-muted/15 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex min-h-[62vh] flex-col border-r border-border/60">
          <div className="relative aspect-video w-full overflow-hidden bg-black">
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

          <div className="flex items-center gap-2 overflow-x-auto border-t border-border/50 px-3 py-2 sm:px-5">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors",
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2 border-t border-border/50 px-4 py-4 sm:px-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Mis Cursos</p>
            <h1 className="text-2xl font-bold md:text-3xl">{course.name}</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">{course.description}</p>
            {activeElement ? (
              <Badge variant="secondary" className="gap-1">
                <PlayCircle className="size-3" />
                Viendo ahora: {activeElement.title}
              </Badge>
            ) : null}
          </div>
        </div>

        <aside className="flex h-[calc(100vh-6rem)] flex-col bg-card/55">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold">Course content</p>
            <p className="text-xs text-muted-foreground">Mantén progreso de cada lección</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-3">
            {sections.map((section, sectionIndex) => (
              <div key={section._id} className="rounded-lg border border-border/60 bg-background/65">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold">
                      Sección {sectionIndex + 1}: {section.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {section.elements.length} lecciones
                    </p>
                  </div>
                  <ChevronDown className="mt-0.5 size-4 text-muted-foreground" />
                </div>

                <div className="space-y-1 p-2">
                  {section.elements.map((element, elementIndex) => {
                    const isActive = activeElement?._id === element._id;
                    const isCompleted = completedSet.has(element._id);

                    return (
                      <button
                        key={element._id}
                        type="button"
                        className={cn(
                          "w-full rounded-md border px-2 py-2 text-left transition-colors",
                          isActive
                            ? "border-primary/70 bg-primary/10"
                            : "border-transparent hover:border-border hover:bg-muted/45"
                        )}
                        onClick={() => {
                          setActiveElement(element);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="pt-0.5 text-muted-foreground">
                            {isCompleted ? (
                              <CheckCircle2 className="size-4 text-primary" />
                            ) : (
                              <Circle className="size-4" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm">
                              {sectionIndex + 1}.{elementIndex + 1} {element.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                              {element.durationLabel ? (
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="size-3" />
                                  {element.durationLabel}
                                </span>
                              ) : null}
                              {isActive ? (
                                <span className="text-primary">viendo ahora</span>
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
                                ? "Listo"
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
          </div>
        </aside>
      </div>
    </div>
  );
}
