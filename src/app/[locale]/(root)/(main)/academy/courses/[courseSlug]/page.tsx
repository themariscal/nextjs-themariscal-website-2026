"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import MainLayout from "@/components/elements/layouts/main-layout";
import { PrincipalLayout } from "@/components/elements/layouts/principal-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useQuery } from "convex/react";
import {
  BadgePercent,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  FileQuestion,
  FileText,
  GraduationCap,
  Infinity as InfinityIcon,
  Languages,
  Link2,
  PlayCircle,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  User,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

type PreviewVideoItem = {
  id: string;
  title: string;
  durationLabel?: string;
  sectionName?: string;
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

function splitDescriptionToBullets(description: string): string[] {
  return description
    .split(/[.\n]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 8);
}

function getPreviewVideos(courseData: PublicCourseData): PreviewVideoItem[] {
  const previews = courseData.sections.flatMap((section) =>
    section.elements
      .filter((element) => element.isPreview)
      .map((element) => {
        const fromUrl = element.contentUrl
          ? extractYouTubeVideoId(element.contentUrl)
          : null;

        return {
          id: fromUrl ?? courseData.youtubeVideoId,
          title: element.title,
          durationLabel: element.durationLabel,
          sectionName: section.name,
        };
      })
  );

  if (previews.length === 0) {
    return [
      {
        id: courseData.youtubeVideoId,
        title: courseData.name,
      },
    ];
  }

  const uniqueById = new Map<string, PreviewVideoItem>();
  for (const preview of previews) {
    if (!uniqueById.has(preview.id)) {
      uniqueById.set(preview.id, preview);
    }
  }

  return Array.from(uniqueById.values());
}

function CourseHero({
  courseData,
  stats,
}: {
  courseData: PublicCourseData | null | undefined;
  stats: {
    totalSections: number;
    totalElements: number;
    totalSeconds: number;
  };
}) {
  if (courseData === undefined) {
    return (
      <section className="border-b border-border/50 bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-64" />
          </div>
        </div>
      </section>
    );
  }

  if (!courseData) return null;

  return (
    <section className="border-b border-border/50 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 md:px-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Academy</span>
            <span>•</span>
            <span>{courseData.languageName ?? "Global"}</span>
            <span>•</span>
            <span>AI & Tecnología</span>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
            {courseData.name}
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            {courseData.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary/90">
              Bestseller
            </Badge>
            <Badge variant="secondary">Role Play</Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="size-3 fill-current" />
              4.8
            </Badge>
            <Badge variant="outline" className="gap-1">
              <User className="size-3" />
              {stats.totalElements * 321 + 1270} students
            </Badge>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Languages className="size-4" />
              Idioma: {courseData.languageName ?? "-"}
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              Instructor: {courseData.instructorName ?? "-"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseMainContent({ courseData }: { courseData: PublicCourseData | null | undefined }) {
  const stats = useMemo(() => {
    const sections = courseData?.sections ?? [];

    const totalElements = sections.reduce(
      (acc, section) => acc + section.elements.length,
      0
    );
    const totalSeconds = sections.reduce((acc, section) => {
      return (
        acc +
        section.elements.reduce((elementAcc, element) => {
          return elementAcc + parseDurationToSeconds(element.durationLabel);
        }, 0)
      );
    }, 0);

    const totalsByType = sections
      .flatMap((section) => section.elements)
      .reduce(
        (acc, element) => {
          acc[element.type] += 1;
          return acc;
        },
        { video: 0, quiz: 0, resource: 0, note: 0 } as Record<SectionElementType, number>
      );

    return {
      totalSections: sections.length,
      totalElements,
      totalSeconds,
      totalsByType,
    };
  }, [courseData]);

  const learnItems = useMemo(() => {
    if (!courseData) return [];

    const fromSections = courseData.sections
      .flatMap((section) => section.elements)
      .map((element) => element.title)
      .slice(0, 8);

    if (fromSections.length > 0) return fromSections;
    return splitDescriptionToBullets(courseData.description);
  }, [courseData]);

  if (courseData === undefined) {
    return (
      <div className="w-full space-y-6 px-4 pb-24 pt-8">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="w-full px-4 pb-24 pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Curso no encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No encontramos un curso para esta URL amigable.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-24 pt-8">
      <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {learnItems.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>This course includes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Video className="size-4" />
                {stats.totalsByType.video} videos
              </div>
              <div className="flex items-center gap-2">
                <FileQuestion className="size-4" />
                {stats.totalsByType.quiz} quizzes
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="size-4" />
                {stats.totalsByType.resource} recursos
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                {stats.totalsByType.note} notas
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {formatDuration(stats.totalSeconds)} total
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                Certificado de finalización
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Course content</CardTitle>
              <span className="text-xs text-muted-foreground">
                {stats.totalSections} sections • {stats.totalElements} lectures • {formatDuration(stats.totalSeconds)}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {courseData.sections.map((section, index) => {
                const sectionSeconds = section.elements.reduce((acc, element) => {
                  return acc + parseDurationToSeconds(element.durationLabel);
                }, 0);

                return (
                  <Collapsible key={section._id} defaultOpen={index === 0}>
                    <Card className="border-border/50 bg-background/40">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                              <CardTitle className="text-base">{section.name}</CardTitle>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {section.elements.length} lectures • {formatDuration(sectionSeconds)}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="space-y-2 border-t border-border/60 py-3">
                          {section.elements.map((element) => {
                            const Icon = getElementIcon(element.type);

                            return (
                              <div
                                key={element._id}
                                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border border-border/40 bg-background/60 p-3"
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
                                <span
                                  className={cn(
                                    "text-xs text-muted-foreground",
                                    !element.durationLabel && "opacity-40"
                                  )}
                                >
                                  {element.durationLabel ?? "-"}
                                </span>
                              </div>
                            );
                          })}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function CoursePurchaseSidebar({
  courseData,
  stats,
}: {
  courseData: PublicCourseData | null | undefined;
  stats: {
    totalSections: number;
    totalElements: number;
    totalSeconds: number;
  };
}) {
  const basePrice = 10.99;
  const previousPrice = 49.99;
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const previewVideos = useMemo(
    () => (courseData ? getPreviewVideos(courseData) : []),
    [courseData]
  );
  const [activePreviewVideoId, setActivePreviewVideoId] = useState(
    courseData?.youtubeVideoId ?? ""
  );

  useEffect(() => {
    setActivePreviewVideoId(courseData?.youtubeVideoId ?? "");
  }, [courseData?.youtubeVideoId]);

  const discountsByCoupon: Record<string, number> = {
    MT260406G3NEW: 0.27,
    MARISCAL10: 0.1,
    ACADEMY15: 0.15,
  };

  const finalPrice = appliedCoupon
    ? basePrice * (1 - appliedCoupon.discount)
    : basePrice;

  if (courseData === undefined) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (!courseData) return null;

  const handleApplyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      setCouponError("Ingresá un cupón.");
      return;
    }

    const discount = discountsByCoupon[normalized];
    if (!discount) {
      setCouponError("Cupón inválido.");
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({ code: normalized, discount });
    setCouponError(null);
  };

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-background/95">
        <button
          type="button"
          className="group relative block aspect-video w-full bg-muted text-left cursor-pointer"
          onClick={() => setPreviewDialogOpen(true)}
        >
          <Image
            src={`https://i.ytimg.com/vi/${courseData.youtubeVideoId}/hqdefault.jpg`}
            alt={courseData.name}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="340px"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg">
              <PlayCircle className="size-9" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-center text-sm font-medium text-white">
            Preview this course
          </div>
        </button>

        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Buy individual course</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">€{finalPrice.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">
                €{previousPrice.toFixed(2)}
              </span>
              {appliedCoupon ? (
                <span className="text-sm text-primary font-medium">
                  {Math.round(appliedCoupon.discount * 100)}% off
                </span>
              ) : null}
            </div>
            {appliedCoupon ? (
              <p className="mt-1 text-xs text-primary">
                Cupón <strong>{appliedCoupon.code}</strong> aplicado.
              </p>
            ) : (
              <p className="mt-1 text-xs text-primary">12 hours left at this price!</p>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-2">
              <InfinityIcon className="size-4" />
              Full lifetime access
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full cursor-pointer">Add to cart</Button>
            <Button variant="outline" className="w-full cursor-pointer">
              Buy now
            </Button>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <p className="text-sm text-muted-foreground">Subscribe and save</p>
            <div className="text-2xl font-bold">From €10.00 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium underline underline-offset-2">Apply Coupon</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="size-4" />
                <Share2 className="size-4" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter Coupon"
                className="h-9"
              />
              <Button type="button" variant="outline" className="h-9" onClick={handleApplyCoupon}>
                <BadgePercent className="size-4" />
                Apply
              </Button>
            </div>
            {couponError ? (
              <p className="text-xs text-destructive">{couponError}</p>
            ) : null}
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm">
                <span>{appliedCoupon.code}</span>
                <span className="font-medium text-primary">Applied!</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <p>
              {stats.totalSections} secciones • {stats.totalElements} contenidos •{" "}
              {formatDuration(stats.totalSeconds)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>{courseData.name}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-md border border-border/60 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activePreviewVideoId}`}
                title="Course preview video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Free sample videos</p>
              <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {previewVideos.map((preview) => (
                  <button
                    key={preview.id}
                    type="button"
                    onClick={() => setActivePreviewVideoId(preview.id)}
                    className={cn(
                      "w-full rounded-md border p-2 text-left transition-colors",
                      activePreviewVideoId === preview.id
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-24 overflow-hidden rounded-sm bg-muted">
                        <Image
                          src={`https://i.ytimg.com/vi/${preview.id}/mqdefault.jpg`}
                          alt={preview.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{preview.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {preview.sectionName ?? "Preview"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {preview.durationLabel ?? "-"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function PublicAcademyCoursePage() {
  const params = useParams();
  const courseSlug = (params.courseSlug as string) ?? "";

  const courseData = useQuery(api.academyCourses.getPublicCourseBySlug, {
    slug: courseSlug,
  }) as PublicCourseData | null | undefined;

  const stats = useMemo(() => {
    const sections = courseData?.sections ?? [];

    const totalElements = sections.reduce(
      (acc, section) => acc + section.elements.length,
      0
    );
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

  return (
    <MainLayout>
      <PrincipalLayout
        hero={<CourseHero courseData={courseData} stats={stats} />}
        content={<CourseMainContent courseData={courseData} />}
        rightSidebar={<CoursePurchaseSidebar courseData={courseData} stats={stats} />}
      />
    </MainLayout>
  );
}
