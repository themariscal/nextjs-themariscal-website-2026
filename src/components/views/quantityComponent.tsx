"use client";

import { AnimateNumber } from "motion-plus/react";
import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";

export default function QuantityPriceCounter({
  unitPrice,
  min = 0,
  max = 10,
}: {
  unitPrice: number;
  min?: number;
  max?: number;
}) {
  const [quantity, setQuantity] = useState(1);

  const handleChange = (delta: number) => () => {
    setQuantity((prev) => Math.min(Math.max(prev + delta, min), max));
  };

  return (
    <LayoutGroup>
      <div className="flex flex-col items-center gap-6">
        {/* Total Price */}
        <AnimateNumber
          format={{ style: "currency", currency: "USD" }}
          locales="en-US"
          className="text-5xl font-bold text-white"
          transition={{
            visualDuration: 0.6,
            type: "spring",
            bounce: 0.25,
            opacity: { duration: 0.3, ease: "linear" },
          }}
        >
          {unitPrice * quantity}
        </AnimateNumber>

        {/* Quantity controls */}
        <motion.div
          layout
          className="flex items-center gap-6 rounded-full bg-[#0b1011] px-6 py-3 font-mono"
        >
          <motion.button
            disabled={quantity <= min}
            onPointerDown={handleChange(-1)}
            className="flex items-center justify-center rounded-full bg-[#0cdcf733] p-2 text-white disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            whileFocus={{
              boxShadow: "0px 0px 0px 2px #0cdcf7ff",
            }}
            layout
          >
            <AdditionIcon type="minus" />
          </motion.button>

          <AnimateNumber
            className="text-4xl font-semibold text-white tabular-nums"
            transition={{
              visualDuration: 0.4,
              type: "spring",
            }}
          >
            {quantity}
          </AnimateNumber>

          <motion.button
            disabled={quantity >= max}
            onPointerDown={handleChange(1)}
            className="flex items-center justify-center rounded-full bg-[#0cdcf733] p-2 text-white disabled:opacity-30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            whileFocus={{
              boxShadow: "0px 0px 0px 2px #0cdcf7ff",
            }}
            layout
          >
            <AdditionIcon type="plus" />
          </motion.button>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

const AdditionIcon = ({ type }: { type: "plus" | "minus" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    {type === "plus" && <path d="M12 5v14" />}
  </svg>
);
