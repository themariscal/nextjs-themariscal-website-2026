---
title: "Auth Flow"
type: flow
updated: 2026-04-11
tags: [auth, clerk, login, oauth, session, require-auth]
---

# Auth Flow

Authentication in this project is handled entirely by **Clerk**. There is no custom session management — Clerk owns the token lifecycle, SSO callbacks, and user metadata. Two distinct sub-flows exist: the **login/registration UI flow** and the **route-level auth guard flow**.

Related architecture: [[architecture/frontend]] · [[architecture/convex]]

---

## Sub-flow 1: Login / Registration UI

**Trigger:** User opens the login dialog (e.g. via `LoginDialog`, or by clicking a `RequireAuth`-wrapped element while unauthenticated).

### Step-by-step

1. **`LoginDialog`** renders `LoginContent` inside a dialog shell.
   - File: `src/components/dialogs/auth/login-content.tsx`

2. **`LoginContent`** manages tab state (`login` | `register` | `otp` | `forgot` | `reset`) with `useState`. It renders the appropriate form for each tab.
   - Key child: `LoginWithSocials` (social OAuth buttons)
   - Key child: `LoginForm` (email/password)
   - Key child: `RegisterForm` → on success, switches tab to `otp`
   - Key child: `OTPForm` (email verification code)
   - Key child: `ForgotPasswordForm` → on success, switches to `reset`
   - Key child: `ResetPasswordForm`

3. **`LoginWithSocials`** (`src/components/dialogs/auth/login-with-socials.tsx`) handles OAuth redirect for three providers:
   - `handleLoginWithGoogle` → `signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/auth/sso-callback', ... })`
   - `handleLoginWithApple` → `signIn.authenticateWithRedirect({ strategy: 'oauth_apple', ... })`
   - `handleLoginWithTikTok` → `signIn.authenticateWithRedirect({ strategy: 'oauth_tiktok', ... })`
   - Reads `?redirect_url` from search params (or falls back to `window.location.pathname`) to return the user to the original page after login.

4. **SSO Callback** lands at `/auth/sso-callback` (handled by Clerk's built-in route). Clerk exchanges the OAuth code and sets the session.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `LoginContent` | `src/components/dialogs/auth/login-content.tsx` | Tab-switching auth shell |
| `LoginWithSocials` | `src/components/dialogs/auth/login-with-socials.tsx` | OAuth redirect buttons |
| `handleLoginWithGoogle` | same file | Google OAuth trigger |
| `handleLoginWithApple` | same file | Apple OAuth trigger |
| `handleLoginWithTikTok` | same file | TikTok OAuth trigger |

### Error handling

- If Clerk is not yet loaded (`!isLoaded`), social login buttons show a toast error and bail early.
- OAuth errors surface via `toast.error(error.message)`.
- The CAPTCHA element (`#clerk-captcha`) is injected at the top of `LoginContent` for bot protection.

---

## Sub-flow 2: Route-level Auth Guard (`RequireAuth`)

**Trigger:** Any component that wraps children with `<RequireAuth>` while the user is unauthenticated.

### Step-by-step

1. **`RequireAuth`** (`src/components/auth/require-auth.tsx`) calls `useUser()` from `@clerk/nextjs`.
2. While Clerk is loading (`!isLoaded`), children render as-is to avoid layout shift.
3. Once loaded:
   - **If signed in:** renders `children` normally.
   - **If not signed in, `mode="wrap"` (default):** wraps `children` in `<LoginDialog>` so any click on the child intercepts and opens the login dialog instead.
   - **If not signed in, `mode="button"`:** replaces children with a standalone "Iniciar sesión" button that opens the login dialog.

### Key functions

| Symbol | File | Role |
|--------|------|------|
| `RequireAuth` | `src/components/auth/require-auth.tsx` | Client-side auth gate |

---

## Sub-flow 3: Server-side Auth (API Routes)

**Trigger:** Any API route handler that calls `auth()` from `@clerk/nextjs/server`.

### Pattern

```ts
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Used in:
- `src/app/api/revenuecat/checkout/route.ts` — validates session before initiating RevenueCat checkout
- `src/app/api/revenuecat/sync/route.ts` — validates session before syncing subscription state

For Convex mutations from API routes, a Clerk JWT is obtained with `getToken({ template: "convex" })` and passed to `ConvexHttpClient.setAuth(token)` before calling mutations.

---

## Convex Auth Integration

The `ConvexClientProvider` (`src/lib/providers/convex-provider.tsx`) wraps the app with `ConvexProviderWithClerk`, linking Clerk's `useAuth` hook to the Convex client so that all `useQuery` / `useMutation` calls automatically carry the authenticated user's identity.

```ts
// src/lib/providers/convex-provider.tsx
<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
  {children}
</ConvexProviderWithClerk>
```
