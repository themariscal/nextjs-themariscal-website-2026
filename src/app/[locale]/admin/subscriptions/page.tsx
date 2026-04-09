"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "#convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Crown } from "lucide-react";
import type { Id } from "#convex/_generated/dataModel";

type Offering = {
  _id: Id<"subscriptionOfferings">;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  revenueCatProductIdMonthly: string;
  revenueCatProductIdAnnual: string;
  revenueCatOfferingId: string;
  isActive: boolean;
};

export default function AdminSubscriptionsPage() {
  const offerings = useQuery(api.subscriptionOfferings.listOfferings);
  const activeSubscribers = useQuery(api.subscriptions.listActiveSubscribers);
  const updateOffering = useMutation(api.subscriptionOfferings.updateOffering);

  const [editingId, setEditingId] = useState<Id<"subscriptionOfferings"> | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    monthlyPriceUsd: "",
    annualPriceUsd: "",
    revenueCatProductIdMonthly: "",
    revenueCatProductIdAnnual: "",
    revenueCatOfferingId: "",
  });

  function startEdit(offering: Offering) {
    setEditingId(offering._id);
    setForm({
      name: offering.name,
      description: offering.description,
      monthlyPriceUsd: String(offering.monthlyPriceUsd),
      annualPriceUsd: String(offering.annualPriceUsd),
      revenueCatProductIdMonthly: offering.revenueCatProductIdMonthly,
      revenueCatProductIdAnnual: offering.revenueCatProductIdAnnual,
      revenueCatOfferingId: offering.revenueCatOfferingId,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateOffering({
      id: editingId,
      name: form.name,
      description: form.description,
      monthlyPriceUsd: Number(form.monthlyPriceUsd),
      annualPriceUsd: Number(form.annualPriceUsd),
      revenueCatProductIdMonthly: form.revenueCatProductIdMonthly,
      revenueCatProductIdAnnual: form.revenueCatProductIdAnnual,
      revenueCatOfferingId: form.revenueCatOfferingId,
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Crown className="size-6 text-amber-500" />
        <h1 className="text-2xl font-bold">Suscripciones</h1>
      </div>

      {/* Active subscribers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Suscriptores activos ({activeSubscribers?.length ?? "—"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeSubscribers?.slice(0, 20).map((sub) => (
              <div key={sub._id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <span className="font-mono text-muted-foreground text-xs">{sub.clerkUserId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{sub.planType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    hasta {new Date(sub.currentPeriodEnd * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {!activeSubscribers?.length && (
              <p className="text-sm text-muted-foreground">Sin suscriptores activos aún.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offerings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ofertas de suscripción</h2>
        {offerings?.map((offering) => (
          <Card key={offering._id}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {offering.name}
                <Badge variant={offering.isActive ? "default" : "secondary"}>
                  {offering.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://app.revenuecat.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3 mr-1" />
                    RevenueCat
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(offering as Offering)}
                >
                  Editar
                </Button>
              </div>
            </CardHeader>

            {editingId === offering._id ? (
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Precio mensual (USD)</Label>
                      <Input
                        type="number"
                        value={form.monthlyPriceUsd}
                        onChange={(e) => setForm({ ...form, monthlyPriceUsd: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Precio anual (USD)</Label>
                      <Input
                        type="number"
                        value={form.annualPriceUsd}
                        onChange={(e) => setForm({ ...form, annualPriceUsd: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>RC Product ID (mensual)</Label>
                    <Input
                      value={form.revenueCatProductIdMonthly}
                      onChange={(e) => setForm({ ...form, revenueCatProductIdMonthly: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>RC Product ID (anual)</Label>
                    <Input
                      value={form.revenueCatProductIdAnnual}
                      onChange={(e) => setForm({ ...form, revenueCatProductIdAnnual: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>RC Offering ID</Label>
                    <Input
                      value={form.revenueCatOfferingId}
                      onChange={(e) => setForm({ ...form, revenueCatOfferingId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => void saveEdit()}>Guardar</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Para cambiar precios reales, hazlo en{" "}
                  <a href="https://app.revenuecat.com" target="_blank" rel="noopener noreferrer" className="underline">RevenueCat</a>
                  {" "}y{" "}
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">Stripe</a>.
                  Actualiza los IDs aquí si los cambias allá.
                </p>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{offering.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mensual: </span>
                    <span className="font-medium">${offering.monthlyPriceUsd}/mes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Anual: </span>
                    <span className="font-medium">${offering.annualPriceUsd}/año</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RC ID mensual: </span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{offering.revenueCatProductIdMonthly}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RC ID anual: </span>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{offering.revenueCatProductIdAnnual}</code>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
