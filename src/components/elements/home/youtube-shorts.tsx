"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";

export const YouTubeShorts = ({ page }: { page: string }) => {
  const shorts = useQuery(api.youtubeShorts.getByPage, { page });

  if (!shorts || shorts.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
        <div className="flex-shrink-0 w-0" />
        {shorts.map((short) => (
          <a
            key={short._id}
            href={`https://www.youtube.com/shorts/${short.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 group"
          >
            <div className="relative w-[108px] h-48 rounded-xl overflow-hidden bg-muted">
              <Image
                src={`https://i.ytimg.com/vi/${short.videoId}/hqdefault.jpg`}
                alt={short.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="108px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-medium line-clamp-3 leading-tight">
                {short.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
