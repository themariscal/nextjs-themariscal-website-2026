"use client";

import { api } from "#convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 24;

export default function AdminShortsPage() {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sectionFilter = selectedSection === "all" ? undefined : selectedSection;

  const sections = useQuery(api.youtubeShorts.getSections, {});
  const { results, status, loadMore } = usePaginatedQuery(
    api.youtubeShorts.getAllPaginated,
    { section: sectionFilter },
    { initialNumItems: PAGE_SIZE }
  );

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const sentinelRef = useRef<HTMLDivElement>(null);
  const selectedShort = results.find((item) => item._id === selectedShortId) ?? null;
  const getShortSection = (short: { section?: string; page?: string }) =>
    short.section ?? short.page ?? "home";

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
          <Button
            className="cursor-pointer"
            onClick={() => router.push(`/${locale}/admin/shorts/new`)}
          >
            <Plus className="size-4" />
            Agregar short
          </Button>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {(sections ?? []).map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {results.map((short) => (
            <Card
              key={short._id}
              className="group cursor-pointer overflow-hidden"
              onClick={() => {
                setSelectedShortId(short._id);
                setDialogOpen(true);
              }}
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
                  <span>sección: {getShortSection(short)}</span>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[36vw] max-w-[36vw] sm:max-w-[36vw] h-[44vh] p-0 overflow-hidden">
          {selectedShort && (
            <div className="grid h-full md:grid-cols-[240px_1fr]">
              <div className="relative bg-muted min-h-[180px] md:min-h-full">
                <Image
                  src={`https://i.ytimg.com/vi/${selectedShort.videoId}/hqdefault.jpg`}
                  alt={selectedShort.title}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
              </div>
              <div className="p-6 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedShort.title}</DialogTitle>
                  <DialogDescription>
                    Detalle del short seleccionado.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between gap-3 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Sección</span>
                    <span className="font-medium">{getShortSection(selectedShort)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Video ID</span>
                    <span className="font-medium">{selectedShort.videoId}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Orden</span>
                    <span className="font-medium">{selectedShort.order ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Creado</span>
                    <span className="font-medium">
                      {new Date(selectedShort._creationTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <DialogFooter className="mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      router.push(`/${locale}/admin/shorts/${selectedShort._id}/edit`);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      router.push(
                        `/${locale}/shorts/${getShortSection(selectedShort)}/${selectedShort.videoId}`
                      );
                    }}
                  >
                    Ver video
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
