import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFormLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  containerClassName?: string;
};

export function AdminFormLayout({
  title,
  description,
  children,
  containerClassName,
}: AdminFormLayoutProps) {
  return (
    <section className="w-full flex justify-center">
      <div className={cn("w-full max-w-2xl space-y-5", containerClassName)}>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

