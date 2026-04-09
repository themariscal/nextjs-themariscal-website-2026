"use client";

import { useQuery } from "convex/react";
import { api } from "#convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Crown, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Purchases, ErrorCode, PurchasesError } from "@revenuecat/purchases-js";

export default function SubscriptionPage() {
  const { user } = useUser();
  const subscription = useQuery(api.subscriptions.getMySubscription);
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;

  useEffect(() => {
    if (searchParams.get("success") !== "true") return;
    setSyncing(true);
    fetch("/api/revenuecat/sync", { method: "POST" })
      .then(() => {
        window.location.href = `/${locale}/account/subscription`;
      })
      .catch((err) => {
        console.error("RC sync failed", err);
        setSyncing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPremium = (user?.publicMetadata as { isPremium?: boolean })?.isPremium === true;
  const activeOffering = offerings?.find((o) => o.isActive);
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()
    : null;

  async function handleSubscribe(planType: "monthly" | "annual") {
    if (!user?.id || !activeOffering) return;
    setLoading(true);
    setError(null);

    try {
      const publicKey = process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY!;
      const targetProductId =
        planType === "monthly"
          ? activeOffering.revenueCatProductIdMonthly
          : activeOffering.revenueCatProductIdAnnual;

      // Configure SDK with Clerk user ID so subscription links to the right account
      const purchases = Purchases.configure(publicKey, user.id);

      const rcOfferings = await purchases.getOfferings();
      const allPackages = Object.values(rcOfferings.all).flatMap((o) => o.availablePackages);
      const rcPackage = allPackages.find(
        (pkg) => pkg.webBillingProduct.identifier === targetProductId
      );

      if (!rcPackage) {
        setError("Producto no encontrado. Contacta soporte.");
        return;
      }

      const customerEmail = user.emailAddresses[0]?.emailAddress;

      await purchases.purchase({
        rcPackage,
        customerEmail,
        selectedLocale: locale,
        skipSuccessPage: true,
      });

      // Purchase succeeded — sync and redirect
      setSyncing(true);
      await fetch("/api/revenuecat/sync", { method: "POST" });
      window.location.href = `/${locale}/account/subscription`;

    } catch (err) {
      if (err instanceof PurchasesError && err.errorCode === ErrorCode.UserCancelledError) {
        // User closed the checkout — no error shown
        return;
      }
      console.error("Checkout error:", err);
      setError("Error al iniciar el pago. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (syncing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Crown className="size-8 text-amber-500 mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Activando tu suscripción...</p>
      </div>
    );
  }

  if (isPremium && subscription) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="size-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">Plan Premium activo</h1>
            <p className="text-muted-foreground">Tienes acceso a todos los cursos Premium</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de tu suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <Badge variant="secondary">
                {subscription.planType === "monthly" ? "Mensual" : "Anual"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge className="bg-green-100 text-green-700">Activo</Badge>
            </div>
            {renewalDate && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  Próxima renovación
                </span>
                <span className="text-sm font-medium">{renewalDate}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" asChild>
          <a
            href="https://billing.revenuecat.com/manage"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4 mr-2" />
            Gestionar suscripción
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Suscripción Premium</h1>
        <p className="text-muted-foreground mt-1">
          Accede a cursos exclusivos y contenido premium
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
      )}

      {activeOffering && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="size-5 text-amber-500" />
                Mensual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                ${activeOffering.monthlyPriceUsd}
                <span className="text-base font-normal text-muted-foreground">/mes</span>
              </p>
              <p className="text-sm text-muted-foreground">{activeOffering.description}</p>
              <Button
                className="w-full"
                onClick={() => void handleSubscribe("monthly")}
                disabled={loading}
              >
                <CreditCard className="size-4 mr-2" />
                Suscribirse mensual
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="size-5 text-amber-500" />
                Anual
                <Badge className="ml-auto bg-green-100 text-green-700 text-xs">
                  Ahorra ${activeOffering.monthlyPriceUsd * 12 - activeOffering.annualPriceUsd}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold">
                ${activeOffering.annualPriceUsd}
                <span className="text-base font-normal text-muted-foreground">/año</span>
              </p>
              <p className="text-sm text-muted-foreground">{activeOffering.description}</p>
              <Button
                className="w-full"
                onClick={() => void handleSubscribe("annual")}
                disabled={loading}
              >
                <CreditCard className="size-4 mr-2" />
                Suscribirse anual
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
