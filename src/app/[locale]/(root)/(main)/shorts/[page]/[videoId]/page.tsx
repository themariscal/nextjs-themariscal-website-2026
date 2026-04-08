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
import { CommentsDialog } from "@/components/dialogs/shorts/comments-dialog";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { ResponsiveDialog } from "@/components/dialogs/layout";
import { LoginContent } from "@/components/dialogs/auth/login-content";
import { useMusicStore } from "@/lib/stores/music-store";
import { motion } from "motion/react";
import { AnimateNumber, type AnimateNumberProps } from "motion-plus/react";

const PENDING_REACTION_KEY = "pendingShortReaction";
const SHORT_TRANSITION_MS = 220;
const REACTION_NUMBER_FORMAT: AnimateNumberProps["format"] = {
  notation: "compact",
  compactDisplay: "short",
  roundingMode: "trunc",
};

const ShortsPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;
  const page = params?.page as string;
  const locale = (params?.locale as string) ?? "en";

  const { isSignedIn, isLoaded } = useUser();

  const short = useQuery(api.youtubeShorts.getByVideoId, { videoId });
  const allShorts = useQuery(api.youtubeShorts.getByPage, { page });
  const myReaction = useQuery(api.youtubeShorts.getMyReaction, { videoId });
  const reactionCounts = useQuery(api.youtubeShorts.getReactionCounts, { videoId });
  const comments = useQuery(api.shortComments.getComments, { videoId });
  const toggleReaction = useMutation(api.youtubeShorts.toggleReaction);

  const [loginOpen, setLoginOpen] = useState(false);
  const isPlayerCollapsed = useMusicStore((state) => state.isPlayerCollapsed);

  // After OAuth redirect back: execute pending reaction + show toast
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const raw = localStorage.getItem(PENDING_REACTION_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { videoId: string; reaction: "like" | "dislike"; timestamp: number };
      const isRecent = Date.now() - pending.timestamp < 2 * 60 * 1000; // 2 minutes
      if (pending.videoId === videoId && isRecent) {
        localStorage.removeItem(PENDING_REACTION_KEY);
        (async () => {
          try {
            await toggleReaction({ videoId, reaction: pending.reaction });
            toast.success(
              pending.reaction === "like"
                ? "¡Me gusta registrado con éxito!"
                : "No me gusta registrado con éxito",
              { autoClose: 3000 }
            );
          } catch {
            toast.error("No se pudo registrar la reacción");
          }
        })();
      }
    } catch {
      localStorage.removeItem(PENDING_REACTION_KEY);
    }
  }, [isLoaded, isSignedIn, videoId]);

  const currentIndex = allShorts?.findIndex((s) => s.videoId === videoId) ?? -1;
  const prevShort = allShorts && currentIndex > 0 ? allShorts[currentIndex - 1] : null;
  const nextShort = allShorts && currentIndex < allShorts.length - 1 ? allShorts[currentIndex + 1] : null;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showIcon, setShowIcon] = useState<"play" | "pause" | null>(null);
  const [navigationDirection, setNavigationDirection] = useState<"up" | "down" | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "exiting">("idle");
  const iconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, []);

  const navigate = (targetVideoId: string) => {
    router.push(`/${locale}/shorts/${page}/${targetVideoId}`);
  };

  const navigateOnce = (targetVideoId: string | null | undefined, direction: "up" | "down") => {
    if (!targetVideoId || navigatingGlobal) return;
    navigatingGlobal = true;
    setNavigationDirection(direction);
    setTransitionPhase("exiting");

    if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    if (navigatingTimer) clearTimeout(navigatingTimer);
    navigationTimerRef.current = setTimeout(() => {
      navigate(targetVideoId);
      navigatingTimer = setTimeout(() => { navigatingGlobal = false; }, 1200);
    }, SHORT_TRANSITION_MS);
  };

  const slideTransitionClass =
    transitionPhase === "idle" || !navigationDirection
      ? "translate-y-0 opacity-100"
      : navigationDirection === "down"
        ? "-translate-y-10 opacity-0"
        : "translate-y-10 opacity-0";

  const handleWheel = (deltaY: number) => {
    if (deltaY > 0) navigateOnce(nextShortRef.current?.videoId, "down");
    else if (deltaY < 0) navigateOnce(prevShortRef.current?.videoId, "up");
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e.deltaY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") navigateOnce(nextShortRef.current?.videoId, "down");
      if (e.key === "ArrowUp") navigateOnce(prevShortRef.current?.videoId, "up");
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleReaction = (reaction: "like" | "dislike") => {
    if (!isSignedIn) {
      localStorage.setItem(
        PENDING_REACTION_KEY,
        JSON.stringify({ videoId, reaction, timestamp: Date.now() })
      );
      setLoginOpen(true);
      return;
    }
    toggleReaction({ videoId, reaction });
  };

  return (
    <MainLayout>
      {/* Ambient glow — fixed, covers full viewport behind topbar and music player */}
      <div className="fixed inset-0 z-[1]" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt=""
          className="w-full h-full object-cover scale-150 blur-[72px] opacity-60 saturate-[1.8] brightness-75"
        />
      </div>

      <div
        className={cn(
          "relative z-[10] overflow-hidden",
          isPlayerCollapsed ? "h-[calc(100svh-80px)]" : "h-[calc(100svh-160px)]"
        )}
      >
        <div className="grid h-full w-full grid-cols-[1fr_auto_1fr] items-end pt-2 pb-4">

          {/* Video */}
          <div
            className={cn(
              "relative col-start-2 rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-xl h-full",
              "transition-all duration-200 ease-out will-change-transform",
              slideTransitionClass
            )}
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
          <div
            className={cn(
              "col-start-3 ml-3 flex flex-col items-center gap-5 justify-self-start pb-2",
              "transition-all duration-200 ease-out will-change-transform",
              slideTransitionClass
            )}
          >

            {/* Like */}
            <AnimatedReactionButton
              onClick={() => handleReaction("like")}
              isSelected={myReaction === "like"}
              title="Me gusta"
              tone="like"
              icon={<ThumbsUp className="w-5 h-5" />}
              count={reactionCounts?.likes ?? 0}
            />

            {/* Dislike */}
            <AnimatedReactionButton
              onClick={() => handleReaction("dislike")}
              isSelected={myReaction === "dislike"}
              title="No me gusta"
              tone="dislike"
              icon={<ThumbsDown className="w-5 h-5" />}
              count={reactionCounts?.dislikes ?? 0}
            />

            {/* Comments */}
            <CommentsDialog videoId={videoId}>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {comments && comments.length > 0 ? `Comentarios (${comments.length})` : "Comentarios"}
              </span>
            </CommentsDialog>

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
                onClick={() => navigateOnce(prevShort?.videoId, "up")}
                disabled={!prevShort}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/70 transition-colors"
                title="Anterior"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateOnce(nextShort?.videoId, "down")}
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

      {/* Login dialog — opens programmatically when reacting while not signed in */}
      <ResponsiveDialog
        isOpen={loginOpen}
        setIsOpen={setLoginOpen}
        content={<LoginContent setDialogIsOpen={setLoginOpen} />}
      >
        <span className="sr-only" />
      </ResponsiveDialog>
    </MainLayout>
  );
};

export default ShortsPlayerPage;

function AnimatedReactionButton({
  onClick,
  isSelected,
  title,
  tone,
  icon,
  count,
}: {
  onClick: () => void;
  isSelected: boolean;
  title: string;
  tone: "like" | "dislike";
  icon: React.ReactNode;
  count: number;
}) {
  const selectedClass =
    tone === "like" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground";

  return (
    <motion.button
      onClick={onClick}
      title={title}
      className="flex flex-col items-center gap-1"
      whileTap={{ scale: 0.9 }}
      animate={{ scale: isSelected ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
    >
      <motion.div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
          isSelected ? selectedClass : "bg-muted hover:bg-muted/70 text-foreground"
        )}
        animate={{ y: isSelected ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 20 }}
      >
        {icon}
      </motion.div>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        <AnimateNumber format={REACTION_NUMBER_FORMAT}>{count}</AnimateNumber>
      </span>
    </motion.button>
  );
}
