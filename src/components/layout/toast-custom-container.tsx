"use client"
import { useTheme } from 'next-themes'
import React from 'react'
import { ToastContainer, Bounce } from 'react-toastify'

export const ToastCustomContainer = () => {
    const { resolvedTheme } = useTheme();

    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={resolvedTheme}
            transition={Bounce}
        />
    )
}

