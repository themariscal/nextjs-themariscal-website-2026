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
import { createAcademySchemas } from "@/lib/schemas/academy-schemas";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";
import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { z } from "zod";

export default function AdminAcademyNewCoursePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) ?? "en";

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [instructorDialogOpen, setInstructorDialogOpen] = useState(false);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isAddingInstructor, setIsAddingInstructor] = useState(false);

  const languages = useQuery(api.academyCourses.getLanguages, {});
  const instructors = useQuery(api.academyCourses.getInstructors, {});
  const createCourse = useMutation(api.academyCourses.createCourse);
  const addLanguage = useMutation(api.academyCourses.addLanguage);
  const addInstructor = useMutation(api.academyCourses.addInstructor);

  const { createCourseSchema, addLanguageSchema, addInstructorSchema } =
    createAcademySchemas();

  type CreateCourseType = z.infer<typeof createCourseSchema>;
  type AddLanguageType = z.infer<typeof addLanguageSchema>;
  type AddInstructorType = z.infer<typeof addInstructorSchema>;

  const form = useForm<CreateCourseType, unknown, CreateCourseType>({
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

  const handleCreateCourse = form.handleSubmit(async (values) => {
    try {
      setError(null);
      setIsSaving(true);

      const videoId = extractYouTubeVideoId(values.youtubeUrl);
      if (!videoId) {
        setError("No pudimos extraer el videoId desde la URL de YouTube.");
        return;
      }

      const courseId = await createCourse({
        name: values.name,
        youtubeUrl: values.youtubeUrl,
        youtubeVideoId: videoId,
        languageId: values.languageId as Id<"courseLanguages">,
        instructorId: values.instructorId as Id<"courseInstructors">,
        description: values.description,
        price: values.price,
        currency: values.currency,
      });

      // Create Stripe product if price > 0
      if (values.price && values.price > 0) {
        try {
          const res = await fetch("/api/stripe/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseId,
              name: values.name,
              price: values.price,
              currency: values.currency,
            }),
          });
          if (!res.ok) {
            const data = await res.json();
            toast.warn(`Curso creado, pero Stripe falló: ${data.error ?? "error desconocido"}`);
          } else {
            toast.success("Curso creado y producto en Stripe creado.");
          }
        } catch {
          toast.warn("Curso creado, pero no se pudo conectar con Stripe.");
        }
      } else {
        toast.success("Curso creado.");
      }

      router.push(`/${locale}/admin/academy/courses`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al crear el curso.");
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

  return (
    <AdminFormLayout
      title="Agregar curso"
      description="Completá los datos base del curso para guardarlo en Academy."
    >
      <FormProvider {...form}>
        <form className="grid gap-5" onSubmit={handleCreateCourse}>
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
                    onChange={(e) => field.onChange(e.target.value)}
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
              {isSaving ? "Guardando..." : "Guardar curso"}
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
