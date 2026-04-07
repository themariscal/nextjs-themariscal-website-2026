"use client";

import ProductView from "@/components/views/productView";
import { useParams } from "next/navigation";

export default function SizePage() {
  const params = useParams();

  const design = params.design as string;
  const model = params.model as string;
  const color = "white";
  const size = "medium";

  return (
    <ProductView model={model} design={design} color={color} size={size} />
  );
}
