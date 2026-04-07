'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'
import React, { ReactNode } from 'react'
import { deDE, enUS, esES, frFR, hrHR, itIT, nlNL, ptPT } from "@clerk/localizations";

export const ClerkProviderTheme = ({ children, locale }: { children: ReactNode, locale: string }) => {
    const { resolvedTheme } = useTheme()

    const clerkLocales = {
        en: enUS,
        es: esES,
        fr: frFR,
        de: deDE,
        it: itIT,
        pt: ptPT,
        nl: nlNL,
        hr: hrHR,
    };

    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            localization={clerkLocales[locale as keyof typeof clerkLocales]}
            appearance={{
                baseTheme: resolvedTheme === 'dark' ? dark : undefined,
                variables: {
                    colorPrimary: '#000000',
                },
                elements: {
                    formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
                    card: 'shadow-lg',
                },
            }}
        >
            {children}
        </ClerkProvider>
    )
}

