import { AlertCircleIcon } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export function AlertErrorCard({ title, message }: AlertCardProps) {
    return (
        <div className="grid w-full max-w-xl items-start gap-4">
            <Alert variant="destructive" >
                <AlertCircleIcon />
                <AlertTitle>{title}</AlertTitle>
                {message && (
                    <AlertDescription>
                        <p>{message}</p>
                    </AlertDescription>
                )}
            </Alert>
        </div>
    )
}
