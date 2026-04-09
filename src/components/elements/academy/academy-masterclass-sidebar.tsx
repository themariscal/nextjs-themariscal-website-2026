"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Infinity as InfinityIcon,
  PlayCircle,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CourseWithAccess } from "./course-card";

interface AcademyMasterclassSidebarProps {
  // undefined = loading, null = not found, CourseWithAccess = loaded
  masterclass: CourseWithAccess | null | undefined;
}

export function AcademyMasterclassSidebar({
  masterclass,
}: AcademyMasterclassSidebarProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  if (masterclass === undefined) {
    return <Skeleton className="h-[500px] w-full rounded-xl" />;
  }

  if (masterclass === null) return null;

  const courseUrl = masterclass.hasAccess
    ? `/${locale}/account/courses/${masterclass.slug}`
    : `/${locale}/academy/courses/${masterclass.slug}`;

  return (
    <Card className="overflow-hidden border-border/70 bg-background/95">
      {/* Thumbnail */}
      <Link
        href={courseUrl}
        className="group relative block aspect-video bg-muted overflow-hidden"
      >
        <Image
          src={`https://i.ytimg.com/vi/${masterclass.youtubeVideoId}/hqdefault.jpg`}
          alt={masterclass.name}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="320px"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background/80">
            <PlayCircle className="size-8" />
          </div>
        </div>
      </Link>

      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs border-destructive text-destructive">
            No incluido en Premium
          </Badge>
          <h3 className="font-bold text-base leading-tight">
            Claude Code Masterclass
          </h3>
          <p className="text-xs text-muted-foreground">
            Domina el desarrollo con IA desde cero hasta producción
          </p>
        </div>

        <div className="text-3xl font-extrabold">
          {masterclass.price ? `€${(masterclass.price / 100).toFixed(2)}` : "€199"}
        </div>

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <BookOpen className="size-3.5 shrink-0" /> 4 secciones completas
          </li>
          <li className="flex items-center gap-2">
            <Video className="size-3.5 shrink-0" /> 14 videos HD
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" /> +3 horas de contenido
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap className="size-3.5 shrink-0" /> Certificado incluido
          </li>
          <li className="flex items-center gap-2">
            <InfinityIcon className="size-3.5 shrink-0" /> Acceso de por vida
          </li>
        </ul>

        <Button asChild className="w-full">
          <Link href={courseUrl}>
            {masterclass.hasAccess ? "Ver curso" : "Comprar ahora"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
