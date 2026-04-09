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
 * Sets subscriber attributes in RevenueCat (email, display name, username).
 * RC uses $email and $displayName as reserved keys shown in the dashboard.
 * `username` is a custom attribute — visible in subscriber detail view.
 * Docs: https://www.revenuecat.com/docs/subscribers/customer-info#subscriber-attributes
 */
export async function setSubscriberAttributes(
  appUserId: string,
  attributes: { email?: string; displayName?: string; username?: string }
): Promise<void> {
  const rcAttributes: Record<string, { value: string }> = {};
  if (attributes.email) rcAttributes["$email"] = { value: attributes.email };
  if (attributes.displayName) rcAttributes["$displayName"] = { value: attributes.displayName };
  if (attributes.username) rcAttributes["username"] = { value: attributes.username };

  if (Object.keys(rcAttributes).length === 0) return;

  await fetch(`${RC_BASE_URL}/subscribers/${encodeURIComponent(appUserId)}/attributes`, {
    method: "POST",
    headers: rcHeaders(),
    body: JSON.stringify({ attributes: rcAttributes }),
  });
  // Fire-and-forget: don't fail checkout if attributes fail
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
  customerEmail,
}: {
  appUserId: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
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
  let checkoutUrl = data.checkout_url;

  if (customerEmail) {
    const url = new URL(checkoutUrl);
    url.searchParams.set("email", customerEmail);
    checkoutUrl = url.toString();
  }

  return checkoutUrl;
}
