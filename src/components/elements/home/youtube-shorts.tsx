"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";

export const YouTubeShorts = ({ page }: { page: string }) => {
  const shorts = useQuery(api.youtubeShorts.getByPage, { page });

  if (!shorts || shorts.length === 0) return null;

  return (
    <div className="px-4 pt-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Shorts
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {shorts.map((short) => (
          <a
            key={short._id}
            href={`https://www.youtube.com/shorts/${short.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 group"
          >
            <div className="relative w-[120px] h-[213px] rounded-xl overflow-hidden bg-muted">
              <Image
                src={`https://i.ytimg.com/vi/${short.videoId}/hqdefault.jpg`}
                alt={short.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="120px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2 leading-tight">
                {short.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
