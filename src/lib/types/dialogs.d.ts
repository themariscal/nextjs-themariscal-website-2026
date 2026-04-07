interface ResponsiveDialogProps {
    title?: string;
    description?: string;
    content?: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    centerContent?: boolean;
  }
  