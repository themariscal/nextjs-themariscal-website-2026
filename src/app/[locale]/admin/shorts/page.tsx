"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ArrowUpDown, GripVertical, Plus, Save } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const PAGE_SIZE = 24;

type ShortItem = {
  _id: string;
  _creationTime: number;
  title: string;
  videoId: string;
  section?: string;
  page?: string;
  order?: number;
};

type SortableShortCardProps = {
  short: ShortItem;
  index: number;
  getShortSection: (short: { section?: string; page?: string }) => string;
};

function SortableShortCard({ short, index, getShortSection }: SortableShortCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: short._id });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`overflow-hidden ${isDragging ? "opacity-70 ring-2 ring-primary/40" : ""}`}
    >
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-sm line-clamp-2 flex items-start gap-2">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="size-8 rounded-md border border-border/60 bg-muted/40 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted"
            {...attributes}
            {...listeners}
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical className="size-4" />
          </button>
          <span className="pt-1">{short.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={`https://i.ytimg.com/vi/${short.videoId}/hqdefault.jpg`}
            alt={short.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>sección: {getShortSection(short)}</span>
          <span>videoId: {short.videoId}</span>
        </div>
        <p className="text-xs text-muted-foreground">Orden {index + 1}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminShortsPage() {
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [orderingItems, setOrderingItems] = useState<ShortItem[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const sectionFilter = selectedSection === "all" ? undefined : selectedSection;

  const sections = useQuery(api.youtubeShorts.getSections, {});
  const orderingShorts = useQuery(api.youtubeShorts.getBySectionForOrdering, {
    section: selectedSection === "all" ? "" : selectedSection,
  });
  const bulkUpdateOrder = useMutation(api.youtubeShorts.bulkUpdateOrder);
  const { results, status, loadMore } = usePaginatedQuery(
    api.youtubeShorts.getAllPaginated,
    { section: sectionFilter },
    { initialNumItems: PAGE_SIZE }
  );

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listItems =
    isOrderingMode && selectedSection !== "all"
      ? orderingItems
      : results;
  const selectedShort = listItems.find((item) => item._id === selectedShortId) ?? null;
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

  useEffect(() => {
    if (selectedSection === "all") {
      setIsOrderingMode(false);
      setOrderingItems([]);
      return;
    }
  }, [selectedSection]);

  useEffect(() => {
    if (!isOrderingMode || !orderingShorts) return;
    setOrderingItems(orderingShorts as ShortItem[]);
  }, [isOrderingMode, orderingShorts]);

  const handleOrderButtonClick = async () => {
    if (selectedSection === "all") return;

    if (!isOrderingMode) {
      setIsOrderingMode(true);
      return;
    }

    if (!orderingItems || orderingItems.length === 0) {
      toast.error("No hay shorts para ordenar en esta sección.");
      return;
    }

    try {
      setIsSavingOrder(true);
      await bulkUpdateOrder({
        items: orderingItems.map((short, index) => ({
          id: short._id,
          order: index + 1,
        })),
      });
      toast.success("Orden guardado.");
      setIsOrderingMode(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("No se pudo guardar el orden.");
      }
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderingItems((items) => {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

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
          {selectedSection !== "all" && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleOrderButtonClick}
              disabled={isSavingOrder}
            >
              {isOrderingMode ? <Save className="size-4" /> : <ArrowUpDown className="size-4" />}
              {isOrderingMode
                ? isSavingOrder
                  ? "Guardando..."
                  : "Guardar orden"
                : "Ordenar shorts"}
            </Button>
          )}
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
        <>
          {isOrderingMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderingItems.map((item) => item._id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {orderingItems.map((short, index) => (
                    <SortableShortCard
                      key={short._id}
                      short={short}
                      index={index}
                      getShortSection={getShortSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
        </>
      )}

      {!isOrderingMode && status === "LoadingMore" && (
        <p className="text-sm text-muted-foreground">Cargando más shorts...</p>
      )}
      {!isOrderingMode && <div ref={sentinelRef} className="h-1" />}

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
