// components/LocaleLink.tsx
"use client";

import { useLocale } from "next-intl";
import Link, { LinkProps } from "next/link";
import { useMemo } from "react";

// Permitimos todos los props de Link + children
type Props = React.PropsWithChildren<LinkProps>;

export default function LocaleLink({ href, ...props }: Props) {
  const locale = useLocale();

  const localizedHref = useMemo(() => {
    if (typeof href === "string") {
      const path = href.startsWith("/") ? href.slice(1) : href;
      return `/${locale}/${path}`;
    }

    // En caso de usar href como objeto (pathname + query)
    return {
      ...href,
      pathname: `/${locale}${href.pathname}`,
    };
  }, [href, locale]);

  return <Link {...props} href={localizedHref} />;
}
