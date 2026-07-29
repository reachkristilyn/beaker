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
      aria-label={`${product.name} panel, row ${panel.cellRow + 1}, column ${panel.cellCol + 1}, rotated ${panel.rotation} degrees${selected ? ", selected" : ""}`}
      style={{
        width: size,
        height: size,
        display: "block",
        position: "relative",
        overflow: "hidden",
        padding: 0,
        border: "none",
        cursor: "pointer",
        outline: selected ? "3px solid #2563eb" : "none",
        outlineOffset: "-3px",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt=""
        style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: `rotate(${panel.rotation}deg)`,
          }}
        draggable={false}
      />
    </button>
  );
}