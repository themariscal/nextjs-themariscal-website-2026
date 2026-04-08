"use client";

import { api } from "#convex/_generated/api";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createShortsSchemas } from "@/lib/schemas/shorts-schemas";
import { useMutation, useQuery } from "convex/react";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { z } from "zod";

type ResolvedShort = {
  videoId: string;
  shortUrl: string;
  title: string;
  authorName: string;
  thumbnailUrl: string;
};

export default function AdminNewShortPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";

  const [lookupUrl, setLookupUrl] = useState("");
  const [resolvedShort, setResolvedShort] = useState<ResolvedShort | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);

  const createShort = useMutation(api.youtubeShorts.create);
  const addSection = useMutation(api.youtubeShorts.addSection);
  const sections = useQuery(api.youtubeShorts.getSections, {});
  const { createShortSchema, addSectionSchema } = createShortsSchemas();
  type CreateShortType = z.infer<typeof createShortSchema>;
  type AddSectionType = z.infer<typeof addSectionSchema>;

  const form = useForm<CreateShortType>({
    resolver: zodResolver(createShortSchema),
    defaultValues: {
      title: "",
      section: "home",
      videoId: "",
      shortUrl: "",
      order: "",
    },
  });

  const sectionForm = useForm<AddSectionType>({
    resolver: zodResolver(addSectionSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleResolveShort = async () => {
    try {
      setLookupError(null);
      setIsResolving(true);

      const response = await fetch(
        `/api/youtube/resolve-short?url=${encodeURIComponent(lookupUrl)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo resolver el short.");
      }

      const resolved = data as ResolvedShort;
      setResolvedShort(resolved);
      form.reset({
        title: resolved.title,
        section: "home",
        videoId: resolved.videoId,
        shortUrl: resolved.shortUrl,
        order: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        setLookupError(error.message);
      } else {
        setLookupError("Error al buscar la información del short.");
      }
      setResolvedShort(null);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setLookupError(null);
      setIsSaving(true);

      await createShort({
        videoId: values.videoId,
        title: values.title,
        section: values.section,
        order: values.order && values.order.length > 0 ? Number(values.order) : undefined,
      });

      toast.success("Short agregado.");
      router.push(`/${locale}/admin/shorts`);
    } catch (error) {
      if (error instanceof Error) {
        setLookupError(error.message);
      } else {
        setLookupError("Error al guardar el short.");
      }
    } finally {
      setIsSaving(false);
    }
  });

  const handleAddSection = sectionForm.handleSubmit(async (values) => {
    try {
      setSectionError(null);
      setIsAddingSection(true);

      const normalizedName = values.name.trim().toLowerCase();
      await addSection({ name: normalizedName });

      form.setValue("section", normalizedName, { shouldValidate: true });
      sectionForm.reset({ name: "" });
      setSectionDialogOpen(false);
      toast.success("Sección agregada.");
    } catch (error) {
      if (error instanceof Error) {
        setSectionError(error.message);
      } else {
        setSectionError("Error al agregar la sección.");
      }
    } finally {
      setIsAddingSection(false);
    }
  });

  return (
    <AdminFormLayout
      title="Agregar short"
      description="Pegá la URL del short, buscá sus datos y completá los campos."
    >
      <div className="grid gap-3">
        <Label>URL del short</Label>
        <div className="flex gap-2">
          <Input
            value={lookupUrl}
            onChange={(e) => setLookupUrl(e.target.value)}
            placeholder="https://www.youtube.com/shorts/VIDEO_ID"
          />
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isResolving || lookupUrl.trim().length === 0}
            onClick={handleResolveShort}
          >
            <Search className="size-4" />
            {isResolving ? "Buscando..." : "Buscar short"}
          </Button>
        </div>
      </div>

      {lookupError && <AlertErrorCard title="Error" message={lookupError} />}

      {resolvedShort && (
        <FormProvider {...form}>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="relative w-40 h-64 rounded-md overflow-hidden border border-border">
              <Image
                src={resolvedShort.thumbnailUrl}
                alt={resolvedShort.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>

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
              name="section"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sección</FormLabel>
                  <div className="flex gap-2">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccioná una sección" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sections ?? []).map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setSectionDialogOpen(true)}
                    >
                      <Plus className="size-4" />
                      Agregar sección
                    </Button>
                  </div>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="videoId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} inputMode="numeric" placeholder="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${locale}/admin/shorts`)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Agregar short"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}

      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar sección</DialogTitle>
            <DialogDescription>
              Creá una nueva sección para clasificar shorts.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...sectionForm}>
            <form className="grid gap-4" onSubmit={handleAddSection}>
              {sectionError && <AlertErrorCard title="Error" message={sectionError} />}
              <FormField
                name="name"
                control={sectionForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="home" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSectionDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAddingSection}>
                  {isAddingSection ? "Agregando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </AdminFormLayout>
  );
}
