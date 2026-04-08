import Link from "next/link";
import React, { useState } from "react";
import { SiCodepen, SiGithub, SiX } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { OutlineButton } from "../buttons/OutlineButton";
import ToggleWrapper from "../motionComponent/DarkModeToggle";
import DarkModeToggle from "../motionComponent/DarkModeToggle";
import Image from "next/image";
import HoverImage from "../views/hoverImage";
export const Header = () => {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  return (
    <header className="h-[72px] px-4 flex items-center justify-between sticky top-0 z-20 bg-zinc-900/50 backdrop-blur-md">
      <MyLinks />

      <div>
        <HoverImage
          src={`/assets/components/logo.apng`}
          hoverSrc={`/assets/components/logoout.apng`}
          alt="logo"
          width={260}
          height={1}
        />
      </div>
      <DarkModeToggle mode={mode} setMode={setMode} />
    </header>
  );
};

export const MyLinks = () => (
  <div className="flex items-center text-lg gap-4">
    <Link
      className="text-zinc-300 hover:text-gray-300 transition-colors"
      href="https://www.linkedin.com"
      target="_blank"
      rel="nofollow"
    >
      <FaLinkedin />
    </Link>
    <Link
      className="text-zinc-300 hover:text-gray-300 transition-colors"
      href="https://www.github.com"
      target="_blank"
      rel="nofollow"
    >
      <SiGithub />
    </Link>
    <Link
      className="text-zinc-300 hover:text-gray-300 transition-colors"
      href="https://www.x.com"
      target="_blank"
      rel="nofollow"
    >
      <SiX />
    </Link>
    <Link
      className="text-zinc-300 hover:text-gray-300 transition-colors"
      href="https://www.codepen.io"
      target="_blank"
      rel="nofollow"
    >
      <SiCodepen />
    </Link>
  </div>
);
