"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import MainLayout from "@/components/elements/layouts/main-layout";
import { PrincipalLayout } from "@/components/elements/layouts/principal-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ChevronDown, FileQuestion, FileText, Link2, PlayCircle, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type SectionElementType = "video" | "quiz" | "resource" | "note";

type SectionElement = {
  _id: Id<"academyCourseSectionElements">;
  title: string;
  type: SectionElementType;
  durationLabel?: string;
  isPreview?: boolean;
  contentUrl?: string;
};

type PublicCourseData = {
  _id: Id<"academyCourses">;
  name: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  languageName: string | null;
  instructorName: string | null;
  sections: Array<{
    _id: Id<"academyCourseSections">;
    name: string;
    elements: SectionElement[];
  }>;
};

function parseDurationToSeconds(value?: string): number {
  if (!value) return 0;

  const mmss = value.match(/^(\d{1,2}):(\d{2})$/);
  if (mmss) {
    const minutes = Number(mmss[1]);
    const seconds = Number(mmss[2]);
    return minutes * 60 + seconds;
  }

  const hhmmss = value.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (hhmmss) {
    const hours = Number(hhmmss[1]);
    const minutes = Number(hhmmss[2]);
    const seconds = Number(hhmmss[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function getElementIcon(type: SectionElementType) {
  switch (type) {
    case "video":
      return Video;
    case "quiz":
      return FileQuestion;
    case "resource":
      return Link2;
    case "note":
      return FileText;
    default:
      return FileText;
  }
}

function CourseContent({ courseData }: { courseData: PublicCourseData | null | undefined }) {
  const stats = useMemo(() => {
    const sections = courseData?.sections ?? [];

    const totalElements = sections.reduce((acc, section) => acc + section.elements.length, 0);
    const totalSeconds = sections.reduce((acc, section) => {
      return (
        acc +
        section.elements.reduce((elementAcc, element) => {
          return elementAcc + parseDurationToSeconds(element.durationLabel);
        }, 0)
      );
    }, 0);

    return {
      totalSections: sections.length,
      totalElements,
      totalSeconds,
    };
  }, [courseData]);

  if (courseData === undefined) {
    return (
      <section className="w-full p-4 space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </section>
    );
  }

  if (!courseData) {
    return (
      <section className="w-full p-4">
        <Card>
          <CardHeader>
            <CardTitle>Curso no encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No encontramos un curso para esta URL amigable.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{courseData.name}</h1>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{courseData.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{courseData.languageName ?? "sin idioma"}</Badge>
        <Badge variant="outline">Instructor: {courseData.instructorName ?? "-"}</Badge>
        <Badge variant="outline">
          {stats.totalSections} secciones · {stats.totalElements} elementos · {formatDuration(stats.totalSeconds)}
        </Badge>
      </div>

      {courseData.sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Este curso todavía no tiene secciones publicadas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courseData.sections.map((section, index) => {
            const sectionSeconds = section.elements.reduce((acc, element) => {
              return acc + parseDurationToSeconds(element.durationLabel);
            }, 0);

            return (
              <Collapsible key={section._id} defaultOpen={index === 0}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                          <CardTitle className="text-base">{section.name}</CardTitle>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {section.elements.length} elementos · {formatDuration(sectionSeconds)}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-2 border-t border-border/60 py-3">
                      {section.elements.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Esta sección no tiene elementos.</p>
                      ) : (
                        section.elements.map((element) => {
                          const Icon = getElementIcon(element.type);

                          return (
                            <div
                              key={element._id}
                              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border border-border/40 p-3"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="size-4 text-muted-foreground" />
                                <span className="text-sm">{element.title}</span>
                              </div>
                              {element.isPreview ? (
                                <Badge variant="outline" className="text-xs">
                                  Preview
                                </Badge>
                              ) : (
                                <span />
                              )}
                              <span className={cn("text-xs text-muted-foreground", !element.durationLabel && "opacity-40")}>
                                {element.durationLabel ?? "-"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CourseRightSidebar({
  courseData,
  courseSlug,
}: {
  courseData: PublicCourseData | null | undefined;
  courseSlug: string;
}) {
  if (!courseData) return null;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full cursor-pointer">
            <a href={courseData.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
              <PlayCircle className="size-4" />
              Ver trailer / video
            </a>
          </Button>
          <div className="text-xs text-muted-foreground">
            URL amigable: <span className="font-mono text-foreground">{courseSlug}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PublicAcademyCoursePage() {
  const params = useParams();
  const courseSlug = (params.courseSlug as string) ?? "";
  const courseData = useQuery(api.academyCourses.getPublicCourseBySlug, {
    slug: courseSlug,
  }) as PublicCourseData | null | undefined;

  return (
    <MainLayout>
      <PrincipalLayout
        content={<CourseContent courseData={courseData} />}
        rightSidebar={<CourseRightSidebar courseData={courseData} courseSlug={courseSlug} />}
      />
    </MainLayout>
  );
}
