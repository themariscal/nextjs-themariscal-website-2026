"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useState } from "react";

function RadixCheckbox() {
  const [isChecked, setIsChecked] = useState(false);
  const pathLength = useMotionValue(isChecked ? 1 : 0);
  const strokeLinecap = useTransform(() =>
    pathLength.get() === 0 ? "none" : "round"
  );

  return (
    <div className="container">
      <Checkbox.Root className="root" asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onTap={() => setIsChecked(!isChecked)}
          data-primary-action
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#8df0cc" strokeWidth="3">
            <motion.path
              d="M4 12L10 18L20 6"
              animate={{ pathLength: isChecked ? 1 : 0 }}
              transition={{
                type: "spring",
                bounce: 0,
                duration: isChecked ? 0.3 : 0.1,
              }}
              style={{
                pathLength,
                strokeLinecap,
              }}
            />
          </svg>
        </motion.button>
      </Checkbox.Root>
      <StyleSheet />
    </div>
  );
}

/**
 * ==============   Styles   ================
 */
function StyleSheet() {
  return (
    <style>{`
            .container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 200px;
            }

            .root {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                background-color: #0b1011;
                border: 1px solid #1d2628;
                cursor: pointer;
                padding: 4px;
            }

            .root:focus-visible {
                outline: none;
                border-color: #8df0cc;
            }
        `}</style>
  );
}

export default RadixCheckbox;
