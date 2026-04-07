"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { LoginType } from "@/lib/types/auth";
import { createAuthSchemas } from "@/lib/schemas/auth-schemas";
import { toast } from "react-toastify";
import { useSignIn } from "@clerk/nextjs";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function LoginForm({
  onForgotPassword,
  setDialogIsOpen,
  isEmbedded = false,
}: {
  onForgotPassword?: (() => void) | null;
  setDialogIsOpen: (isOpen: boolean) => void;
  isEmbedded?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url');
  const t = useTranslations("auth");

  const { isLoaded, signIn, setActive } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { loginSchema } = createAuthSchemas(t);
  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!isLoaded) {
      toast.error(t("errors.authNotAvailable"));
      return;
    }

    try {
      setError(null);

      setLoading(true);
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        toast.success(t("login.welcome"));

        if (redirectUrl || isEmbedded) {
          router.push(redirectUrl || '/');
        } else {
          setDialogIsOpen(false);
        }

      } else {
        setError(t("errors.incompleteLogin"));
        throw new Error(t("errors.incompleteLogin"));
      }

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("errors.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <FormProvider {...form}>
      <form className="grid gap-6" onSubmit={handleSubmit}>
        {error && <AlertErrorCard title={t("errors.errorTitle")} message={error} />}
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("login.email")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>{t("login.password")}</FormLabel>
                {onForgotPassword && (
                  <a
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-muted-foreground cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      onForgotPassword();
                    }}
                  >
                    {t("login.forgotPassword")}
                  </a>
                )}
              </div>
              <FormControl>
                <div className="relative">
                  <Input {...field} type={showPassword ? "text" : "password"} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-1" type="submit" disabled={isLoading || !isLoaded}>
          {isLoading ? t("login.submitting") : t("login.submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
