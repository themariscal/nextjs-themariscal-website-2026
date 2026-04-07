"use client";

import { motion } from "motion/react";
import { useState } from "react";

const tabs = ["Home", "React", "Vue", "Svelte"];

export default function TabSelect() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <nav className="container">
      <ul>
        {tabs.map((name, index) => {
          const isSelected = selectedTab === index;

          return (
            <li
              key={index}
              className={isSelected ? "selected" : ""}
              role="tab"
              aria-selected={isSelected}
            >
              {isSelected ? (
                <motion.div
                  layoutId="selected-indicator"
                  className="selected-indicator"
                />
              ) : null}
              <motion.button
                /**
                 * Using onTap instead of onClick makes this
                 * element keyboard-accessible by default
                 */
                onTapStart={() => setSelectedTab(index)}
                whileTap={{ scale: 0.9 }}
                whileFocus={{
                  backgroundColor: "var(--accent-transparent)",
                }}
              >
                {name}
              </motion.button>
            </li>
          );
        })}
      </ul>
      <StyleSheet />
    </nav>
  );
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
  return (
    <style>{`
        .container {
            background-color: #0b1011;
            border-radius: 10px;
            border: 1px solid #1d2628;
            padding: 5px;
        }

        .container ul {
            display: flex;
            gap: 5px;
            flex-direction: row;
            align-items: center;
            justify-content: center;
        }

        .container li {
            color: #f5f5f5;
            position: relative;
        }

        .container .selected-indicator {
            background-color: #ff0088;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            z-index: 1;
            border-radius: 5px;
        }

        .container button {
            z-index: 2;
            position: relative;
            cursor: pointer;
            padding: 10px 14px;
            border-radius: 5px;
        }

    `}</style>
  );
}
