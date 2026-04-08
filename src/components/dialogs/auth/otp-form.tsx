"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { useSignUp } from '@clerk/nextjs';
import { createAuthSchemas } from "@/lib/schemas/auth-schemas";
import { OtpType } from "@/lib/types/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "react-toastify";
import { AlertErrorCard } from "@/components/alerts/alert-error-card";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export function OTPForm({
    setDialogIsOpen,
    isEmbedded = false,
}: {
    setDialogIsOpen: (isOpen: boolean) => void;
    isEmbedded?: boolean;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect_url');
    const t = useTranslations("auth");

    const { isLoaded, signUp, setActive } = useSignUp();
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer

    const { otpSchema } = createAuthSchemas(t);
    const form = useForm<OtpType>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            pin: "",
        },
    })

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    async function handleVerify(data: OtpType) {
        const code = data.pin;
        if (!isLoaded) return
        setLoading(true);
        try {
            // Use the code the user provided to attempt verification
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (completeSignUp.status === 'complete') {
                await setActive({
                    session: completeSignUp.createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            // Check for tasks and navigate to custom UI to help users resolve them
                            // See https://clerk.com/docs/custom-flows/overview#session-tasks
                            console.log(session?.currentTask)
                            return
                        }

                        toast.success(t("otp.success"));
                        if (redirectUrl || isEmbedded) {
                            router.push(redirectUrl || '/');
                        } else {
                            setDialogIsOpen(false);
                        }
                    },
                })
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                setError(t("errors.incompleteVerification"));
            }
        } catch (err: any) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const resendCode = async () => {
        if (!isLoaded) return
        setError(null);
        setIsResending(true);
        try {
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });
            setTimeLeft(60); // Reset timer to 60 seconds
            toast.success(t("errors.resendSuccess"));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-2">
                {error && <AlertErrorCard title={t("errors.errorTitle")} message={error} />}

                <FormField
                    control={form.control}
                    name="pin"
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
                                {t("otp.description")}
                                {signUp?.emailAddress && (
                                    <span className="block font-medium text-foreground mt-1">
                                        {signUp.emailAddress}
                                    </span>
                                )}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {timeLeft > 0 ? (
                    <p className="text-center text-sm mt-8">{t("otp.resendTimer")} {formatTime(timeLeft)}</p>
                ) : (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={resendCode}
                        disabled={isResending}
                        className="mt-8 w-full"
                    >
                        {isResending ? t("otp.resending") : t("otp.resend")}
                    </Button>
                )}

                <Button className="mt-1 w-full" type="submit" disabled={isLoading || !isLoaded}>
                    {isLoading ? t("otp.submitting") : t("otp.submit")}
                </Button>
            </form>
        </Form>
    );
}
