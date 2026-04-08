"use client";

import MainLayout from "@/components/elements/layouts/main-layout";
import { useQuery } from "convex/react";
import { ChevronDown, ChevronUp, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "#convex/_generated/api";

const ShortsPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;
  const page = params?.page as string;
  const locale = (params?.locale as string) ?? "en";

  const short = useQuery(api.youtubeShorts.getByVideoId, { videoId });
  const allShorts = useQuery(api.youtubeShorts.getByPage, { page });

  const currentIndex = allShorts?.findIndex((s) => s.videoId === videoId) ?? -1;
  const prevShort = allShorts && currentIndex > 0 ? allShorts[currentIndex - 1] : null;
  const nextShort = allShorts && currentIndex < allShorts.length - 1 ? allShorts[currentIndex + 1] : null;

  const navigate = (targetVideoId: string) => {
    router.push(`/${locale}/shorts/${page}/${targetVideoId}`);
  };

  const actionButtons = [
    { icon: ThumbsUp, label: "Me gusta", count: null },
    { icon: ThumbsDown, label: "No me gusta", count: null },
    { icon: MessageCircle, label: "Comentarios", count: null },
    { icon: Share2, label: "Compartir", count: null },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-background overflow-hidden">
        <div className="flex items-end gap-3">

          {/* Video */}
          <div
            className="relative rounded-2xl overflow-hidden bg-black flex-shrink-0 shadow-xl"
            style={{ height: "calc(100vh - 100px)", aspectRatio: "9/16" }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={short?.title ?? "Short"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />

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
            {/* Action buttons */}
            {actionButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1 group"
                title={label}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </button>
            ))}

            {/* Up / Down navigation */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                onClick={() => prevShort && navigate(prevShort.videoId)}
                disabled={!prevShort}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center disabled:opacity-30 hover:bg-muted/70 transition-colors"
                title="Anterior"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => nextShort && navigate(nextShort.videoId)}
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
