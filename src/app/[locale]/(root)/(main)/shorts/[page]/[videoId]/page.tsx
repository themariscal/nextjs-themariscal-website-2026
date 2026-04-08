"use client";

import MainLayout from "@/components/elements/layouts/main-layout";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../../../convex/_generated/api";

const ShortsPlayerPage = () => {
  const params = useParams();
  const router = useRouter();
  const videoId = params?.videoId as string;
  const page = params?.page as string;
  const locale = params?.locale as string ?? "en";

  const short = useQuery(api.youtubeShorts.getByVideoId, { videoId });

  return (
    <MainLayout>
      <div className="flex flex-col items-center min-h-screen bg-background pt-6 pb-12 px-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* 9:16 player */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl" style={{ aspectRatio: "9/16" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={short?.title ?? "Short"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {short && (
            <div className="mt-4">
              <p className="text-sm font-semibold leading-snug">{short.title}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ShortsPlayerPage;
