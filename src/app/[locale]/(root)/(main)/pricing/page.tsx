"use client";

import { useQuery } from "convex/react";
import { api } from "#convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Crown, Check, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/elements/layouts/main-layout";
import { Purchases, ReservedCustomerAttribute, type PurchasesError, ErrorCode } from "@revenuecat/purchases-js";

const FEATURES = [
  "Acceso a todos los cursos Premium",
  "Contenido exclusivo de The Mariscal",
  "Nuevos cursos cada mes",
  "Acceso anticipado a lanzamientos",
  "Soporte prioritario",
];

const RC_PUBLIC_KEY = process.env.NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY!;

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const locale = params.locale as string;

  const isPremium =
    (user?.publicMetadata as { isPremium?: boolean })?.isPremium === true;
  const activeOffering = offerings?.find((o) => o.isActive);
  const offeringsLoaded = offerings !== undefined;

  const savings = activeOffering
    ? activeOffering.monthlyPriceUsd * 12 - activeOffering.annualPriceUsd
    : 0;

  async function handleSubscribe(planType: "monthly" | "annual") {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Configure RC SDK with Clerk user ID
      if (!Purchases.isConfigured()) {
        Purchases.configure({ apiKey: RC_PUBLIC_KEY, appUserId: user.id });
      }
      const purchases = Purchases.getSharedInstance();

      // Set user attributes so RC dashboard shows them and checkout form is pre-filled
      const email = user.emailAddresses[0]?.emailAddress;
      const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || undefined;
      const phone = user.phoneNumbers[0]?.phoneNumber;
      const attrs: Record<string, string | null> = {};
      if (email) attrs[ReservedCustomerAttribute.Email] = email;
      if (displayName) attrs[ReservedCustomerAttribute.DisplayName] = displayName;
      if (phone) attrs[ReservedCustomerAttribute.PhoneNumber] = phone;
      if (user.username) attrs["username"] = user.username;
      if (Object.keys(attrs).length > 0) {
        await purchases.setAttributes(attrs);
      }

      // Fetch offerings from RC
      const rcOfferings = await purchases.getOfferings();
      const currentOffering = rcOfferings.current ?? rcOfferings.all["premium"];

      if (!currentOffering) {
        setError("No hay planes disponibles en este momento.");
        return;
      }

      // Find the matching package
      const pkg = currentOffering.availablePackages.find((p) => {
        const id = p.identifier.toLowerCase();
        if (planType === "monthly") return id.includes("monthly") || id.includes("month") || id === "$rc_monthly";
        return id.includes("annual") || id.includes("annual") || id === "$rc_annual";
      }) ?? currentOffering.availablePackages[planType === "monthly" ? 0 : 1];

      if (!pkg) {
        setError("Plan no encontrado. Intenta de nuevo.");
        return;
      }

      // Trigger RC Web Billing checkout (shows embedded UI)
      await purchases.purchase({ rcPackage: pkg, customerEmail: email });

      // Purchase successful — redirect via public callback page (avoids Clerk middleware race)
      router.push(`/${locale}/subscription/callback?success=true`);
    } catch (err) {
      const rcErr = err as PurchasesError;
      if (rcErr.errorCode === ErrorCode.UserCancelledError) {
        // User closed checkout — no error shown
        return;
      }
      console.error("[pricing] purchase error:", err);
      setError(
        rcErr.message ?? "Error al procesar el pago. Intenta de nuevo."
      );
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
            Accede a todos los cursos exclusivos, contenido de calidad y aprende
            directamente de The Mariscal.
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
                <a href={`/${locale}/account/subscription`} className="underline">
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
                  ) : offeringsLoaded ? (
                    <p className="text-4xl font-bold text-muted-foreground">—</p>
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
                    {loading ? "Cargando..." : "Suscribirse mensual"}
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
                  ) : offeringsLoaded ? (
                    <p className="text-4xl font-bold text-muted-foreground">—</p>
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
                    {loading ? "Cargando..." : "Suscribirse anual"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Puedes cancelar en cualquier momento desde tu cuenta. Sin permanencia.
        </p>
      </div>
    </MainLayout>
  );
}
