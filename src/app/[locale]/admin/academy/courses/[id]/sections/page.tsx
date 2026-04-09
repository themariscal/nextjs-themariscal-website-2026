"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ChevronDown,
  FileQuestion,
  FileText,
  Link2,
  Plus,
  Video,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

type SectionElementType = "video" | "quiz" | "resource" | "note";

type SectionElement = {
  _id: Id<"academyCourseSectionElements">;
  title: string;
  type: SectionElementType;
  durationLabel?: string;
  isPreview?: boolean;
};

type SectionWithElements = {
  _id: Id<"academyCourseSections">;
  name: string;
  order?: number;
  elements: SectionElement[];
};

function formatPrice(price?: number, currency?: string): string {
  if (!price || price === 0) return "Gratis";
  const amount = price / 100;
  const symbol = currency?.toUpperCase() === "USD" ? "$" : "€";
  return `${symbol}${amount.toFixed(2)} ${(currency ?? "eur").toUpperCase()}`;
}

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

export default function AdminAcademyCourseSectionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";
  const courseId = params.id as Id<"academyCourses">;

  const course = useQuery(api.academyCourses.getCourseById, { courseId });
  const sections = useQuery(api.academyCourses.getCourseSectionsWithElements, { courseId });

  const stats = useMemo(() => {
    const safeSections = (sections ?? []) as SectionWithElements[];
    const totalElements = safeSections.reduce((acc, section) => acc + section.elements.length, 0);
    const totalSeconds = safeSections.reduce((acc, section) => {
      const sectionSeconds = section.elements.reduce((elementAcc, element) => {
        return elementAcc + parseDurationToSeconds(element.durationLabel);
      }, 0);
      return acc + sectionSeconds;
    }, 0);

    return {
      totalSections: safeSections.length,
      totalElements,
      totalSeconds,
    };
  }, [sections]);

  if (course === undefined || sections === undefined) {
    return (
      <AdminFormLayout title="Sections" description="Cargando secciones del curso..." containerClassName="max-w-6xl">
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </AdminFormLayout>
    );
  }

  if (course === null) {
    return (
      <AdminFormLayout title="Sections" description="No encontramos el curso solicitado.">
        <AlertErrorCard title="Curso no encontrado" message="Revisá el curso e intentá nuevamente." />
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title="Sections"
      description={`Estructura y contenidos del curso: ${course.name}`}
      containerClassName="max-w-6xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {stats.totalSections} secciones · {stats.totalElements} elementos · {formatDuration(stats.totalSeconds)} duración total
          <Badge variant="outline" className="text-xs">
            {formatPrice(course.price, course.currency)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {course.stripeProductId && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => window.open(`https://dashboard.stripe.com/test/products/${course.stripeProductId}`, "_blank")}
            >
              Ver en Stripe
            </Button>
          )}
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push(`/${locale}/admin/academy/courses`)}
          >
            <ArrowLeft className="size-4" />
            Volver a cursos
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => router.push(`/${locale}/admin/academy/courses/${courseId}/sections/new`)}
          >
            <Plus className="size-4" />
            Agregar sección
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Este curso todavía no tiene secciones. Creá la primera sección para empezar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(sections as SectionWithElements[]).map((section, sectionIndex) => {
            const sectionSeconds = section.elements.reduce((acc, element) => {
              return acc + parseDurationToSeconds(element.durationLabel);
            }, 0);

            return (
              <Collapsible key={section._id} defaultOpen={sectionIndex === 0}>
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
                        <p className="text-sm text-muted-foreground">Esta sección no tiene elementos todavía.</p>
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
    </AdminFormLayout>
  );
}
