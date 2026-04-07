"use client";

import { AnimatePresence, motion } from "motion/react";
import { Toast } from "radix-ui";
import { useState } from "react";

export default function RadixToast() {
  const [date, setDate] = useState<string | null>(null);

  return (
    <Toast.Provider>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="button primary-action large"
        onClick={() => {
          setDate(prettyDate(randomDate()));
        }}
      >
        Add to calendar
      </motion.button>
      <AnimatePresence mode="wait">
        {date ? (
          <Toast.Root
            key={date}
            duration={3000}
            open
            onOpenChange={() => setDate(null)}
            asChild
            forceMount
          >
            <motion.div
              className="toast-root"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              drag="x"
              dragElastic={0.1}
              dragConstraints={{ left: 0 }}
              onUpdate={(latest) => {
                if ((latest.x as number) > 100) {
                  setDate(null);
                }
              }}
            >
              <Toast.Title className="toast-title">
                Scheduled: Catch up
              </Toast.Title>
              <Toast.Description asChild>
                <time className="toast-description" dateTime={date}>
                  {date}
                </time>
              </Toast.Description>
              <Toast.Action
                className="toast-action"
                asChild
                altText="Goto schedule to undo"
              >
                <button className="button small">Undo</button>
              </Toast.Action>
            </motion.div>
          </Toast.Root>
        ) : null}
      </AnimatePresence>
      <Toast.Viewport className="toast-viewport" />
      <StyleSheet />
    </Toast.Provider>
  );
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
  return (
    <style>{`
        button {
            cursor: pointer;
        }

        .toast-viewport {
            --viewport-padding: 25px;
            position: fixed;
            top: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            padding: var(--viewport-padding);
            gap: 10px;
            width: 390px;
            max-width: 100vw;
            margin: 0;
            list-style: none;
            z-index: 2147483647;
            outline: none;
        }

        .toast-root {
            background-color: #0b1011;
            border: 1px solid #1d2628;
            border-radius: 10px;
            box-shadow:
                hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
                hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
            padding: 15px;
            display: grid;
            grid-template-areas: "title action" "description action";
            grid-template-columns: auto max-content;
            column-gap: 15px;
            align-items: center;
        }

        .toast-title {
            grid-area: title;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--text);
            font-size: 15px;
        }

        .toast-description {
            grid-area: description;
            margin: 0;
            color: var(--feint-text);
            font-size: 13px;
            line-height: 1.3;
        }

        .toast-action {
            grid-area: action;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-weight: 500;
            user-select: none;
        }
        .button.small {
            font-size: 14px;
            padding: 0 10px;
            line-height: 25px;
            height: 25px;

            background: #0d63f8;
        }
        .button.large {
            font-size: 16px;
            padding: 0 10px;
            line-height: 35px;
            height: 35px;
        }
    `}</style>
  );
}

/**
 * ==============   Utils   ================
 */

function randomDate() {
  const now = new Date();
  const inOneWeek = now.setDate(now.getDate() + Math.round(Math.random() * 31));
  return new Date(inOneWeek);
}

function prettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
