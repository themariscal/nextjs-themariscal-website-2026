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

  const form = useForm<CourseFormType, unknown, CourseFormType>({
    resolver: zodResolver(createCourseSchema) as never,
    defaultValues: {
      name: "",
      youtubeUrl: "",
      languageId: "",
      instructorId: "",
      description: "",
      price: undefined,
      currency: "eur",
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

    const languageId = String(course.languageId ?? "");
    const instructorId = String(course.instructorId ?? "");

    form.reset({
      name: course.name,
      youtubeUrl: course.youtubeUrl,
      languageId,
      instructorId,
      description: course.description,
      price: course.price,
      currency: course.currency ?? "eur",
    });

    // Force-select values after reset so shadcn Select reflects persisted ids.
    form.setValue("languageId", languageId, { shouldValidate: false });
    form.setValue("instructorId", instructorId, { shouldValidate: false });
  }, [course, form]);

  const languageOptions = languages ?? [];
  const instructorOptions = instructors ?? [];
  const hasCurrentLanguage = !!course && languageOptions.some((item) => item._id === course.languageId);
  const hasCurrentInstructor = !!course && instructorOptions.some((item) => item._id === course.instructorId);

  const handleUpdateCourse = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);

      if (!course) return;

      const languageIdValue = values.languageId || String(course.languageId ?? "");
      const instructorIdValue = values.instructorId || String(course.instructorId ?? "");

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
        languageId: languageIdValue as Id<"courseLanguages">,
        instructorId: instructorIdValue as Id<"courseInstructors">,
        description: values.description,
        price: values.price,
        currency: values.currency,
      });

      // Stripe price change logic
      const priceChanged = values.price !== course.price;
      const newPrice = values.price ?? 0;

      if (priceChanged && newPrice > 0) {
        try {
          let stripeRes: Response;
          if (course.stripeProductId) {
            // Update existing Stripe product: archive old price, create new
            stripeRes = await fetch("/api/stripe/products", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                courseId,
                stripeProductId: course.stripeProductId,
                newPrice,
                currency: values.currency,
              }),
            });
          } else {
            // First time adding a price: create Stripe product
            stripeRes = await fetch("/api/stripe/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                courseId,
                name: values.name,
                price: newPrice,
                currency: values.currency,
              }),
            });
          }
          if (!stripeRes.ok) {
            const data = await stripeRes.json();
            toast.warn(`Cambios guardados, pero Stripe falló: ${data.error ?? "error desconocido"}`);
          } else {
            toast.success("Curso actualizado y precio en Stripe actualizado.");
          }
        } catch {
          toast.warn("Cambios guardados, pero no se pudo conectar con Stripe.");
        }
      } else {
        toast.success("Curso actualizado.");
      }

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
                  {(() => {
                    const fallbackValue = course ? String(course.languageId) : "";
                    const currentValue = field.value || fallbackValue;

                    return (
                  <Select
                    value={currentValue || undefined}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un idioma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!hasCurrentLanguage && course ? (
                        <SelectItem value={String(course.languageId)}>
                          {course.languageName
                            ? `${course.languageName} (guardado)`
                            : "Idioma guardado"}
                        </SelectItem>
                      ) : null}
                      {languageOptions.map((language) => (
                        <SelectItem key={language._id} value={language._id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    );
                  })()}
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
                  {(() => {
                    const fallbackValue = course ? String(course.instructorId) : "";
                    const currentValue = field.value || fallbackValue;

                    return (
                  <Select
                    value={currentValue || undefined}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un instructor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!hasCurrentInstructor && course ? (
                        <SelectItem value={String(course.instructorId)}>
                          {course.instructorName
                            ? `${course.instructorName} (guardado)`
                            : "Instructor guardado"}
                        </SelectItem>
                      ) : null}
                      {instructorOptions.map((instructor) => (
                        <SelectItem key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    );
                  })()}
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

          <FormField
            name="price"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (en centavos, 0 = gratis)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="4900"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="currency"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="eur">EUR — Euro</SelectItem>
                    <SelectItem value="usd">USD — Dólar</SelectItem>
                    <SelectItem value="gbp">GBP — Libra</SelectItem>
                  </SelectContent>
                </Select>
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
