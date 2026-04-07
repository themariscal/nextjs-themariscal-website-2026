"use client";

import Image from "next/image";
import { useState } from "react";

interface HoverImageProps {
  src: string;
  hoverSrc: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

const HoverImage: React.FC<HoverImageProps> = ({
  src,
  hoverSrc,
  alt = "",
  width = 140,
  height = 140,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Image
      src={isHovered ? hoverSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
};

export default HoverImage;
