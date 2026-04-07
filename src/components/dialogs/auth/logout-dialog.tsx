import { CustomAlertDialog } from '@/components/alerts/custom-alert-dialog'
import { useClerk } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import React, { ReactNode } from 'react'

interface LogoutDialogProps {
    children: ReactNode
}

export const LogoutDialog = ({ children }: LogoutDialogProps) => {
    const { signOut } = useClerk()
    const t = useTranslations("header.userAccount")

    return (
        <CustomAlertDialog
            title={t("logoutTitle")}
            message={t("logoutMessage")}
            buttonLabel={t("logoutButton")}
            onConfirm={signOut}
        >
            {children}
        </CustomAlertDialog>
    )
}