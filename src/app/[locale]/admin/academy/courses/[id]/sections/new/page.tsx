"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createAcademySchemas } from "@/lib/schemas/academy-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const sectionElementTypes = [
  { value: "video", label: "Video" },
  { value: "quiz", label: "Quiz" },
  { value: "resource", label: "Recurso" },
  { value: "note", label: "Nota" },
] as const;

export default function AdminAcademyNewCourseSectionPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";
  const courseId = params.id as Id<"academyCourses">;

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const course = useQuery(api.academyCourses.getCourseById, { courseId });
  const createSection = useMutation(api.academyCourses.createCourseSectionWithElements);

  const { createCourseSectionWithElementsSchema } = createAcademySchemas();
  type CreateCourseSectionWithElementsType = z.infer<typeof createCourseSectionWithElementsSchema>;

  const form = useForm<CreateCourseSectionWithElementsType>({
    resolver: zodResolver(createCourseSectionWithElementsSchema),
    defaultValues: {
      name: "",
      elements: [
        {
          type: "video",
          title: "",
          durationLabel: "",
          isPreview: false,
          contentUrl: "",
          contentText: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "elements",
  });

  const watchedElements = form.watch("elements");
  const sectionElementCount = useMemo(() => watchedElements?.length ?? 0, [watchedElements]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);

      await createSection({
        courseId,
        name: values.name,
        elements: values.elements.map((element) => ({
          type: element.type,
          title: element.title,
          durationLabel: element.durationLabel || undefined,
          isPreview: element.isPreview ?? false,
          contentUrl: element.contentUrl || undefined,
          contentText: element.contentText || undefined,
        })),
      });

      toast.success("Sección creada.");
      router.push(`/${locale}/admin/academy/courses/${courseId}/sections`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo guardar la sección.");
      }
    } finally {
      setIsSaving(false);
    }
  });

  if (course === undefined) {
    return (
      <AdminFormLayout title="Agregar sección" description="Cargando curso...">
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </AdminFormLayout>
    );
  }

  if (course === null) {
    return (
      <AdminFormLayout title="Agregar sección" description="No encontramos el curso solicitado.">
        <AlertErrorCard title="Curso no encontrado" message="Revisá el curso e intentá nuevamente." />
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title="Agregar sección"
      description={`Armá la sección para el curso: ${course.name}`}
      containerClassName="max-w-5xl"
    >
      <FormProvider {...form}>
        <form className="space-y-5" onSubmit={onSubmit}>
          {error ? <AlertErrorCard title="Error" message={error} /> : null}

          <div className="rounded-md border border-border/60 p-4 space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la sección</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Intro to AI Module: Getting started" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-md border border-border/60 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Section elements</h2>
                <p className="text-sm text-muted-foreground">
                  Agregá videos, quizzes, recursos y notas para esta sección.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() =>
                  append({
                    type: "video",
                    title: "",
                    durationLabel: "",
                    isPreview: false,
                    contentUrl: "",
                    contentText: "",
                  })
                }
              >
                <Plus className="size-4" />
                Agregar elemento
              </Button>
            </div>

            {fields.map((field, index) => {
              const selectedType = watchedElements?.[index]?.type ?? "video";

              return (
                <div key={field.id} className="space-y-3 rounded-md border border-border/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Elemento #{index + 1}</p>
                    {sectionElementCount > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      name={`elements.${index}.type`}
                      control={form.control}
                      render={({ field: typeField }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select value={typeField.value} onValueChange={typeField.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccioná tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectionElementTypes.map((typeOption) => (
                                <SelectItem key={typeOption.value} value={typeOption.value}>
                                  {typeOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`elements.${index}.title`}
                      control={form.control}
                      render={({ field: titleField }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input {...titleField} placeholder="Building an AI tool in 5 minutes" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      name={`elements.${index}.durationLabel`}
                      control={form.control}
                      render={({ field: durationField }) => (
                        <FormItem>
                          <FormLabel>Duración (opcional)</FormLabel>
                          <FormControl>
                            <Input {...durationField} placeholder="10:16" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`elements.${index}.isPreview`}
                      control={form.control}
                      render={({ field: previewField }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Preview</FormLabel>
                          <FormControl>
                            <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
                              <input
                                type="checkbox"
                                checked={!!previewField.value}
                                onChange={(event) => previewField.onChange(event.target.checked)}
                              />
                              Este elemento se puede marcar como preview
                            </label>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {(selectedType === "video" || selectedType === "resource") && (
                    <FormField
                      name={`elements.${index}.contentUrl`}
                      control={form.control}
                      render={({ field: urlField }) => (
                        <FormItem>
                          <FormLabel>URL (opcional)</FormLabel>
                          <FormControl>
                            <Input {...urlField} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedType === "note" && (
                    <FormField
                      name={`elements.${index}.contentText`}
                      control={form.control}
                      render={({ field: contentField }) => (
                        <FormItem>
                          <FormLabel>Contenido de la nota (opcional)</FormLabel>
                          <FormControl>
                            <textarea
                              {...contentField}
                              rows={4}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                              placeholder="Escribí la nota..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/admin/academy/courses/${courseId}/sections`)}
            >
              <ArrowLeft className="size-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar sección"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </AdminFormLayout>
  );
}
