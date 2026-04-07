"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import LoginWithSocials from "./login-with-socials";
import { ForgotPasswordForm } from "./forgot-password-form";
import Image from "next/image";
import { OTPForm } from "./otp-form";
import { ResetPasswordForm } from "./reset-password-form";
import { useState } from "react";
import { useTranslations } from "next-intl";

import React from 'react'

const PrivacyPolicy = () => {
    const t = useTranslations("auth");

    return (
        <p className="text-sm text-center text-muted-foreground mt-6">
            {t("login.terms")}{" "}
            <a className="text-primary cursor-pointer hover:underline">
                {t("login.userAgreement")}
            </a>{" "}
            {t("login.and")}{" "}
            <a className="text-primary cursor-pointer hover:underline">
                {t("login.privacyPolicy")}
            </a>
            .
        </p>
    )
}


export const LoginContent = ({
    setDialogIsOpen = () => { },
    isEmbedded = false,
}: {
    setDialogIsOpen?: (isOpen: boolean) => void;
    isEmbedded?: boolean;
}) => {
    const [activeTab, setActiveTab] = useState("login");
    const t = useTranslations("auth");

    return (
        <div className="w-full">
            <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" data-cl-language="es-ES" />
            <Image
                src="/android-chrome-512x512.png"
                className="mx-auto block"
                alt="The Mariscal"
                height={140}
                width={140}
            />
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="login">
                    <p className="text-center text-xl font-semibold mb-4 mt-2">{t("login.title")}</p>
                    <LoginWithSocials setDialogIsOpen={setDialogIsOpen} />
                    <LoginForm
                        setDialogIsOpen={setDialogIsOpen}
                        onForgotPassword={() => setActiveTab("forgot")}
                        isEmbedded={isEmbedded}
                    />

                    <PrivacyPolicy />

                    <p className="text-sm text-center mt-10">
                        {t("login.newUser")}{" "}
                        <a
                            className="text-primary cursor-pointer hover:underline"
                            onClick={() => setActiveTab("register")}
                        >
                            {t("login.createAccount")}
                        </a>
                    </p>
                </TabsContent>
                <TabsContent value="register">
                    <p className="text-center text-xl font-semibold mb-4 mt-2">{t("register.title")}</p>

                    <LoginWithSocials setDialogIsOpen={setDialogIsOpen} />
                    <RegisterForm onRegister={() => setActiveTab("otp")} />
                    <PrivacyPolicy />

                    <p className="text-sm text-center mt-10">
                        {t("register.existingUser")}{" "}
                        <a
                            className="text-primary cursor-pointer hover:underline"
                            onClick={() => setActiveTab("login")}
                        >
                            {t("register.login")}
                        </a>
                    </p>
                </TabsContent>
                <TabsContent value="otp">
                    <p className="text-center text-xl font-semibold mb-4 mt-2">{t("otp.title")}</p>

                    <OTPForm setDialogIsOpen={setDialogIsOpen} isEmbedded={isEmbedded} />
                </TabsContent>
                <TabsContent value="forgot">
                    <ForgotPasswordForm onForgotPassword={() => setActiveTab("reset")} />
                    <p className="text-sm text-center mt-10">
                        <a
                            className="cursor-pointer hover:underline"
                            onClick={() => setActiveTab("login")}
                        >
                            {t("forgotPassword.backToLogin")}
                        </a>
                    </p>
                </TabsContent>
                <TabsContent value="reset">
                    <p className="text-center text-xl font-semibold mb-4 mt-4">{t("resetPassword.title")}</p>
                    <ResetPasswordForm onReset={() => setActiveTab("login")} />
                    <p className="text-sm text-center mt-10">
                        <a
                            className="cursor-pointer hover:underline"
                            onClick={() => setActiveTab("forgot")}
                        >
                            {t("resetPassword.changeEmail")}
                        </a>
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    );
};
