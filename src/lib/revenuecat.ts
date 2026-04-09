const RC_BASE_URL = "https://api.revenuecat.com/v1";

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
