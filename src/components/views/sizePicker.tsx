"use client";

import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { useState } from "react";

function ToggleItem({
  children,
  value,
  currentValue,
  ...rest
}: {
  currentValue: string | string[];
  value: string;
  children: React.ReactNode;
  "aria-label": string;
}) {
  const isMultiple = Array.isArray(currentValue);
  const isSelected = isMultiple
    ? currentValue.includes(value)
    : currentValue === value;

  return (
    <ToggleGroup.Item value={value} asChild>
      <motion.button
        initial={{ scale: 1, backgroundColor: "#2b323d00" }}
        animate={
          isSelected && isMultiple ? { backgroundColor: "#2b323dff" } : {}
        }
        whileTap={{ scale: 0.9 }}
        whileFocus={{ boxShadow: "0 0 0 2px #ff0088" }}
        className="toggle-item"
        {...rest}
      >
        <span>{children}</span>
        <AnimatePresence initial={false}>
          {isSelected && !isMultiple && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="selected-indicator"
              layoutId="selected-indicator"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </ToggleGroup.Item>
  );
}

export default function RadixToggleGroup() {
  const [alignment, setAlignment] = useState("left");

  return (
    <ToggleGroup.Root
      type="single"
      value={alignment}
      onValueChange={setAlignment}
      aria-label="Text alignment"
      className="container"
    >
      <ToggleItem
        currentValue={alignment}
        value="left"
        aria-label="Left aligned"
      >
        <TextAlignLeftIcon />
      </ToggleItem>
      <ToggleItem
        currentValue={alignment}
        value="center"
        aria-label="Center aligned"
      >
        <TextAlignCenterIcon />
      </ToggleItem>
      <ToggleItem
        currentValue={alignment}
        value="right"
        aria-label="Right aligned"
      >
        <TextAlignRightIcon />
      </ToggleItem>
      <StyleSheet />
    </ToggleGroup.Root>
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
            padding: 10px;
            min-width: max-content;
            border-radius: 6px;
            background-color: #0b1011;
            border-radius: 10px;
            gap: 5px;
        }

        .container svg {
            width: 24px;
            height: 24px;
        }

        .toggle-item {
            flex: 0 0 auto;
            color: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
            display: inline-flex;
            font-size: 14px;
            line-height: 1;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .toggle-item > span {
            position: relative;
            z-index: 1;
        }

        @media (max-width: 520px) {
            .toggle-item {
                padding: 5px;
            }

            .container svg {
                width: 16px;
                height: 16px;
            }
        }

        .selected-indicator {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            background-color: #2b323dff;
            border-radius: 5px;
            mix-blend-mode: lighten;
        }
    `}</style>
  );
}
