"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export type CourseWithAccess = {
  _id: string;
  name: string;
  youtubeVideoId: string;
  price?: number;
  currency?: string;
  includedInPremium?: boolean;
  instructorName: string | null;
  slug: string;
  hasAccess: boolean;
};

const RATINGS = [4.7, 4.8, 4.9] as const;

function ratingIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % RATINGS.length;
}

function formatPrice(price?: number): string {
  if (!price || price === 0) return "Gratis";
  return `€${(price / 100).toFixed(2)}`;
}

export function CourseCard({ course }: { course: CourseWithAccess }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const isStarCourse = course.slug === "claude-code-masterclass";
  const rating = RATINGS[ratingIndex(course._id)];
  const priceDisplay = formatPrice(course.price);

  const badgeLabel = isStarCourse
    ? "Curso Estrella"
    : !course.price || course.price === 0
    ? "Gratis"
    : course.includedInPremium
    ? "Incluido en Premium"
    : "Bestseller";

  const ctaHref = course.hasAccess
    ? `/${locale}/account/courses/${course.slug}`
    : `/${locale}/academy/courses/${course.slug}`;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200",
        isStarCourse && "ring-2 ring-primary"
      )}
    >
      {/* Thumbnail */}
      <Link href={ctaHref} className="relative block aspect-video bg-muted overflow-hidden">
        <Image
          src={`https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`}
          alt={course.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <Badge
          variant={isStarCourse ? "default" : course.includedInPremium ? "secondary" : "outline"}
          className="w-fit text-xs"
        >
          {isStarCourse ? <span aria-hidden="true">⭐ </span> : ""}{badgeLabel}
        </Badge>

        <Link href={ctaHref} className="hover:underline">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{course.name}</h3>
        </Link>

        {course.instructorName && (
          <p className="text-xs text-muted-foreground">{course.instructorName}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold text-amber-500">{rating}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className={cn(
              "text-sm font-bold",
              (!course.price || course.price === 0) && "text-primary"
            )}
          >
            {priceDisplay}
          </span>
          <Button
            asChild
            size="sm"
            variant={course.hasAccess ? "default" : "outline"}
            className="text-xs h-7 px-3"
          >
            <Link href={ctaHref}>
              {course.hasAccess ? "Ver curso" : "Ver detalles"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
