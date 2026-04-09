"use client";

import { useQuery } from "convex/react";
import { api } from "#convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Crown, Check, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/elements/layouts/main-layout";

const FEATURES = [
  "Acceso a todos los cursos Premium",
  "Contenido exclusivo de The Mariscal",
  "Nuevos cursos cada mes",
  "Acceso anticipado a lanzamientos",
  "Soporte prioritario",
];

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const locale = params.locale as string;

  const isPremium =
    (user?.publicMetadata as { isPremium?: boolean })?.isPremium === true;
  const activeOffering = offerings?.find((o) => o.isActive);

  const savings = activeOffering
    ? activeOffering.monthlyPriceUsd * 12 - activeOffering.annualPriceUsd
    : 0;

  async function handleSubscribe(planType: "monthly" | "annual") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/revenuecat/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, locale }),
      });
      const data = (await res.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error ?? "Error al iniciar el pago. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium">
              <Crown className="size-4" />
              Premium
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Eleva tu nivel con Premium
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Accede a todos los cursos exclusivos, contenido de calidad y
            aprende directamente de The Mariscal.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md text-center">
            {error}
          </p>
        )}

        {/* Already premium */}
        {isPremium && (
          <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <Crown className="size-6 text-amber-500" />
            <div>
              <p className="font-semibold">Ya tienes Premium activo</p>
              <p className="text-sm text-muted-foreground">
                Gestiona tu suscripción en{" "}
                <a
                  href={`/${locale}/account/subscription`}
                  className="underline"
                >
                  tu cuenta
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Plans */}
        {!isPremium && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                  <Zap className="size-4" />
                  Mensual
                </CardTitle>
                <div className="mt-2">
                  {activeOffering ? (
                    <p className="text-4xl font-bold">
                      ${activeOffering.monthlyPriceUsd}
                      <span className="text-base font-normal text-muted-foreground">
                        /mes
                      </span>
                    </p>
                  ) : (
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isLoaded && !user ? (
                  <SignInButton mode="modal">
                    <Button className="w-full" variant="outline">
                      Iniciar sesión para suscribirse
                    </Button>
                  </SignInButton>
                ) : (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => void handleSubscribe("monthly")}
                    disabled={loading || !activeOffering}
                  >
                    <CreditCard className="size-4 mr-2" />
                    Suscribirse mensual
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Annual */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3">
                  Más popular
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                  <Crown className="size-4 text-amber-500" />
                  Anual
                  {savings > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-green-100 text-green-700 text-xs"
                    >
                      Ahorra ${savings}
                    </Badge>
                  )}
                </CardTitle>
                <div className="mt-2">
                  {activeOffering ? (
                    <>
                      <p className="text-4xl font-bold">
                        ${activeOffering.annualPriceUsd}
                        <span className="text-base font-normal text-muted-foreground">
                          /año
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ~${Math.round(activeOffering.annualPriceUsd / 12)}/mes
                      </p>
                    </>
                  ) : (
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isLoaded && !user ? (
                  <SignInButton mode="modal">
                    <Button className="w-full">
                      Iniciar sesión para suscribirse
                    </Button>
                  </SignInButton>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => void handleSubscribe("annual")}
                    disabled={loading || !activeOffering}
                  >
                    <Crown className="size-4 mr-2" />
                    Suscribirse anual
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fine print */}
        <p className="text-center text-xs text-muted-foreground">
          Puedes cancelar en cualquier momento desde tu cuenta. Sin permanencia.
        </p>
      </div>
    </MainLayout>
  );
}
