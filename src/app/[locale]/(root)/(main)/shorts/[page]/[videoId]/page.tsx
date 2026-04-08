"use client";

// Module-level guard — survives component remounts during navigation
let navigatingGlobal = false;
let navigatingTimer: ReturnType<typeof setTimeout> | null = null;

import MainLayout from "@/components/elements/layouts/main-layout";
import { useQuery, useMutation } from "convex/react";
import { ChevronDown, ChevronUp, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "#convex/_generated/api";
import { cn } from "@/lib/utils";

const ShortsPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;
  const page = params?.page as string;
  const locale = (params?.locale as string) ?? "en";

  const short = useQuery(api.youtubeShorts.getByVideoId, { videoId });
  const allShorts = useQuery(api.youtubeShorts.getByPage, { page });
  const myReaction = useQuery(api.youtubeShorts.getMyReaction, { videoId });
  const reactionCounts = useQuery(api.youtubeShorts.getReactionCounts, { videoId });
  const toggleReaction = useMutation(api.youtubeShorts.toggleReaction);

  const currentIndex = allShorts?.findIndex((s) => s.videoId === videoId) ?? -1;
  const prevShort = allShorts && currentIndex > 0 ? allShorts[currentIndex - 1] : null;
  const nextShort = allShorts && currentIndex < allShorts.length - 1 ? allShorts[currentIndex + 1] : null;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showIcon, setShowIcon] = useState<"play" | "pause" | null>(null);
  const iconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlayPause = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    if (isPlaying) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "*");
      setIsPlaying(false);
      flashIcon("pause");
    } else {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: "" }), "*");
      setIsPlaying(true);
      flashIcon("play");
    }
  };

  const flashIcon = (icon: "play" | "pause") => {
    setShowIcon(icon);
    if (iconTimer.current) clearTimeout(iconTimer.current);
    iconTimer.current = setTimeout(() => setShowIcon(null), 700);
  };

  const nextShortRef = useRef(nextShort);
  const prevShortRef = useRef(prevShort);

  useEffect(() => {
    nextShortRef.current = nextShort;
    prevShortRef.current = prevShort;
  }, [nextShort, prevShort]);

  const navigate = (targetVideoId: string) => {
    router.push(`/${locale}/shorts/${page}/${targetVideoId}`);
  };

  const navigateOnce = (targetVideoId: string | null | undefined) => {
    if (!targetVideoId || navigatingGlobal) return;
    navigatingGlobal = true;
    if (navigatingTimer) clearTimeout(navigatingTimer);
    navigate(targetVideoId);
    navigatingTimer = setTimeout(() => { navigatingGlobal = false; }, 1200);
  };

  const handleWheel = (deltaY: number) => {
    if (deltaY > 0) navigateOnce(nextShortRef.current?.videoId);
    else if (deltaY < 0) navigateOnce(prevShortRef.current?.videoId);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e.deltaY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") navigateOnce(nextShortRef.current?.videoId);
      if (e.key === "ArrowUp") navigateOnce(prevShortRef.current?.videoId);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleReaction = (reaction: "like" | "dislike") => {
    toggleReaction({ videoId, reaction });
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n > 0 ? String(n) : null;
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[calc(100svh-160px)] bg-background overflow-hidden">
        <div className="flex items-end gap-3 h-full py-2">

          {/* Video */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-xl h-full"
            style={{ aspectRatio: "9/16" }}
          >
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={short?.title ?? "Short"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />

            {/* Overlay: captures wheel (navigation) and click (play/pause) */}
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onWheel={(e) => { e.preventDefault(); handleWheel(e.deltaY); }}
              onClick={togglePlayPause}
            />

            {/* Play/Pause flash icon */}
            {showIcon && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-5 transition-opacity duration-300">
                  {showIcon === "pause"
                    ? <div className="flex gap-1.5"><div className="w-3 h-8 bg-white rounded-sm" /><div className="w-3 h-8 bg-white rounded-sm" /></div>
                    : <div className="w-0 h-0 border-t-[14px] border-b-[14px] border-l-[24px] border-t-transparent border-b-transparent border-l-white ml-1" />
                  }
                </div>
              </div>
            )}

            {/* Title overlay at bottom */}
            {short && (
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                  {short.title}
                </p>
              </div>
            )}
          </div>

          {/* Right action column */}
          <div className="flex flex-col items-center gap-5 pb-2">

            {/* Like */}
            <button
              onClick={() => handleReaction("like")}
              className="flex flex-col items-center gap-1 group"
              title="Me gusta"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                myReaction === "like"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted group-hover:bg-muted/70"
              )}>
                <ThumbsUp className={cn(
                  "w-5 h-5 transition-colors",
                  myReaction === "like" ? "text-primary-foreground" : "text-foreground"
                )} />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatCount(reactionCounts?.likes ?? 0) ?? "Me gusta"}
              </span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => handleReaction("dislike")}
              className="flex flex-col items-center gap-1 group"
              title="No me gusta"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                myReaction === "dislike"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted group-hover:bg-muted/70"
              )}>
                <ThumbsDown className={cn(
                  "w-5 h-5 transition-colors",
                  myReaction === "dislike" ? "text-destructive-foreground" : "text-foreground"
                )} />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatCount(reactionCounts?.dislikes ?? 0) ?? "No me gusta"}
              </span>
            </button>

            {/* Comments */}
            <button
              className="flex flex-col items-center gap-1 group"
              title="Comentarios"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">Comentarios</span>
            </button>

            {/* Share */}
            <button
              className="flex flex-col items-center gap-1 group"
              title="Compartir"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                <Share2 className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">Compartir</span>
            </button>

            {/* Up / Down navigation */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                onClick={() => navigateOnce(prevShort?.videoId)}
                disabled={!prevShort}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/70 transition-colors"
                title="Anterior"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateOnce(nextShort?.videoId)}
                disabled={!nextShort}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/70 transition-colors"
                title="Siguiente"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default ShortsPlayerPage;
