# RevenueCat Integration — Estado actual

## Qué está hecho

- `.env.local` — 3 vars RC configuradas:
  - `REVENUECAT_SECRET_KEY=sk_tMgkvKmRYDiTQuZYKbXaMFHgfmLUi` ⚠️ ROTAR ESTA KEY
  - `NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY=rcb_sb_NLWINqNFIOdwRnjXMRrOrWwEP` (sandbox)
  - `REVENUECAT_WEBHOOK_SECRET=9b0e203db7d82fd467ea47b5681906a9e289054b35db617460fb8dc72e1efd26`
- Vercel Production — las 3 vars subidas
- Convex env — `REVENUECAT_WEBHOOK_SECRET` y `CLERK_SECRET_KEY` seteados
- `convex/subscriptions.ts` — `upsertSubscription` (internalMutation), `getMySubscription`, `listActiveSubscribers`
- `convex/subscriptionOfferings.ts` — CRUD completo
- `convex/schema.ts` — tablas `subscriptions`, `subscriptionOfferings`, `includedInPremium` en academyCourses
- `convex/coursePurchases.ts` — `hasPurchasedCourse` chequea premium sub
- `convex/http.ts` — webhook handler RC en `/api/webhooks/revenuecat` (httpAction)
- `src/lib/revenuecat.ts` — API client (actualmente no usado para checkout)
- `src/app/api/revenuecat/checkout/route.ts` — ruta server (actualmente no usada)
- `src/app/[locale]/(root)/(main)/pricing/page.tsx` — página de precios con SDK client-side
- `src/app/[locale]/account/subscription/page.tsx` — página de gestión de suscripción
- `@revenuecat/purchases-js` instalado

## Webhook URL (Convex HTTP action)
```
https://benevolent-marlin-136.convex.site/api/webhooks/revenuecat
```
Authorization header: `Bearer 9b0e203db7d82fd467ea47b5681906a9e289054b35db617460fb8dc72e1efd26`

## Offering en Convex (ya seeded)
```json
{
  "name": "Premium",
  "monthlyPriceUsd": 50,
  "annualPriceUsd": 500,
  "revenueCatProductIdMonthly": "premium_monthly",
  "revenueCatProductIdAnnual": "premium_annual",
  "revenueCatOfferingId": "premium",
  "isActive": true
}
```

## Estado en RevenueCat Dashboard

- **Stripe conectado**: Live mode (cuenta "The Mariscal")
- **App Web Billing**: "The Mariscal (Web Billing)" — existe
- **Productos creados**:
  - `premium_monthly` — USD 50/mes, EUR 50/mes — Sandbox ON
  - `premium_annual` — USD 100/año, EUR 100/año — Sandbox ON
- **Offering `premium`**: activo, tiene packages `rc_monthly` y `rc_annual`
- **Entitlements**: `premium_monthly` y `premium_annual` asignados

## Stripe Sandbox (Stripe Dashboard → Sandbox toggle ON)
- `premium_monthly` — Price ID: `price_1TKELkPgJPlj3fP7pSGjilGt`
- `premium_annual` — Price ID: `price_1TKEMBpgJPi3fP71PE5mYia`

## Problema actual

La página `/pricing` muestra: **"No hay planes disponibles en este momento."**

Causa probable: `rcOfferings.current` es `null` — el SDK no encuentra el offering `premium` como "current".

En RC Dashboard, el offering `premium` debe estar marcado como **Current Offering** para que `purchases.getOfferings().current` lo retorne.

## Próximos pasos con el MCP de RC

1. Instalar/reiniciar con `revenuecat-mcp` activo
2. Usar MCP para verificar:
   - Que el offering `premium` es el current offering
   - Que los packages `rc_monthly` y `rc_annual` tienen productos asignados
   - Que los productos tienen Stripe price IDs vinculados
3. Si `currentOffering` sigue null → cambiar código para usar `offerings.all["premium"]` en vez de `offerings.current`

## Fix probable sin MCP (probar primero)

En `src/app/[locale]/(root)/(main)/pricing/page.tsx`, línea:
```ts
const currentOffering = rcOfferings.current;
```
Cambiar a:
```ts
const currentOffering = rcOfferings.current ?? rcOfferings.all["premium"];
```

## Archivos clave
- `src/app/[locale]/(root)/(main)/pricing/page.tsx` — página pricing
- `src/app/[locale]/account/subscription/page.tsx` — gestión suscripción
- `convex/http.ts` — webhook handler (~línea 124)
- `convex/subscriptions.ts` — mutations
- `src/lib/revenuecat.ts` — API client server-side
