"use client";

import { api } from "#convex/_generated/api";
import type { Id } from "#convex/_generated/dataModel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createAcademySchemas } from "@/lib/schemas/academy-schemas";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

export default function AdminAcademyEditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";
  const courseId = params.id as Id<"academyCourses">;

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isAddingInstructor, setIsAddingInstructor] = useState(false);

  const course = useQuery(api.academyCourses.getCourseById, { courseId });
  const languages = useQuery(api.academyCourses.getLanguages, {});
  const instructors = useQuery(api.academyCourses.getInstructors, {});
  const updateCourse = useMutation(api.academyCourses.updateCourse);
  const addLanguage = useMutation(api.academyCourses.addLanguage);
  const addInstructor = useMutation(api.academyCourses.addInstructor);

  const { createCourseSchema, addLanguageSchema, addInstructorSchema } =
    createAcademySchemas();

  type CourseFormType = z.infer<typeof createCourseSchema>;
  type AddLanguageType = z.infer<typeof addLanguageSchema>;
  type AddInstructorType = z.infer<typeof addInstructorSchema>;

  const form = useForm<CourseFormType>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      youtubeUrl: "",
      languageId: "",
      instructorId: "",
      description: "",
    },
  });

  const languageForm = useForm<AddLanguageType>({
    resolver: zodResolver(addLanguageSchema),
    defaultValues: { name: "" },
  });

  const instructorForm = useForm<AddInstructorType>({
    resolver: zodResolver(addInstructorSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (!course) return;

    form.reset({
      name: course.name,
      youtubeUrl: course.youtubeUrl,
      languageId: course.languageId,
      instructorId: course.instructorId,
      description: course.description,
    });
  }, [course, form]);

  const handleUpdateCourse = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);

      const videoId = extractYouTubeVideoId(values.youtubeUrl);
      if (!videoId) {
        setError("No pudimos extraer el videoId desde la URL de YouTube.");
        return;
      }

      await updateCourse({
        courseId,
        name: values.name,
        youtubeUrl: values.youtubeUrl,
        youtubeVideoId: videoId,
        languageId: values.languageId as Id<"courseLanguages">,
        instructorId: values.instructorId as Id<"courseInstructors">,
        description: values.description,
      });

      toast.success("Curso actualizado.");
      router.push(`/${locale}/admin/academy/courses`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al actualizar el curso.");
      }
    } finally {
      setIsSaving(false);
    }
  });

  const handleAddLanguage = languageForm.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsAddingLanguage(true);
      const id = await addLanguage({ name: values.name });
      if (id) {
        form.setValue("languageId", id as string, { shouldValidate: true });
      }
      languageForm.reset({ name: "" });
      setLanguageDialogOpen(false);
      toast.success("Idioma agregado.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo agregar el idioma.");
      }
    } finally {
      setIsAddingLanguage(false);
    }
  });

  const handleAddInstructor = instructorForm.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsAddingInstructor(true);
      const id = await addInstructor({ name: values.name });
      if (id) {
        form.setValue("instructorId", id as string, { shouldValidate: true });
      }
      instructorForm.reset({ name: "" });
      setInstructorDialogOpen(false);
      toast.success("Instructor agregado.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo agregar el instructor.");
      }
    } finally {
      setIsAddingInstructor(false);
    }
  });

  if (course === undefined) {
    return (
      <AdminFormLayout
        title="Editar curso"
        description="Actualizá los datos principales del curso."
      >
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AdminFormLayout>
    );
  }

  if (course === null) {
    return (
      <AdminFormLayout
        title="Editar curso"
        description="No encontramos el curso solicitado."
      >
        <AlertErrorCard title="Curso no encontrado" message="Revisá el curso e intentá nuevamente." />
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout
      title="Editar curso"
      description="Actualizá los datos principales del curso."
    >
      <FormProvider {...form}>
        <form className="grid gap-5" onSubmit={handleUpdateCourse}>
          {error && <AlertErrorCard title="Error" message={error} />}

          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del curso</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="youtubeUrl"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video YouTube</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://www.youtube.com/watch?v=..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="languageId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma</FormLabel>
                <div className="flex gap-2">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un idioma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(languages ?? []).map((language) => (
                        <SelectItem key={language._id} value={language._id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setLanguageDialogOpen(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="instructorId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <div className="flex gap-2">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un instructor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(instructors ?? []).map((instructor) => (
                        <SelectItem key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setInstructorDialogOpen(true)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción del curso</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={6}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    placeholder="Contá de qué trata el curso..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/admin/academy/courses`)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </FormProvider>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar idioma</DialogTitle>
            <DialogDescription>Creá un idioma nuevo para cursos.</DialogDescription>
          </DialogHeader>
          <FormProvider {...languageForm}>
            <form className="grid gap-4" onSubmit={handleAddLanguage}>
              <FormField
                name="name"
                control={languageForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="español" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLanguageDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAddingLanguage}>
                  {isAddingLanguage ? "Agregando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={instructorDialogOpen} onOpenChange={setInstructorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar instructor</DialogTitle>
            <DialogDescription>Creá un instructor nuevo para cursos.</DialogDescription>
          </DialogHeader>
          <FormProvider {...instructorForm}>
            <form className="grid gap-4" onSubmit={handleAddInstructor}>
              <FormField
                name="name"
                control={instructorForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre Apellido" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInstructorDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAddingInstructor}>
                  {isAddingInstructor ? "Agregando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </AdminFormLayout>
  );
}
