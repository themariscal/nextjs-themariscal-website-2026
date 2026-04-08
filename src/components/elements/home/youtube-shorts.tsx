"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePaginatedQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "#convex/_generated/api";

const PAGE_SIZE = 10;

export const YouTubeShorts = ({ page }: { page: string }) => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.youtubeShorts.getByPagePaginated,
    { page },
    { initialNumItems: PAGE_SIZE }
  );
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale ?? "en";
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex-shrink-0 w-0" />
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <Skeleton className="w-[216px] h-96 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: "smooth" }}>
        <div className="flex-shrink-0 w-0" />
        {results.map((short) => (
          <button
            key={short._id}
            onClick={() => router.push(`/${locale}/shorts/${page}/${short.videoId}`)}
            className="flex-shrink-0 group text-left cursor-pointer"
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
        {status === "LoadingMore" && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`loading-${i}`} className="flex-shrink-0">
              <Skeleton className="w-[216px] h-96 rounded-xl" />
            </div>
          ))
        )}
        <div ref={sentinelRef} className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
};
