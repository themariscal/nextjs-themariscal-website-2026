"use client";

import { useUser } from "@clerk/nextjs";
import { LoginDialog } from "@/components/dialogs/auth/login-dialog";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
  children: React.ReactNode;
  /**
   * What to render when not authenticated.
   * Defaults to a "Iniciar sesión" button that opens the login dialog.
   * Pass `"wrap"` (default) to wrap `children` with the login dialog instead
   * (useful for buttons — same appearance, click opens login).
   */
  mode?: "button" | "wrap";
  buttonLabel?: string;
  buttonClassName?: string;
}

/**
 * Renders children when authenticated.
 * When not authenticated:
 *   - mode="wrap" (default): wraps children in LoginDialog so clicking them opens login.
 *   - mode="button": shows a standalone "Iniciar sesión" button that opens login.
 */
export function RequireAuth({
  children,
  mode = "wrap",
  buttonLabel = "Iniciar sesión",
  buttonClassName,
}: RequireAuthProps) {
  const { isSignedIn, isLoaded } = useUser();

  // While Clerk loads, render children as-is (avoid layout shift)
  if (!isLoaded || isSignedIn) {
    return <>{children}</>;
  }

  if (mode === "button") {
    return (
      <LoginDialog>
        <Button size="sm" variant="outline" className={buttonClassName}>
          {buttonLabel}
        </Button>
      </LoginDialog>
    );
  }

  // mode === "wrap": intercept any click by wrapping with LoginDialog
  return <LoginDialog>{children}</LoginDialog>;
}
