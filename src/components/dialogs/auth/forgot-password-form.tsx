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
import { useState } from "react";
import { useSignIn } from '@clerk/nextjs';
import { createAuthSchemas } from "@/lib/schemas/auth-schemas";
import { ForgotPasswordType } from "@/lib/types/auth";
import { toast } from "react-toastify";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const [isLoading, setLoading] = useState(false);
  const t = useTranslations("auth");

  const { signIn, isLoaded, setActive } = useSignIn();
  const [error, setError] = useState<string | null>(null);

  const { forgotPasswordSchema } = createAuthSchemas(t);
  const forgotForm = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });


  // Send the password reset code to the user's email
  const handleSendCode = forgotForm.handleSubmit(async (values) => {
    if (!isLoaded) {
      toast.error(t("errors.authNotAvailable"));
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: values.email,
      });

      onForgotPassword();
    } catch (error: any) {
      if (error.errors) {
        const firstError = error.errors[0];
        setError(firstError.longMessage || firstError.message || t("errors.sendCodeError"));
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t("errors.unknownError"));
      }
    } finally {
      setLoading(false);
    }
  });


  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="mt-4"><AlertErrorCard title={t("errors.errorTitle")} message={error} /></div>}

      <FormProvider {...forgotForm}>
        <form className="grid gap-6 mt-4" onSubmit={handleSendCode}>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("forgotPassword.description")}
            </p>
          </div>

          <FormField
            name="email"
            control={forgotForm.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("forgotPassword.email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder={t("forgotPassword.emailPlaceholder")}
                  />
                </FormControl>
                <FormMessage />

              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
            {isLoading ? t("forgotPassword.sending") : t("forgotPassword.submit")}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
