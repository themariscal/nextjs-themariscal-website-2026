"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { z } from "zod";
import { createShortsSchemas } from "@/lib/schemas/shorts-schemas";

function extractYouTubeVideoId(urlOrId: string): string | null {
  const value = urlOrId.trim();
  if (!value) return null;

  if (/^[A-Za-z0-9_-]{6,}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (url.hostname.includes("youtube.com")) {
      const shortsMatch = url.pathname.match(/\/shorts\/([A-Za-z0-9_-]{6,})/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;
    }
  } catch {
    return null;
  }

  return null;
}

export default function AdminEditShortPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<"youtubeShorts">;
  const locale = (params.locale as string) ?? "en";

  const short = useQuery(api.youtubeShorts.getById, { id });
  const updateShort = useMutation(api.youtubeShorts.update);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { editShortSchema } = createShortsSchemas();
  type EditShortType = z.infer<typeof editShortSchema>;

  const defaultValues = useMemo<EditShortType>(
    () => ({
      title: "",
      page: "",
      shortUrl: "",
      order: "",
    }),
    []
  );

  const form = useForm<EditShortType>({
    resolver: zodResolver(editShortSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!short) return;

    form.reset({
      title: short.title,
      page: short.page,
      shortUrl: `https://www.youtube.com/shorts/${short.videoId}`,
      order: short.order !== undefined ? String(short.order) : "",
    });
  }, [short, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);

      const videoId = extractYouTubeVideoId(values.shortUrl);
      if (!videoId) {
        setError("No pudimos extraer el videoId desde la URL.");
        return;
      }

      await updateShort({
        id,
        title: values.title,
        page: values.page,
        videoId,
        order: values.order && values.order.length > 0 ? Number(values.order) : undefined,
      });

      toast.success("Short actualizado.");
      router.push(`/${locale}/admin/shorts`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al actualizar el short.");
      }
    } finally {
      setIsSaving(false);
    }
  });

  if (short === undefined) {
    return <p className="text-sm text-muted-foreground">Cargando short...</p>;
  }

  if (short === null) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Editar short</h1>
        <p className="text-sm text-muted-foreground">No encontramos ese short.</p>
        <Button variant="outline" onClick={() => router.push(`/${locale}/admin/shorts`)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Editar short</h1>
        <p className="text-sm text-muted-foreground">
          Actualizá título, página y URL del short.
        </p>
      </div>

      <FormProvider {...form}>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          {error && <AlertErrorCard title="Error" message={error} />}

          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="page"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Página</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="home" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="shortUrl"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL del short</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://www.youtube.com/shorts/VIDEO_ID" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="order"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="26" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/admin/shorts`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

