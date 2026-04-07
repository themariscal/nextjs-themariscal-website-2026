"use client";
import { loadJson } from "@/lib/utils";
import { type } from "os";
import { useEffect, useRef, useState } from "react";
import ShirtCanvasPopup from "../models/ShirtCanvasPopup";
import Link from "next/link";
import LocaleLink from "../utils/LocaleLink";
import { url } from "inspector";
import router from "next/navigation";
import { useLocale } from "next-intl";
import { Header } from "@/components/nav/Header";
import data from "@/sections/appleStore/data";
import { motion } from "framer-motion";
import NumberCounter from "./quantityComponent";
import EngagementStats from "./likesComponents";
import PriceComponents from "./priceComponents";
import PriceSwitcher from "./productCurrencyComponents";
import RadixCheckbox from "./checkboxComponents";
import RadixToast from "./addToCalendar";
import RadixToggleGroup from "./sizePicker";
import TabSelect from "./picker";
import Price from "./priceComponents";
import QuantityPriceCounter from "./quantityComponent";
import Image from "next/image";
import HoverImage from "./hoverImage";
interface ProductViewProps {
  model: string;
  design: string;
  color: string;
  size: string;
}

const ProductView: React.FC<ProductViewProps> = ({
  model,
  design,
  color,
  size,
}) => {
  const locale = useLocale();

  const [data, setData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [model3D, setModel3D] = useState(model);
  const [color3D, setColor3D] = useState("ffffff");
  const [color3DName, setColor3DName] = useState("white");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [downloadCount, setDownloadCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shouldReset, setShouldReset] = useState(false);

  const [velocity, setVelocity] = useState(2);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const [url, setUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadJson(`products/${design}/info`).then((data) => {
      setData(data);
      setPrice(data.variant.price);
      setTitle(data.text.en.title);
      setDescription(data.text.en.description);
    });

    setIsMounted(true);
  }, []);

  const handleLoadVariant = () => {
    loadJson(`products/${design}/${model}/${color}/${size}/info`).then(
      (variantData) => {
        setPrice(variantData.price ?? 55.99);
        setTitle(variantData.text.en.title);
        setDescription(variantData.text.en.description);
      }
    );
  };

  useEffect(() => {
    if (!data || !data.colors?.[color]) return;

    const colorHex = data.colors[color].hex;
    const colorName = data.colors[color].name;
    setColor3D(colorHex);
    setColor3DName(colorName);
  }, [color, data]);

  if (!isMounted || !data) return null;

  const blank = `/designs/blank.png`;

  const texture =
    data.textures.front !== "blank"
      ? `/designs/${design}/${data.textures.front}`
      : blank;
  const backTexture =
    data.textures.back !== "blank"
      ? `/designs/${design}/${data.textures.back}`
      : blank;
  const loweBackTexture =
    data.textures.lowBack !== "blank"
      ? `/designs/${design}/${data.textures.lowBack}`
      : blank;

  const handleSetVariant = (variant: any) => {
    console.log(variant);
  };

  const handleModelChange = (newModel: string) => {
    const url = `${design}/${newModel}/${color3DName}/${size}`;

    setModel3D(newModel);
    handleSetUrl(url);
  };

  const handleColorChange = (newColor: any) => {
    const url = `${design}/${model3D}/${newColor.name}/${size}`;
    setColor3D(newColor.hex);
    setColor3DName(newColor.name);
    handleSetUrl(url);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.setAttribute("download", "canvas.png");
    link.setAttribute(
      "href",
      document
        .querySelector("canvas")
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
    );
    link.click();
  };

  const handleMultipleDownload = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    captureIntervalRef.current = setInterval(() => {
      if (isCapturing) {
        handleDownload();
      }
    }, 300);
  };
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSetUrl = (url: string) => {
    setUrl(url);
    const fullUrl = `/${locale}/product/${url}`;

    window.history.replaceState(null, "", fullUrl);
    handleLoadVariant();
  };
  const handleFullRotation = () => {
    // if (isCapturing) {
    //   setIsPlaying(false);
    // }
  };

  const handleCaptureAnimation = () => {
    handleResetClick();
    setVelocity(4);
    setIsPlaying(true);
    setIsCapturing(true);
    handleMultipleDownload();
  };

  const handleStopCaptureAnimation = () => {
    setIsCapturing(false);
    setIsPlaying(false);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      console.log("Captura detenida");
    }
  };
  const handleResetClick = () => {
    setShouldReset(true);
    setIsPlaying(false);
    setTimeout(() => {
      setShouldReset(false);
    }, 200);
  };

  const compatibleModels = Object.entries(data.models).filter(
    ([key, value]: [string, any]) =>
      key !== model3D && value.colors.includes(color3DName)
  );
  return (
    <>
      <Header />
      <div className="container mx-auto h-screen">
        <div className="flex flex-col md:flex-row items-start  h-full">
          <div
            className="md:w-1/2 w-full h-[800px] md:h-[800px]"
            style={{
              background:
                "radial-gradient(circle,oklch(55.6% 0 0) 0%, transparent 68%)",
            }}
          >
            <ShirtCanvasPopup
              velocity={velocity}
              reset={shouldReset}
              isPlaying={isPlaying}
              onFullRotation={handleFullRotation}
              color={color3D}
              model3d={model3D}
              texture={texture}
              backTexture={backTexture}
              loweBackTexture={loweBackTexture}
            />

            <div className="flex flex-col gap-2 mt-8">
              <p className="text-xl text-gray-500">
                Otros modelos disponibles en color:{" "}
                <strong>{color3DName}</strong>
              </p>
              <ul className="flex flex-wrap gap-3">
                {compatibleModels.map(([modelKey]) => (
                  <li key={modelKey}>
                    <div
                      className="rounded-xl p-1 bg-[#1e1e1e] transition-all"
                      style={{
                        border: `1px solid ${data.colors[color3DName].hex}`,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        whileHover={{
                          scale: 1.2,
                          opacity: 1,
                          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.5))",
                        }}
                        animate={{ opacity: 1 }}
                      >
                        <button onClick={() => handleModelChange(modelKey)}>
                          <HoverImage
                            src={`/designs/official/${modelKey}/${color3DName}/cover.png`}
                            hoverSrc={`/designs/official/${modelKey}/${color3DName}/animation.apng`}
                            alt={`${modelKey}-${color3DName}`}
                            width={142}
                            height={1}
                            className="cursor-pointer"
                          />
                        </button>
                      </motion.div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="md:w-1/2 w-full md:px-16 md:py-16 px-8 gap-2 flex flex-col text-left">
            <h1 className="text-4xl font-bold capitalize">
              {title || "Cargando..."} {color3DName}
            </h1>
            <p>{url}</p>
            <EngagementStats />

            <p className="text-sm text-gray-500 mb-6 max-w-[500px]">
              {description}
            </p>
            <QuantityPriceCounter unitPrice={price} max={22} min={1} />
            {/* <TabSelect /> */}
            {/* <RadixToggleGroup /> */}
            <RadixCheckbox />
            <RadixToast />

            <div className="flex flex-col gap-2 mt-2 bg-[#1e1e1e] rounded-xl p-2">
              <motion.ul
                className="flex flex-row"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                {[...Object.entries(data.colors)]
                  .filter(([_, c]) =>
                    data.models[model3D]?.colors?.includes(c.name)
                  )
                  .sort((a, b) =>
                    a[1].name === color3DName
                      ? -1
                      : b[1].name === color3DName
                        ? 1
                        : 0
                  )
                  .map(([colorKey, colorData], index) => {
                    const zIndez = 20 - index;
                    return (
                      <motion.li
                        key={colorKey}
                        layout
                        variants={{
                          rest: { marginLeft: index === 0 ? "0px" : "-125px" },
                          hover: { marginLeft: "0px" },
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ zIndex: zIndez }}
                      >
                        <button
                          onClick={() => handleColorChange(colorData)}
                          className="cursor-pointer"
                        >
                          <HoverImage
                            src={`/designs/official/${model3D}/${colorData.name}/cover.png`}
                            hoverSrc={`/designs/official/${model3D}/${colorData.name}/animation.apng`}
                            alt={colorData.name}
                            width={142}
                            height={1}
                          />
                        </button>
                      </motion.li>
                    );
                  })}
              </motion.ul>
            </div>
            <div className="flex gap-2 flex-col text-left mt-8">
              <button onClick={handleMultipleDownload}>Download</button>
              <button onClick={handlePlayPause}>Play/Pause</button>
              <button onClick={handleResetClick}>Reset Position</button>
              <button onClick={handleCaptureAnimation}>
                Capture Animation
              </button>
              <button onClick={handleStopCaptureAnimation}>Stop Capture</button>
            </div>
            <Image
              src="/designs/official/woman_shirt_blue.apng"
              alt="image"
              width={140}
              height={140}
            />
            <div className="flex gap-2">
              <HoverImage
                src="/designs/official/long-sleeves-man/black/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/black/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/white/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/white/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/red/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/red/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/green/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/green/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/blue/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/blue/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/yellow/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/yellow/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
              <HoverImage
                src="/designs/official/long-sleeves-man/pink/cover.png"
                hoverSrc="/designs/official/long-sleeves-man/pink/animation.apng"
                alt="image"
                width={160}
                height={1}
              />
            </div>
            {/* <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-500">Modelos disponibles:</p>
              <div className="flex flex-wrap gap-2">
                <ul>
                  {data.models.map((newModel: string, index: number) => (
                    <li key={index}>
                      <button
                        onClick={() => handleModelChange(newModel)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        {newModel}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductView;
