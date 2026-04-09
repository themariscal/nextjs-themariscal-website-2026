"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, ChevronDown, Circle, Clock3, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type ElementProgress = {
  manualCompleted: boolean;
  autoCompleted: boolean;
  watchedSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number | null;
  completedAt: number | null;
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
  progressByElement?: Record<string, ElementProgress>;
  lastPlayback?: {
    sectionId: Id<"academyCourseSections">;
    elementId: Id<"academyCourseSectionElements">;
    positionSeconds: number;
    updatedAt: number;
  } | null;
  courseProgress?: {
    totalElements: number;
    completedElements: number;
    percent: number;
    isCompleted: boolean;
  };
} | null;

type RouteParams = {
  locale?: string;
  courseSlug?: string;
};

type YouTubePlayerState = -1 | 0 | 1 | 2 | 3 | 5;

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (args: { videoId: string; startSeconds?: number }) => void;
  cueVideoById?: (args: { videoId: string; startSeconds?: number }) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: (event: { target: YouTubePlayer }) => void;
        onStateChange?: (event: { data: YouTubePlayerState; target: YouTubePlayer }) => void;
      };
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<YouTubeAPI> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (window.YT) {
        resolve(window.YT);
      }
    };
  });
}

function parseDurationToSeconds(value?: string): number {
  if (!value) return 0;
  const normalized = value.trim().toLowerCase();

  const mmss = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);

  const hhmmss = normalized.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (hhmmss) return Number(hhmmss[1]) * 3600 + Number(hhmmss[2]) * 60 + Number(hhmmss[3]);

  const min = normalized.match(/^(\d+)\s*min$/);
  if (min) return Number(min[1]) * 60;

  return 0;
}

export default function PurchasedCoursePlayerPage() {
  const params = useParams() as RouteParams;
  const router = useRouter();
  const locale = params.locale ?? "en";
  const courseSlug = params.courseSlug ?? "";

  const toggleCompleted = useMutation(api.academyCourses.toggleCourseElementCompleted);
  const upsertPlayback = useMutation(api.academyCourses.upsertCoursePlaybackProgress);

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

  const elementById = useMemo(() => {
    const map = new Map<string, SectionElement>();
    for (const section of sections) {
      for (const element of section.elements) {
        map.set(String(element._id), element);
      }
    }
    return map;
  }, [sections]);

  const sectionByElementId = useMemo(() => {
    const map = new Map<string, Id<"academyCourseSections">>();
    for (const section of sections) {
      for (const element of section.elements) {
        map.set(String(element._id), section._id);
      }
    }
    return map;
  }, [sections]);

  const orderedElements = useMemo(
    () =>
      sections.flatMap((section) =>
        section.elements.map((element) => ({ sectionId: section._id, element }))
      ),
    [sections]
  );

  const [activeElementId, setActiveElementId] = useState<Id<"academyCourseSectionElements"> | null>(null);
  const [pendingCompletionElementId, setPendingCompletionElementId] = useState<
    Id<"academyCourseSectionElements"> | null
  >(null);
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentVideoIdRef = useRef<string>("");
  const currentPlayerStateRef = useRef<YouTubePlayerState>(-1);
  const isPlayerReadyRef = useRef(false);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchedByElementRef = useRef<Record<string, number>>({});
  const hasInitializedActiveElementRef = useRef(false);

  const activeElement = activeElementId ? elementById.get(String(activeElementId)) ?? null : null;
  const activeSectionId = activeElementId
    ? sectionByElementId.get(String(activeElementId)) ?? null
    : null;
  const activeSectionIndex = useMemo(() => {
    if (!activeSectionId) return 0;
    const index = sections.findIndex((section) => section._id === activeSectionId);
    return index >= 0 ? index : 0;
  }, [activeSectionId, sections]);

  useEffect(() => {
    if (sections.length === 0) return;
    if (expandedSections.size > 0) return;

    const next = new Set<string>();
    const currentSection = sections[activeSectionIndex];
    if (currentSection) {
      next.add(String(currentSection._id));
    }
    const followingSection = sections[activeSectionIndex + 1];
    if (followingSection) {
      next.add(String(followingSection._id));
    }

    setExpandedSections(next);
  }, [activeSectionIndex, expandedSections.size, sections]);

  const activeVideoId = useMemo(() => {
    const selectedElement = activeElement ?? firstElement;
    if (!selectedElement) return playerData?.course?.youtubeVideoId ?? "";
    if (selectedElement.contentUrl) {
      const fromContentUrl = extractYouTubeVideoId(selectedElement.contentUrl);
      if (fromContentUrl) return fromContentUrl;
    }
    return playerData?.course?.youtubeVideoId ?? "";
  }, [activeElement, firstElement, playerData?.course?.youtubeVideoId]);

  const progressByElement = useMemo(
    () => playerData?.progressByElement ?? {},
    [playerData?.progressByElement]
  );
  const courseProgress = playerData?.courseProgress ?? {
    totalElements: 0,
    completedElements: 0,
    percent: 0,
    isCompleted: false,
  };

  const nextUncompletedElement = useMemo(() => {
    for (const section of sections) {
      for (const element of section.elements) {
        const elementProgress = progressByElement[String(element._id)];
        const isCompleted = Boolean(
          elementProgress?.manualCompleted || elementProgress?.autoCompleted
        );
        if (!isCompleted) {
          return element;
        }
      }
    }
    return null;
  }, [progressByElement, sections]);

  const tabs = ["Overview", "Q&A", "Notes", "Announcements", "Reviews", "Learning tools"];

  useEffect(() => {
    if (!playerData) return;

    if (playerData.accessDenied) {
      router.replace(`/${locale}/academy/courses/${courseSlug}`);
      return;
    }

    const hasActiveElement =
      activeElementId !== null && elementById.has(String(activeElementId));
    if (hasInitializedActiveElementRef.current && hasActiveElement) {
      return;
    }

    if (nextUncompletedElement) {
      setActiveElementId(nextUncompletedElement._id);
      hasInitializedActiveElementRef.current = true;
      return;
    }

    if (playerData.lastPlayback?.elementId && elementById.has(String(playerData.lastPlayback.elementId))) {
      setActiveElementId(playerData.lastPlayback.elementId);
      hasInitializedActiveElementRef.current = true;
      return;
    }

    if (firstElement) {
      setActiveElementId(firstElement._id);
      hasInitializedActiveElementRef.current = true;
    }
  }, [
    activeElementId,
    courseSlug,
    elementById,
    firstElement,
    locale,
    nextUncompletedElement,
    playerData,
    router,
  ]);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeApi().then(() => {
      if (isMounted) {
        setYoutubeApiReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getResumeSecondsForElement = useCallback(
    (elementId: Id<"academyCourseSectionElements"> | null) => {
      if (!elementId) return 0;
      const byProgress = progressByElement[String(elementId)]?.watchedSeconds ?? 0;
      if (playerData?.lastPlayback?.elementId === elementId) {
        return Math.max(byProgress, playerData.lastPlayback.positionSeconds ?? 0);
      }
      return byProgress;
    },
    [playerData?.lastPlayback?.elementId, playerData?.lastPlayback?.positionSeconds, progressByElement]
  );

  const persistProgress = useCallback(
    async (forceWatchedSeconds?: number) => {
      const courseId = playerData?.course?._id;
      if (!courseId || !activeElementId || !activeSectionId || !playerRef.current) return;

      const currentTime = Math.max(0, Math.floor(playerRef.current.getCurrentTime() || 0));
      const durationFromPlayer = Math.max(0, Math.floor(playerRef.current.getDuration() || 0));
      const durationFromMetadata = activeElement?.durationLabel
        ? parseDurationToSeconds(activeElement.durationLabel)
        : 0;
      const durationSeconds = durationFromPlayer || durationFromMetadata;

      const existingWatched = watchedByElementRef.current[String(activeElementId)] ?? 0;
      const watchedSeconds = Math.max(existingWatched, forceWatchedSeconds ?? currentTime);
      watchedByElementRef.current[String(activeElementId)] = watchedSeconds;

      await upsertPlayback({
        courseId,
        sectionId: activeSectionId,
        elementId: activeElementId,
        positionSeconds: currentTime,
        watchedSeconds,
        durationSeconds,
      });
    },
    [activeElement?.durationLabel, activeElementId, activeSectionId, playerData?.course?._id, upsertPlayback]
  );

  useEffect(() => {
    if (!youtubeApiReady || !playerContainerRef.current || !activeVideoId) return;

    if (!playerRef.current) {
      const startSeconds = getResumeSecondsForElement(activeElementId);
      const player = new window.YT!.Player(playerContainerRef.current, {
        videoId: activeVideoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 1,
          playsinline: 1,
          start: Math.floor(startSeconds),
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            isPlayerReadyRef.current = true;
            setIsPlayerReady(true);
            currentVideoIdRef.current = activeVideoId;
            if (startSeconds > 0) {
              event.target.seekTo(Math.floor(startSeconds), true);
            }
            event.target.playVideo();
          },
          onStateChange: async (event) => {
            currentPlayerStateRef.current = event.data;

            if (event.data === 2) {
              await persistProgress();
            }

            if (event.data === 0) {
              const duration = Math.floor(event.target.getDuration() || 0);
              await persistProgress(duration > 0 ? duration : undefined);
            }
          },
        },
      });

      playerRef.current = player;
      return;
    }

    if (currentVideoIdRef.current !== activeVideoId && isPlayerReady) {
      const startSeconds = getResumeSecondsForElement(activeElementId);
      const player = playerRef.current;
      if (!player) return;

      if (typeof player.loadVideoById === "function") {
        player.loadVideoById({
          videoId: activeVideoId,
          startSeconds: Math.floor(startSeconds),
        });
      } else if (typeof player.cueVideoById === "function") {
        player.cueVideoById({
          videoId: activeVideoId,
          startSeconds: Math.floor(startSeconds),
        });
        if (startSeconds > 0) {
          player.seekTo(Math.floor(startSeconds), true);
        }
        player.playVideo();
      } else {
        player.destroy();
        playerRef.current = null;
        isPlayerReadyRef.current = false;
        return;
      }
      currentVideoIdRef.current = activeVideoId;
    }
  }, [
    activeElementId,
    activeVideoId,
    getResumeSecondsForElement,
    isPlayerReady,
    persistProgress,
    youtubeApiReady,
  ]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    saveIntervalRef.current = setInterval(() => {
      if (currentPlayerStateRef.current !== 1) return;
      void persistProgress();
    }, 15000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [persistProgress]);

  useEffect(() => {
    const onBeforeUnload = () => {
      void persistProgress();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void persistProgress();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [persistProgress]);

  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      isPlayerReadyRef.current = false;
      setIsPlayerReady(false);
    };
  }, []);

  const handleToggleCompleted = async (
    sectionId: Id<"academyCourseSections">,
    elementId: Id<"academyCourseSectionElements">
  ) => {
    if (pendingCompletionElementId) return;
    setPendingCompletionElementId(elementId);

    try {
      const result = await toggleCompleted({
        courseId: playerData!.course!._id,
        sectionId,
        elementId,
      });

      if (result.completed) {
        const currentIndex = orderedElements.findIndex(
          (item) => item.element._id === elementId
        );
        const nextItem =
          currentIndex >= 0 && currentIndex < orderedElements.length - 1
            ? orderedElements[currentIndex + 1]
            : null;

        if (nextItem) {
          setActiveElementId(nextItem.element._id);
        }
      }
    } finally {
      setPendingCompletionElementId(null);
    }
  };

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

  return (
    <div className="w-full bg-background">
      <div className="grid min-h-[calc(100vh-6rem)] grid-cols-1 border-y border-border/60 bg-gradient-to-b from-background via-background to-muted/15 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="flex min-h-[62vh] flex-col border-r border-border/60">
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <div ref={playerContainerRef} className="h-full w-full" />
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

          <div className="space-y-3 border-t border-border/50 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mis Cursos</p>
              {courseProgress.isCompleted ? (
                <Badge className="bg-primary text-primary-foreground">Curso completado</Badge>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">{course.name}</h1>
            <p className="max-w-4xl text-sm text-muted-foreground">{course.description}</p>

            <div className="space-y-2 rounded-lg border border-border/60 bg-background/50 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">Progreso del curso</span>
                <span className="text-muted-foreground">
                  {courseProgress.completedElements}/{courseProgress.totalElements} • {courseProgress.percent}%
                </span>
              </div>
              <Progress value={courseProgress.percent} className="h-2.5" />
            </div>

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
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 border-b border-border/60 px-3 py-2 text-left"
                  onClick={() => {
                    setExpandedSections((prev) => {
                      const next = new Set(prev);
                      const key = String(section._id);
                      if (next.has(key)) {
                        next.delete(key);
                      } else {
                        next.add(key);
                      }
                      return next;
                    });
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      Sección {sectionIndex + 1}: {section.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{section.elements.length} lecciones</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-4 text-muted-foreground transition-transform",
                      expandedSections.has(String(section._id)) ? "rotate-180" : ""
                    )}
                  />
                </button>

                {expandedSections.has(String(section._id)) ? (
                  <div className="space-y-1 p-2">
                    {section.elements.map((element, elementIndex) => {
                      const isActive = activeElementId === element._id;
                      const elementProgress = progressByElement[String(element._id)];
                      const isCompleted = Boolean(
                        elementProgress?.manualCompleted || elementProgress?.autoCompleted
                      );

                      return (
                        <div
                          key={element._id}
                          className={cn(
                            "flex items-start gap-2 rounded-md border px-2 py-2",
                            isActive
                              ? "border-primary/70 bg-primary/10"
                              : "border-transparent hover:border-border hover:bg-muted/45"
                          )}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            className="flex min-w-0 flex-1 cursor-pointer items-start gap-2"
                            onClick={() => setActiveElementId(element._id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setActiveElementId(element._id);
                              }
                            }}
                          >
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
                                {isActive ? <span className="text-primary">viendo ahora</span> : null}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isCompleted ? "secondary" : "outline"}
                            disabled={pendingCompletionElementId === element._id}
                            onClick={() => {
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
                      );
                    })}
                  </div>
                ) : null}
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
