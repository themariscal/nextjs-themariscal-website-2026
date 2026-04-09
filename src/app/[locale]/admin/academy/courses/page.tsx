"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "#convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminAcademyCoursesPage() {
  const courses = useQuery(api.academyCourses.listAllCourses);
  const setIncludedInPremium = useMutation(api.academyCourses.setIncludedInPremium);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academy — Cursos</h1>

      <div className="space-y-3">
        {courses?.map((course) => (
          <div
            key={course._id}
            className="flex items-center justify-between p-4 border rounded-lg bg-card"
          >
            <div className="space-y-1">
              <p className="font-medium">{course.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {(course.price ?? 0) === 0
                    ? "Gratuito"
                    : `$${(course.price ?? 0) / 100}`}
                </Badge>
                {course.includedInPremium && (
                  <Badge className="text-xs bg-amber-100 text-amber-700">
                    <Crown className="size-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor={`premium-${course._id}`} className="text-sm text-muted-foreground">
                Incluido en Premium
              </Label>
              <Switch
                id={`premium-${course._id}`}
                checked={course.includedInPremium ?? false}
                onCheckedChange={(checked) =>
                  void setIncludedInPremium({
                    courseId: course._id,
                    includedInPremium: checked,
                  })
                }
              />
            </div>
          </div>
        ))}
        {!courses?.length && (
          <p className="text-muted-foreground text-sm">Sin cursos creados aún.</p>
        )}
      </div>
    </div>
  );
}
