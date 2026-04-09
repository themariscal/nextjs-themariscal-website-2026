"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type SessionData = {
  status: "complete" | "open" | "expired";
  courseSlug: string;
  locale: string;
  courseId: string;
  customerEmail: string;
};

function SuccessContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const locale = (params.locale as string) ?? "es";
  const courseSlug = params.courseSlug as string;
  const sessionId = searchParams.get("session_id");

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace(`/${locale}/academy/courses/${courseSlug}`);
      return;
    }

    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data: SessionData) => {
        if (data.status !== "complete") {
          router.replace(`/${locale}/academy/courses/${courseSlug}`);
          return;
        }
        setSessionData(data);
      })
      .catch(() => {
        router.replace(`/${locale}/academy/courses/${courseSlug}`);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [sessionId, locale, courseSlug, router]);

  if (isVerifying || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionData) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="size-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Felicitaciones!</CardTitle>
          <p className="text-muted-foreground">
            Adquiriste acceso al curso exitosamente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Tu compra está confirmada. Ya podés acceder al contenido.
              </p>
              <Button
                className="w-full cursor-pointer"
                onClick={() => router.replace(`/${locale}/academy/courses/${courseSlug}`)}
              >
                Comenzar a ver
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                Creá una cuenta con el email{" "}
                <strong>{sessionData.customerEmail}</strong> para acceder a tu
                curso en cualquier momento.
              </p>
              <Button
                className="w-full cursor-pointer"
                onClick={() => router.push(`/${locale}/sign-up`)}
              >
                Crear cuenta
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => router.push(`/${locale}/academy/courses/${courseSlug}`)}
              >
                Ver curso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
