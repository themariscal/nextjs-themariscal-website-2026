// app/components/Price.tsx
"use client";

import { AnimateNumber } from "motion-plus/react";

type PriceProps = {
  price: number;
  className?: string;
};

export default function Price({ price, className = "" }: PriceProps) {
  return (
    <AnimateNumber
      format={{
        style: "currency",
        currency: "USD",
      }}
      locales="en-US"
      className={`text-5xl font-semibold text-white transition-all ${className}`}
      transition={{
        visualDuration: 0.6,
        type: "spring",
        bounce: 0.25,
        opacity: { duration: 0.3, ease: "linear" },
      }}
    >
      {price}
    </AnimateNumber>
  );
}
