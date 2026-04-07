"use client";

import { AnimateNumber } from "motion-plus/react";
import { motion } from "motion/react";
import { useState } from "react";

export default function PriceSwitcher({
  monthlyPrice = 19,
  yearlyPrice = 199,
}: {
  monthlyPrice?: number;
  yearlyPrice?: number;
}) {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="price-switcher">
      <AnimateNumber
        format={{
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }}
        locales="en-US"
        suffix={isYearly ? "/yr" : "/mo"}
        className="number"
        transition={{
          visualDuration: 0.6,
          type: "spring",
          bounce: 0.25,
          opacity: { duration: 0.2, ease: "linear" },
        }}
      >
        {isYearly ? yearlyPrice : monthlyPrice}
      </AnimateNumber>
      <div className="switch">
        <Button isSelected={!isYearly} onClick={() => setIsYearly(false)}>
          Monthly
        </Button>
        <Button isSelected={isYearly} onClick={() => setIsYearly(true)}>
          Yearly
        </Button>
      </div>
      <StyleSheet />
    </div>
  );
}

function Button({
  children,
  isSelected,
  onClick,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick}>
      <motion.span
        initial={false}
        animate={{
          color: isSelected ? "var(--background)" : "var(--text)",
          opacity: isSelected ? 1 : 0.5,
        }}
      >
        {children}
      </motion.span>
      {isSelected && (
        <motion.div
          layoutId="selected"
          className="selected"
          style={{ borderRadius: 25, zIndex: 1 }}
        />
      )}
    </button>
  );
}

/**
 * ==============   Styles   ================
 */
const StyleSheet = () => {
  return (
    <style>{`
        .price-switcher {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .number {
            font-size: 96px;
            letter-spacing: -0.04em;
            font-weight: 530;
            font-variation-settings: "opsz" 30, "wght" 530;
        }

        .number-section-post {
            font-size: 32px;
            opacity: 0.5;
            position: relative;
            bottom: 15px;
            align-self: flex-end;
            margin-left: 5px;
            letter-spacing: -0.02em;
        }

        .switch {
            display: flex;
            gap: 10px;
            padding: 6px;
            border-radius: 100px;
            background-color: rgba(255, 255, 255, 0.05);
        }

        .switch button {
            position: relative;
            padding: 8px 12px;
            display: flex;
        }

        .switch button span {
            z-index: 2;
            position: relative;
            color: var(--text);
            will-change: opacity;
            font-size: 13px;
            line-height: 1;
            font-variation-settings: "opsz" 20, "wght" 590;
        }

        .switch .selected {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #f5f5f5;
            will-change: transform;
        }
    `}</style>
  );
};
