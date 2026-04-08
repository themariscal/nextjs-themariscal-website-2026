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

import { RegisterType } from "@/lib/types/auth";
import { useState } from "react";
import { createAuthSchemas } from "@/lib/schemas/auth-schemas";
import { useSignUp } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";

export function RegisterForm({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const { isLoaded, signUp } = useSignUp();
  const t = useTranslations("auth");

  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerSchema } = createAuthSchemas(t);
  const form = useForm<RegisterType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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

      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        username: values.username,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      onRegister();
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
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.username")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.email")}</FormLabel>
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
              <FormLabel>{t("register.password")}</FormLabel>
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
        <FormField
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("register.confirmPassword")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
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
          {isLoading ? t("register.submitting") : t("register.submit")}
        </Button>
      </form>

    </FormProvider>
  );
}
