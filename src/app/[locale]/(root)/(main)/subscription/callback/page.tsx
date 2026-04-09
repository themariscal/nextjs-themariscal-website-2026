"use client";

import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useParams, useSearchParams } from "next/navigation";
import { Crown, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/elements/layouts/main-layout";

export default function SubscriptionCallbackPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const isSuccess = searchParams.get("success") === "true";

  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user || !isSuccess || syncing || done) return;
    setSyncing(true);
    fetch("/api/revenuecat/sync", { method: "POST" })
      .then(() => {
        setDone(true);
        window.location.href = `/${locale}/account/subscription`;
      })
      .catch(() => {
        setDone(true);
        window.location.href = `/${locale}/account/subscription`;
      });
  }, [isLoaded, user, isSuccess, locale, syncing, done]);

  if (!isLoaded || syncing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Crown className="size-10 text-amber-500 animate-pulse" />
          <p className="text-muted-foreground">Activando tu suscripción...</p>
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
          <CheckCircle className="size-12 text-green-500" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">¡Pago exitoso!</h1>
            <p className="text-muted-foreground max-w-sm">
              Tu pago fue procesado. Inicia sesión para activar tu suscripción Premium.
            </p>
          </div>
          <SignInButton
            mode="modal"
            forceRedirectUrl={`/${locale}/subscription/callback?success=true`}
          >
            <Button size="lg">
              <Crown className="size-4 mr-2" />
              Iniciar sesión para activar
            </Button>
          </SignInButton>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Crown className="size-10 text-amber-500 animate-pulse" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </MainLayout>
  );
}
