"use client";

import { api } from "#convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginatedQuery, useQuery } from "convex/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 24;

export default function AdminShortsPage() {
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const pageFilter = selectedPage === "all" ? undefined : selectedPage;

  const pages = useQuery(api.youtubeShorts.getPages, {});
  const { results, status, loadMore } = usePaginatedQuery(
    api.youtubeShorts.getAllPaginated,
    { page: pageFilter },
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Shorts</h1>
          <p className="text-sm text-muted-foreground">
            Gestión y visualización de todos los shorts de Convex.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(pages ?? []).map((page) => (
                <SelectItem key={page} value={page}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{results.length} cargados</Badge>
        </div>
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
              onClick={() => router.push(`/${locale}/shorts/${short.page}/${short.videoId}`)}
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
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>page: {short.page}</span>
                  <span>videoId: {short.videoId}</span>
                </div>
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
