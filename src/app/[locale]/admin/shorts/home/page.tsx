"use client";

import { api } from "#convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginatedQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const PAGE = "home";
const PAGE_SIZE = 24;

export default function AdminHomeShortsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.youtubeShorts.getByPagePaginated,
    { page: PAGE },
    { initialNumItems: PAGE_SIZE }
  );
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Shorts Home</h1>
        <p className="text-sm text-muted-foreground">
          Listado de shorts publicados para la Home.
        </p>
        <Badge variant="secondary">{results.length} cargados</Badge>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <Skeleton className="aspect-[9/16] w-full rounded-md" />
                <Skeleton className="mt-3 h-4 w-5/6" />
                <Skeleton className="mt-2 h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((short) => (
            <Card
              key={short._id}
              className="group cursor-pointer overflow-hidden"
              onClick={() => router.push(`/${locale}/shorts/${PAGE}/${short.videoId}`)}
            >
              <CardHeader className="px-3 pt-3 pb-2">
                <CardTitle className="text-sm line-clamp-2">{short.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={`https://i.ytimg.com/vi/${short.videoId}/hqdefault.jpg`}
                    alt={short.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <p className="text-xs text-muted-foreground">videoId: {short.videoId}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {status === "LoadingMore" && (
        <p className="text-sm text-muted-foreground">Cargando más shorts...</p>
      )}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
