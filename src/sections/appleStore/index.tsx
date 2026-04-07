"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import items from "./data";
import "./style.css";
function Card({
  id,
  title,
  category,
  open,
  top,
  bottom,
  width = "100%",
  left,
  theme,
}: CardProps) {
  return (
    <li className={`card ${theme}`} onClick={open}>
      <motion.div className="card-content" layoutId={`card-container-${id}`}>
        <motion.div
          className="card-image-container"
          layoutId={`card-image-container-${id}`}
        >
          <motion.img
            className="card-image"
            src={`https://examples.motion.dev/photos/app-store/${id}.jpg`}
            alt=""
            style={{ top, bottom, width, left }}
            layoutId={`card-image-${id}`}
          />
        </motion.div>
        <motion.div
          className="title-container"
          layoutId={`title-container-${id}`}
          layout="position"
        >
          <span className="h6">{category}</span>
          <h2 className="h3">{title}</h2>
        </motion.div>
      </motion.div>
    </li>
  );
}

function List({ open }: { open: (id: string) => void }) {
  return (
    <ul className="card-list">
      {items.map((card) => (
        <Card key={card.id} {...card} open={() => open(card.id)} />
      ))}
    </ul>
  );
}

function Item({ id, close }: { id: string; close: VoidFunction }) {
  const {
    category,
    title,
    content,
    top,
    bottom,
    theme,
    width = "100%",
    left,
  } = items.find((item) => item.id === id)!;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        style={{ pointerEvents: "auto" }}
        className="overlay"
        onClick={close}
      />
      <div className={`card-content-container open ${theme}`}>
        <motion.div className="card-content" layoutId={`card-container-${id}`}>
          <motion.div
            className="card-image-container"
            layoutId={`card-image-container-${id}`}
          >
            <motion.img
              className="card-image"
              src={`https://examples.motion.dev/photos/app-store/${id}.jpg`}
              alt=""
              style={{ top, bottom, width, left }}
              layoutId={`card-image-${id}`}
            />
          </motion.div>
          <motion.div
            className="title-container"
            layoutId={`title-container-${id}`}
            layout="position"
          >
            <span className="h6">{category}</span>
            <h2 className="h3">{title}</h2>
          </motion.div>
          <motion.div className="content-container small">{content}</motion.div>
        </motion.div>
      </div>
    </>
  );
}

function StoreFront() {
  const [openId, open] = useState<string | null>(null);

  const close = () => open(null);

  return (
    <>
      <List open={open} />
      <AnimatePresence>
        {openId && <Item close={close} id={openId} key="item" />}
      </AnimatePresence>
    </>
  );
}

export default function AppStore() {
  return (
    <div id="app-store">
      <header>
        <div>
          <h2 className="store-title">Today</h2>
        </div>
        <div className="avatar">
          <Image
            src="/authors/matt-perry.png"
            alt="Photo of Matt Perry"
            width={40}
            height={40}
          />
        </div>
      </header>
      <StoreFront />
    </div>
  );
}
