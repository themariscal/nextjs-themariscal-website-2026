interface CardProps {
  id: string;
  title: string;
  category: string;
  open: VoidFunction;
  top?: number;
  bottom?: number;
  width?: string;
  left?: number;
  theme?: "dark" | "light";
}

interface Item {
  id: string;
  category: string;
  title: string;
  content: React.ReactNode;
  top?: number;
  bottom?: number;
  width?: string;
  left?: number;
  theme?: "dark" | "light";
}
