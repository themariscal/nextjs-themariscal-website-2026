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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/lib/stores/music-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useMutation, useQuery } from "convex/react";
import {
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
  MessageSquare,
  PlayCircle,
  Plus,
  ShieldCheck,
  Star,
  Tag,
  ThumbsDown,
  ThumbsUp,
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
  price?: number;
  currency?: string;
  stripePriceId?: string;
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

function formatCoursePrice(price?: number, currency?: string): string {
  if (!price || price === 0) return "Gratis";
  const cur = (currency ?? "eur").toUpperCase();
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(price / 100);
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
        <div className="mx-auto w-full max-w-[86rem] px-4 pb-10 pt-8 md:px-6">
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
      <div className="mx-auto w-full max-w-[86rem] px-4 pb-10 pt-8 md:px-6">
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const recommendedCourses = [
    {
      title: "The Complete AI Guide: Learn ChatGPT, Generative AI & More",
      label: "Bestseller",
      rating: 4.5,
      students: "341,912",
      hours: "41.5 hours",
      updated: "Updated: 3/2026",
      price: "€10.99",
      oldPrice: "€14.99",
      initials: "AG",
    },
    {
      title: "AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents",
      label: "Bestseller",
      rating: 4.7,
      students: "227,261",
      hours: "33.5 hours",
      updated: "Updated: 2/2026",
      price: "€10.99",
      oldPrice: "€14.99",
      initials: "AE",
    },
    {
      title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
      label: "Premium",
      rating: 4.7,
      students: "241,471",
      hours: "17 hours",
      updated: "Updated: 2/2026",
      price: "€10.99",
      oldPrice: "€14.99",
      initials: "MC",
    },
    {
      title: "Artificial Intelligence A-Z 2026: Agentic AI, Gen AI, and RL",
      label: "Premium",
      rating: 4.4,
      students: "344,936",
      hours: "15.5 hours",
      updated: "Updated: 1/2026",
      price: "€15.99",
      oldPrice: "€17.99",
      initials: "AZ",
    },
  ];
  const mockReviews = [
    {
      author: "Joy",
      date: "13 days ago",
      rating: 4,
      text: "I would suggest adding more quizzes for the rest of the sections, like the Python module.",
    },
    {
      author: "Jorge B",
      date: "1 month ago",
      rating: 4,
      text: "An excellent course. I’m not giving it the highest rating because I’d love deeper open-source examples.",
    },
    {
      author: "Sudeshna",
      date: "2 months ago",
      rating: 5,
      text: "I’m about halfway through and honestly it’s one of the best Udemy-style courses for LLMs and NLP.",
    },
    {
      author: "Kwe",
      date: "3 months ago",
      rating: 4,
      text: "Very good but where are the projects? Still, I’d give the course a solid 8/10.",
    },
  ];
  const moreCoursesByAuthor = [
    {
      title: "The Data Science Course: Complete Data Science Bootcamp 2026",
      subtitle: "Math, Statistics, Python, SQL, and practical analytics.",
      price: "€13.99",
      oldPrice: "€15.99",
      image: "https://i.ytimg.com/vi/3rGDJDmuZ54/hqdefault.jpg",
    },
    {
      title: "The Complete Financial Analyst Course 2026",
      subtitle: "Excel, accounting, valuation, and business analysis.",
      price: "€12.99",
      oldPrice: "€16.99",
      image: "https://i.ytimg.com/vi/NV6-rUPVFlk/hqdefault.jpg",
    },
    {
      title: "The Project Management Course: Beginner to Project Manager",
      subtitle: "Build PM foundations and ship projects with confidence.",
      price: "€12.99",
      oldPrice: "€16.99",
      image: "https://i.ytimg.com/vi/taj0UJfKx04/hqdefault.jpg",
    },
  ];

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
      <div className="w-full space-y-6 px-4 pb-8 pt-8">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="w-full px-4 pb-8 pt-8">
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
    <div className="w-full px-4 pb-8 pt-8">
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

          <Card className="border-border/60">
            <CardContent className="space-y-8 pt-6 text-sm text-muted-foreground leading-7">
              <section className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tight text-foreground">Requirements</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>No prior experience is required. We start from the basics.</li>
                  <li>You only need curiosity, internet access, and time to practice.</li>
                  <li>A laptop is recommended for coding exercises and demos.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-3xl font-bold tracking-tight text-foreground">Description</h3>
                <p className="text-foreground font-semibold">The Problem</p>
                <p>
                  AI is transforming every industry, but most people still struggle to find a
                  clear and practical learning path. Many programs are fragmented, too theoretical,
                  or disconnected from real-world projects.
                </p>
                <p>
                  This course is designed to solve that. We combine fundamentals, practical tools,
                  and guided project work so you can build useful AI products, not just consume
                  tutorials.
                </p>

                <p className="text-foreground font-semibold">The Solution</p>
                <p>This program is structured around practical outcomes, including:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Core AI concepts with hands-on examples.</li>
                  <li>Python workflows for machine learning and automation.</li>
                  <li>Natural language processing and modern LLM tooling.</li>
                  <li>Real project architecture with APIs and orchestration.</li>
                  <li>Portfolio-ready exercises focused on employable skills.</li>
                </ul>

                <p>
                  By the end, you will have a complete roadmap, practical confidence, and a
                  repeatable system to keep growing as AI keeps evolving.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-3xl font-bold tracking-tight text-foreground">Who this course is for</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Beginners who want a clear, modern path into AI.</li>
                  <li>Developers who want to integrate AI into products.</li>
                  <li>Professionals looking to transition into AI-focused roles.</li>
                  <li>Creators and founders building AI-powered solutions.</li>
                </ul>
              </section>

              {isDescriptionExpanded ? (
                <section className="space-y-4 border-t border-border/60 pt-6">
                  <p className="text-foreground font-semibold">More details</p>
                  <p>
                    You will also work with guided mini-projects that simulate real product
                    workflows, from defining a problem statement to implementing an AI-assisted
                    feature with clear success metrics.
                  </p>
                  <p>
                    The learning path is progressive: each module builds on the previous one so
                    you can move from fundamentals to applied implementation without gaps.
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Weekly practical checkpoints and review prompts.</li>
                    <li>Templates to structure your own AI experiments.</li>
                    <li>Clear next steps to continue after finishing the course.</li>
                  </ul>
                </section>
              ) : null}

              <div className="border-t border-border/60 pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer px-0 text-primary hover:text-primary"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                >
                  {isDescriptionExpanded ? "Mostrar menos" : "Mostrar más"}
                  {isDescriptionExpanded ? (
                    <ChevronDown className="size-4 rotate-180" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Students also bought</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedCourses.map((item) => (
                <div
                  key={item.title}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-bold text-primary">
                      {item.initials}
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground leading-tight">
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge
                          variant={item.label === "Premium" ? "default" : "secondary"}
                          className={item.label === "Premium" ? "" : "bg-teal-500/20 text-teal-400"}
                        >
                          {item.label}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Star className="size-3 fill-current" />
                          {item.rating}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <User className="size-3" />
                          {item.students}
                        </Badge>
                        <Badge variant="outline">{item.hours}</Badge>
                        <Badge variant="outline">{item.updated}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[90px] border-l border-border/60 pl-4 text-right">
                    <p className="text-lg font-bold text-foreground">{item.price}</p>
                    <p className="text-sm text-muted-foreground line-through">{item.oldPrice}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>From AI Engineering to AI Agents: Full Training Path</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="grid gap-4 rounded-lg border border-border/60 bg-background/60 p-3 md:grid-cols-[180px_1fr]">
                  <div className="relative h-24 overflow-hidden rounded-md bg-muted">
                    <Image
                      src="https://i.ytimg.com/vi/3rGDJDmuZ54/hqdefault.jpg"
                      alt="Intro to AI Agents and Agentic AI"
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-foreground">
                      Intro to AI Agents and Agentic AI
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Understand how AI agents work and how to leverage this technology
                      to transform your business and career.
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">365 Careers</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge className="bg-teal-500/20 text-teal-400">Bestseller</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="size-3 fill-current" />
                        4.5
                      </Badge>
                      <Badge variant="outline">50,629 ratings</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background">
                    <Plus className="size-5" />
                  </div>
                </div>

                <div className="grid gap-4 rounded-lg border border-border/60 bg-background/60 p-3 md:grid-cols-[180px_1fr]">
                  <div className="relative h-24 overflow-hidden rounded-md bg-muted">
                    <Image
                      src="https://i.ytimg.com/vi/3rGDJDmuZ54/hqdefault.jpg"
                      alt="The AI Engineer Course 2026"
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-foreground">
                      The AI Engineer Course 2026: Complete AI Engineer Bootcamp
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complete AI Engineer training: Python, NLP, transformers, LLMs,
                      LangChain, Hugging Face, APIs.
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">365 Careers</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge className="bg-teal-500/20 text-teal-400">Bestseller</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="size-3 fill-current" />
                        4.6
                      </Badge>
                      <Badge variant="outline">18,860 ratings</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-border/60 pt-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    €21.98{" "}
                    <span className="text-sm font-normal text-muted-foreground line-through">€29.98</span>
                  </p>
                </div>
                <Button className="cursor-pointer">Add all to cart</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary underline underline-offset-2">
                  365 Careers
                </p>
                <p className="text-sm text-muted-foreground">365 Careers</p>
              </div>

              <div className="grid gap-4 md:grid-cols-[100px_1fr]">
                <div className="flex h-16 w-24 items-center justify-center rounded-md bg-primary/20 text-xl font-bold text-primary">
                  365
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="size-4" />
                    <span>4.5 Instructor Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4" />
                    <span>1,204,458 Reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>3,857,564 Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    <span>132 Courses</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground leading-7">
                <p>
                  365 Careers is one of the world’s best-selling providers of business,
                  finance, data science, and AI courses on major online learning platforms.
                  Their courses have helped millions of students across 210+ countries.
                </p>
                <p>
                  Learners working at Apple, PayPal, and Citibank have completed 365 Careers
                  training programs to level up their practical skills and career opportunities.
                </p>
                <p>
                  The team focuses on structured, beginner-friendly learning paths that combine
                  conceptual depth with hands-on execution.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="space-y-6 pt-6">
              <div className="text-3xl font-bold text-foreground">
                <span className="inline-flex items-center gap-2">
                  <Star className="size-5 fill-current text-primary" />
                  4.6 course rating
                </span>{" "}
                <span className="text-muted-foreground">• 19K ratings</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {mockReviews.map((review) => (
                  <div
                    key={`${review.author}-${review.date}`}
                    className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                        <User className="size-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{review.author}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "size-3",
                                  i < review.rating
                                    ? "fill-current text-primary"
                                    : "text-muted-foreground/40"
                                )}
                              />
                            ))}
                          </span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">{review.text}</p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Helpful?</span>
                      <ThumbsUp className="size-3.5" />
                      <ThumbsDown className="size-3.5" />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="cursor-pointer">
                Show all reviews
              </Button>

              <div className="space-y-4 border-t border-border/60 pt-6">
                <h3 className="text-2xl font-bold text-foreground">
                  More Courses by <span className="text-primary underline underline-offset-2">365 Careers</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {moreCoursesByAuthor.map((item) => (
                    <div
                      key={item.title}
                      className="overflow-hidden rounded-lg border border-border/60 bg-background/60"
                    >
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="space-y-2 p-3">
                        <p className="line-clamp-2 text-base font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.subtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="outline" className="gap-1">
                            <Star className="size-3 fill-current" />
                            4.6
                          </Badge>
                          <Badge variant="outline">All levels</Badge>
                        </div>
                        <div className="pt-1">
                          <span className="text-lg font-bold text-foreground">{item.price}</span>{" "}
                          <span className="text-sm text-muted-foreground line-through">{item.oldPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full cursor-pointer text-primary">
                  Report abuse
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function CoursePurchaseSidebar({
  courseData,
  stats,
  locale,
}: {
  courseData: PublicCourseData | null | undefined;
  stats: {
    totalSections: number;
    totalElements: number;
    totalSeconds: number;
  };
  locale: string;
}) {
  const [isBuying, setIsBuying] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const previewVideos = useMemo(
    () => (courseData ? getPreviewVideos(courseData) : []),
    [courseData]
  );
  const [activePreviewVideoId, setActivePreviewVideoId] = useState(
    courseData?.youtubeVideoId ?? ""
  );

  const hasPurchased = useQuery(
    api.coursePurchases.hasPurchasedCourse,
    courseData ? { courseId: courseData._id } : "skip"
  );
  const enrollForFree = useMutation(api.coursePurchases.enrollForFree);

  useEffect(() => {
    setActivePreviewVideoId(courseData?.youtubeVideoId ?? "");
  }, [courseData?.youtubeVideoId]);

  if (courseData === undefined) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (!courseData) return null;

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
            <div className="flex size-18 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background/80">
              <PlayCircle className="size-10" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-center text-sm font-medium text-white">
            Preview this course
          </div>
        </button>

        <CardContent className="space-y-4 p-4">
          <div>
            {courseData.price && courseData.price > 0 ? (
              <span className="text-3xl font-extrabold">
                {formatCoursePrice(courseData.price, courseData.currency)}
              </span>
            ) : (
              <span className="text-3xl font-extrabold text-primary">Gratis</span>
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
            {hasPurchased === undefined ? (
              <Skeleton className="h-10 w-full" />
            ) : hasPurchased ? (
              <Button className="w-full cursor-pointer" disabled>
                Continuar aprendiendo
              </Button>
            ) : !courseData.price || courseData.price === 0 ? (
              <Button
                className="w-full cursor-pointer"
                onClick={async () => {
                  if (!courseData) return;
                  setIsBuying(true);
                  try {
                    await enrollForFree({ courseId: courseData._id });
                  } finally {
                    setIsBuying(false);
                  }
                }}
                disabled={isBuying}
              >
                {isBuying ? "Inscribiendo..." : "Inscribirme gratis"}
              </Button>
            ) : (
              <Button
                className="w-full cursor-pointer"
                onClick={async () => {
                  if (!courseData) return;
                  setIsBuying(true);
                  try {
                    const res = await fetch("/api/stripe/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId: courseData._id, locale }),
                    });
                    const data = await res.json() as { sessionUrl?: string };
                    if (data.sessionUrl) {
                      window.location.href = data.sessionUrl;
                    }
                  } catch {
                    // Stripe redirect failed
                  } finally {
                    setIsBuying(false);
                  }
                }}
                disabled={isBuying}
              >
                {isBuying
                  ? "Redirigiendo..."
                  : `Comprar — ${formatCoursePrice(courseData.price, courseData.currency)}`}
              </Button>
            )}
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
        <DialogContent
          className="!top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !max-w-none rounded-lg border p-0 overflow-hidden"
          style={{ width: "25vw", maxWidth: "25vw", height: "80vh" }}
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>{courseData.name}</DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4 h-[calc(80vh-88px)] overflow-y-auto">
            <div className="relative aspect-video w-full max-h-[45vh] overflow-hidden rounded-md border border-border/60 bg-black">
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

function CourseMobilePurchaseBar({
  courseData,
  locale,
}: {
  courseData: PublicCourseData | null | undefined;
  locale: string;
}) {
  const isPlayerCollapsed = useMusicStore((state) => state.isPlayerCollapsed);
  const { isCollapsed } = useSidebarStore();
  const [isBuying, setIsBuying] = useState(false);
  const hasPurchased = useQuery(
    api.coursePurchases.hasPurchasedCourse,
    courseData ? { courseId: courseData._id } : "skip"
  );
  const enrollForFree = useMutation(api.coursePurchases.enrollForFree);

  if (!courseData) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-[70] px-2 lg:hidden md:px-4",
        isPlayerCollapsed ? "bottom-8" : "bottom-20",
        isCollapsed ? "md:pl-28" : "md:pl-68"
      )}
    >
      <div className="rounded-xl border border-border/70 bg-background/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-3xl font-extrabold leading-none">
              {formatCoursePrice(courseData.price, courseData.currency)}
            </p>
          </div>

          {hasPurchased ? (
            <Button className="h-12 flex-1 text-base font-semibold cursor-pointer" disabled>
              Continuar aprendiendo
            </Button>
          ) : !courseData.price || courseData.price === 0 ? (
            <Button
              className="h-12 flex-1 text-base font-semibold cursor-pointer"
              disabled={isBuying}
              onClick={async () => {
                setIsBuying(true);
                try { await enrollForFree({ courseId: courseData._id }); }
                finally { setIsBuying(false); }
              }}
            >
              {isBuying ? "..." : "Inscribirme gratis"}
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 text-base font-semibold cursor-pointer"
              disabled={isBuying}
              onClick={async () => {
                setIsBuying(true);
                try {
                  const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ courseId: courseData._id, locale }),
                  });
                  const data = await res.json() as { sessionUrl?: string };
                  if (data.sessionUrl) window.location.href = data.sessionUrl;
                } catch { /* ignore */ }
                finally { setIsBuying(false); }
              }}
            >
              {isBuying ? "..." : "Comprar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseMarketplaceFooter() {
  const { isCollapsed } = useSidebarStore();

  const footerColumnsTop = [
    {
      title: "In-demand Careers",
      links: [
        "Data Scientist",
        "Full Stack Web Developer",
        "Cloud Engineer",
        "Project Manager",
        "Game Developer",
      ],
    },
    {
      title: "Web Development",
      links: ["Web Development", "JavaScript", "React JS", "Angular", "Java"],
    },
    {
      title: "IT Certifications",
      links: [
        "Amazon AWS",
        "AWS Certified Cloud Practitioner",
        "AZ-900: Azure Fundamentals",
        "Kubernetes",
      ],
    },
    {
      title: "Leadership",
      links: [
        "Leadership",
        "Management Skills",
        "Project Management",
        "Personal Productivity",
      ],
    },
  ];

  const footerColumnsBottom = [
    {
      title: "About",
      links: ["About us", "Careers", "Contact us", "Blog", "Investors"],
    },
    {
      title: "Discover Academy",
      links: ["Get the app", "Teach on Academy", "Plans and Pricing", "Affiliate", "Help and Support"],
    },
    {
      title: "Academy for Business",
      links: ["Academy Business"],
    },
    {
      title: "Legal & Accessibility",
      links: ["Accessibility statement", "Privacy policy", "Sitemap", "Terms"],
    },
  ];

  return (
    <footer
      className={cn(
        "relative z-[60] mt-auto w-full bg-primary text-primary-foreground",
        isCollapsed ? "md:pl-24" : "md:pl-64"
      )}
    >
      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto flex w-full max-w-[86rem] items-center justify-between gap-4 px-4 py-5 md:px-6">
          <p className="text-sm">
            Top companies choose <span className="font-semibold text-primary-foreground">Academy Business</span> to build in-demand career skills.
          </p>
          <div className="hidden items-center gap-4 text-xs text-primary-foreground/75 md:flex">
            <span>Nasdaq</span>
            <span>Volkswagen</span>
            <span>NetApp</span>
            <span>Eventbrite</span>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto grid w-full max-w-[86rem] gap-8 px-4 py-8 md:grid-cols-4 md:px-6">
          {footerColumnsTop.map((column) => (
            <div key={column.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-primary-foreground">{column.title}</h4>
              <ul className="space-y-2 text-xs text-primary-foreground/75">
                {column.links.map((link) => (
                  <li key={link} className="hover:text-primary-foreground transition-colors cursor-pointer">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto grid w-full max-w-[86rem] gap-8 px-4 py-8 md:grid-cols-4 md:px-6">
          {footerColumnsBottom.map((column) => (
            <div key={column.title} className="space-y-3">
              <h4 className="text-sm font-semibold text-primary-foreground">{column.title}</h4>
              <ul className="space-y-2 text-xs text-primary-foreground/75">
                {column.links.map((link) => (
                  <li key={link} className="hover:text-primary-foreground transition-colors cursor-pointer">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto flex w-full max-w-[86rem] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-primary-foreground/75 md:px-6">
          <div className="font-semibold text-primary-foreground">academy</div>
          <span>© 2026 Academy, Inc.</span>
          <span>Cookie settings</span>
          <span>English</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicAcademyCoursePage() {
  const params = useParams();
  const courseSlug = (params.courseSlug as string) ?? "";
  const locale = (params.locale as string) ?? "es";
  const isPlayerCollapsed = useMusicStore((state) => state.isPlayerCollapsed);

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
      <div
        className={cn(
          "flex min-h-screen flex-col",
          isPlayerCollapsed ? "-mb-8" : "-mb-20"
        )}
      >
        <div className="flex-1">
          <PrincipalLayout
            hero={<CourseHero courseData={courseData} stats={stats} />}
            content={<CourseMainContent courseData={courseData} />}
            rightSidebar={<CoursePurchaseSidebar courseData={courseData} stats={stats} locale={locale} />}
            containerWidthClassName="max-w-[86rem]"
          />
        </div>
        <CourseMobilePurchaseBar courseData={courseData} locale={locale} />
        <CourseMarketplaceFooter />
      </div>
    </MainLayout>
  );
}
