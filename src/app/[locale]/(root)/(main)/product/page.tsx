"use client";
import ShirtCanvasPopup from "@/components/models/ShirtCanvasPopup";
import { color } from "framer-motion";
import React from "react";

const ProductPage = () => {
  const model3d = "womanShirt";
  const texture =
    "https://thumbs.dreamstime.com/b/batman-logo-isolated-png-high-quality-illustration-famous-transparent-background-graphic-element-your-design-file-105020151.jpg";

  const backTexture =
    "https://imgc.allpostersimages.com/img/posters/batman-logo_u-l-f1lzjk0.jpg?artHeight=550&artPerspective=y&artWidth=550&background=ffffff";

  const loweBackTexture =
    "https://i.redd.it/which-batman-movie-logo-is-your-favourite-v0-nbwn9ypq1qlb1.jpg?width=850&format=pjpg&auto=webp&s=9923b7dc6dd07f02391ac5c78d492684452a681b";

  const color = "ff0099";

  return (
    <div className="h-screen">
      <ShirtCanvasPopup
        color={color}
        model3d={model3d}
        texture={texture}
        backTexture={backTexture}
        loweBackTexture={loweBackTexture}
      />
    </div>
  );
};

export default ProductPage;
