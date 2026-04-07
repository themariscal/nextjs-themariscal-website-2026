interface CustomAlertDialogProps {
    title: string;
    message: string;
    buttonLabel?: string;
    onConfirm: () => void;
    children: ReactNode;
}

interface AlertCardProps {
    title: string;
    message?: string;
}