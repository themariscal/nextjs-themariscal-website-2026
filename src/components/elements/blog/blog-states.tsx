import React from 'react'

interface BlogLoadingProps {
    message?: string
}

export const BlogLoading = ({ message = "Cargando blog..." }: BlogLoadingProps) => {
    return (
        <div className="w-full flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">{message}</div>
        </div>
    )
}

interface BlogErrorProps {
    error: string
    title?: string
}

export const BlogError = ({ error, title = "Error" }: BlogErrorProps) => {
    return (
        <div className="w-full flex items-center justify-center py-12">
            <div className="text-red-500">{title}: {error}</div>
        </div>
    )
}

interface BlogNoDataProps {
    message?: string
}

export const BlogNoData = ({ message = "No se encontraron datos del blog" }: BlogNoDataProps) => {
    return (
        <div className="w-full flex items-center justify-center py-12">
            <div className="text-muted-foreground">{message}</div>
        </div>
    )
}
