"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { AdminFormLayout } from "@/components/elements/layouts/admin-form-layout";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createAcademySchemas } from "@/lib/schemas/academy-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

export default function AdminAcademyCourseSectionsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";
  const courseId = params.id as Id<"academyCourses">;

  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const course = useQuery(api.academyCourses.getCourseById, { courseId });
  const sections = useQuery(api.academyCourses.getCourseSections, { courseId });
  const addCourseSection = useMutation(api.academyCourses.addCourseSection);

  const { addCourseSectionSchema } = createAcademySchemas();
  type AddCourseSectionType = z.infer<typeof addCourseSectionSchema>;

  const form = useForm<AddCourseSectionType>({
    resolver: zodResolver(addCourseSectionSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleAddSection = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);
      await addCourseSection({
        courseId,
        name: values.name,
      });
      toast.success("Sección agregada.");
      form.reset({ name: "" });
      setDialogOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo agregar la sección.");
      }
    } finally {
      setIsSaving(false);
    }
  });

  if (course === undefined || sections === undefined) {
    return (
      <AdminFormLayout title="Sections" description="Cargando secciones del curso...">
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AdminFormLayout>
    );
  }

  if (course === null) {
    return (
      <AdminFormLayout title="Sections" description="No encontramos el curso solicitado.">
        <AlertErrorCard title="Curso no encontrado" message="Revisá el curso e intentá nuevamente." />
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title="Sections"
      description={`Gestioná las secciones del curso: ${course.name}`}
      containerClassName="max-w-4xl"
    >
      {error ? <AlertErrorCard title="Error" message={error} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">{sections.length} secciones</Badge>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => router.push(`/${locale}/admin/academy/courses`)}
          >
            <ArrowLeft className="size-4" />
            Volver a cursos
          </Button>
          <Button className="cursor-pointer" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Agregar sección
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Este curso todavía no tiene secciones.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sections.map((section) => (
            <Card key={section._id}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">{section.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                Orden: {section.order ?? "-"}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar sección</DialogTitle>
            <DialogDescription>
              Creá una nueva sección para este curso.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <form className="grid gap-4" onSubmit={handleAddSection}>
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la sección</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Introducción" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </AdminFormLayout>
  );
}
