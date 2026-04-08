"use client";

import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "#convex/_generated/api";

const ShortsPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;
  const locale = (params?.locale as string) ?? "en";

  const short = useQuery(api.youtubeShorts.getByVideoId, { videoId });

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden z-50">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors bg-black/30 hover:bg-black/50 rounded-full px-3 py-2 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Video — centered, fills height, respects 9:16 ratio */}
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <div
          className="relative w-full h-full max-w-[calc(100vh*9/16)]"
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={short?.title ?? "Short"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>

      {/* Title bar at bottom */}
      {short && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <p className="text-white text-sm font-medium leading-snug line-clamp-2">
            {short.title}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShortsPlayerPage;
