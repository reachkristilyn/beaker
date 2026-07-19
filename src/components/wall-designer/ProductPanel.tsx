"use client";

import { PlacedPanel, WallProduct } from "@/types/wallDesigner";

type Props = {
  panel: PlacedPanel;
  product: WallProduct;
  selected: boolean;
  size: number;
  onSelect: (id: string) => void;
};

export default function ProductPanel({ panel, product, selected, size, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(panel.id)}
      aria-label={`${product.name} panel, row ${panel.row + 1}, column ${panel.column + 1}, rotated ${panel.rotation} degrees${selected ? ", selected" : ""}`}
      className={`relative block h-full w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
        selected ? "ring-4 ring-blue-500 z-10" : ""
      }`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt=""
        className="h-full w-full object-cover"
        style={{ transform: `rotate(${panel.rotation}deg)` }}
        draggable={false}
      />
    </button>
  );
}