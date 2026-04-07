"use client";

import ProductView from "@/components/views/productView";
import { useParams } from "next/navigation";

export default function SizePage() {
  const params = useParams();

  const design = params.design as string;
  const model = params.model as string;
  const color = params.color as string;
  const size = params.size as string;

  return (
    <ProductView model={model} design={design} color={color} size={size} />
  );
}
