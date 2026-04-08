"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "#convex/_generated/api";

export const YouTubeShorts = ({ page }: { page: string }) => {
  const shorts = useQuery(api.youtubeShorts.getByPage, { page });
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale ?? "en";

  if (!shorts || shorts.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
        <div className="flex-shrink-0 w-0" />
        {shorts.map((short) => (
          <button
            key={short._id}
            onClick={() => router.push(`/${locale}/shorts/${page}/${short.videoId}`)}
            className="flex-shrink-0 group text-left"
          >
            <div className="relative w-[216px] h-96 rounded-xl overflow-hidden bg-muted">
              <Image
                src={`https://i.ytimg.com/vi/${short.videoId}/hqdefault.jpg`}
                alt={short.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="216px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium line-clamp-3 leading-tight">
                {short.title}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
