const RC_BASE_URL = "https://api.revenuecat.com/v1";

export interface RCSubscriber {
  entitlements: Record<
    string,
    { expires_date: string | null; product_identifier: string; is_sandbox: boolean }
  >;
  subscriptions: Record<
    string,
    {
      expires_date: string | null;
      period_type: string;
      unsubscribe_detected_at: string | null;
      billing_issues_detected_at: string | null;
    }
  >;
  original_app_user_id: string;
}

/**
 * Fetches current subscriber state directly from RevenueCat REST API.
 * Use this when webhooks aren't available (e.g. local dev, pre-deploy).
 */
export async function getSubscriber(appUserId: string): Promise<RCSubscriber> {
  const res = await fetch(`${RC_BASE_URL}/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: rcHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RC getSubscriber failed ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { subscriber: RCSubscriber };
  return data.subscriber;
}

function rcHeaders() {
  const key = process.env.REVENUECAT_SECRET_KEY;
  if (!key) throw new Error("Missing REVENUECAT_SECRET_KEY");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

/**
 * Creates a RevenueCat Web Billing checkout session.
 * Returns the hosted checkout URL to redirect the user to.
 *
 * Docs: https://www.revenuecat.com/docs/web/web-billing/integration-guide
 *
 * The appUserId MUST be the Clerk user ID so the RC webhook can
 * map back to the correct Clerk user via app_user_id.
 */
export async function createWebBillingCheckout({
  appUserId,
  productId,
  successUrl,
  cancelUrl,
}: {
  appUserId: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const res = await fetch(`${RC_BASE_URL}/web_billing/checkouts`, {
    method: "POST",
    headers: rcHeaders(),
    body: JSON.stringify({
      app_user_id: appUserId,
      product_id: productId,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RC checkout creation failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { checkout_url: string };
  return data.checkout_url;
}
