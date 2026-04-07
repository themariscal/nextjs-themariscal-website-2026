"use client";

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormDescription,
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

import { ResetPasswordType } from "@/lib/types/auth";
import { useState, useEffect } from "react";
import { createAuthSchemas } from "@/lib/schemas/auth-schemas";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function ResetPasswordForm({
    onReset,
}: {
    onReset: () => void;
}) {
    const t = useTranslations("auth");

    const [isLoading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordsInputs, setShowPasswordsInputs] = useState(false);
    const { signIn, isLoaded, setActive } = useSignIn();

    const { resetPasswordSchema } = createAuthSchemas(t);
    const form = useForm<ResetPasswordType>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            code: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Watch the code field to show/hide password inputs
    const codeValue = form.watch("code");

    useEffect(() => {
        if (codeValue && codeValue.length === 6) {
            setShowPasswordsInputs(true);
        } else {
            setShowPasswordsInputs(false);
        }
    }, [codeValue]);

    const handleSubmit = form.handleSubmit(async (values) => {
        if (!isLoaded) {
            toast.error(t("errors.authNotAvailable"));
            return;
        }

        try {
            setError(null);
            setLoading(true);
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: values.code,
                password: values.password,
            });

            // Check if 2FA is required
            if (result.status === 'needs_second_factor') {
                setError(t("errors.twoFactorRequired"));
            } else if (result.status === 'complete') {
                // Set the active session
                await setActive({
                    session: result.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            // Check for tasks and navigate to custom UI to help users resolve them
                            console.log(session?.currentTask);
                            return;
                        }
                    },
                });
                toast.success(t("resetPassword.success"));
                onReset();
            } else {
                setError(t("errors.incompleteReset"));
            }
        } catch (error: any) {
            if (error.errors) {
                const firstError = error.errors[0];
                setError(firstError.longMessage || firstError.message || t("errors.incompleteReset"));
            } else if (error instanceof Error) {
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
            <form className="grid gap-6 mt-2" onSubmit={handleSubmit}>
                {error && <AlertErrorCard title={t("errors.errorTitle")} message={error} />}
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <InputOTP maxLength={6} {...field} className="w-full">
                                    <InputOTPGroup className="w-full justify-between">
                                        <InputOTPSlot index={0} className="flex-1 h-12 text-lg font-semibold" />
                                        <InputOTPSlot index={1} className="flex-1 h-12 text-lg font-semibold" />
                                        <InputOTPSlot index={2} className="flex-1 h-12 text-lg font-semibold" />
                                        <InputOTPSlot index={3} className="flex-1 h-12 text-lg font-semibold" />
                                        <InputOTPSlot index={4} className="flex-1 h-12 text-lg font-semibold" />
                                        <InputOTPSlot index={5} className="flex-1 h-12 text-lg font-semibold" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormDescription className="text-center mt-2">
                                {!showPasswordsInputs && t("resetPassword.codeDescription")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {showPasswordsInputs && <div className="space-y-6">
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t("resetPassword.newPassword")}</FormLabel>
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
                                <FormLabel>{t("resetPassword.confirmPassword")}</FormLabel>
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
                    <Button className="mt-1 w-full" type="submit" disabled={isLoading || !isLoaded}>
                        {isLoading ? t("resetPassword.submitting") : t("resetPassword.submit")}
                    </Button>
                </div>}
            </form>

        </FormProvider>
    );
}
