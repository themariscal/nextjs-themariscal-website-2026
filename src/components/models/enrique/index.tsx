"use client";

import React, { useEffect, useState } from "react";
import EnriqueCanvas from "./EnriqueCanvas";

const timeInterval = 2;

const sequence: (string | "ALL_ON" | "ALL_OFF")[] = [
  "enableLightLetterE",
  "enableLightLetterN",
  "enableLightLetterR",
  "enableLightLetterI",
  "enableLightLetterQ",
  "enableLightLetterU",
  "enableLightLetterE",
  "enableLightLetterI",
  "enableLightLetterV",
  "enableLightTriskelion",
  "ALL_ON",
  "ALL_OFF",
];

const EnriqueController = () => {
  const [activeProps, setActiveProps] = useState<Record<string, boolean>>({});
  const [stepIndex, setStepIndex] = useState(-1); // 👈 inicia en -1 para que arranque todo apagado

  useEffect(() => {
    if (stepIndex >= 0) {
      const currentStep = sequence[stepIndex];

      if (currentStep === "ALL_ON") {
        setActiveProps({
          enableLightLetterE: true,
          enableLightLetterN: true,
          enableLightLetterR: true,
          enableLightLetterI: true,
          enableLightLetterQ: true,
          enableLightLetterU: true,
          enableLightLetterV: true,
          enableLightInsideCircle: true,
          enableLightInsideCircleBorder: true,
          enableLightTriskelion: true,
        });
      } else if (currentStep === "ALL_OFF") {
        setActiveProps({});
      } else {
        setActiveProps({ [currentStep]: true });
      }
    } else {
      setActiveProps({}); // paso -1: todo apagado
    }

    const timeout = setTimeout(() => {
      setStepIndex((prev) => (prev + 1) % (sequence.length + 1)); // +1 para incluir el paso -1
    }, (stepIndex === 10 ? timeInterval * 2 : timeInterval) * 1000); // ALL_ON tiene doble duración

    return () => clearTimeout(timeout);
  }, [stepIndex]);

  return <EnriqueCanvas {...activeProps} />;
};

export default EnriqueController;
