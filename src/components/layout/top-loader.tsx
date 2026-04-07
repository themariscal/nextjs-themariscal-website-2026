"use client";

import React from "react";
import NextTopLoader from "nextjs-toploader";

const TopLoader = () => {
  const color = "oklch(0.645 0.246 16.439)";
  return (
    <NextTopLoader
      color={color}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={true}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${color}, 0 0 5px ${color}`}
      template='<div class="bar" role="bar"><div class="peg"></div></div> 
        <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      zIndex={1600}
      showAtBottom={false}
    />
  );
};

export default TopLoader;
