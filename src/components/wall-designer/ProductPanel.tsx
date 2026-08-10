"use client";

import { PlacedPanel, WallProduct } from "@/types/wallDesigner";

type Props = {
  panel: PlacedPanel;
  product: WallProduct;
  selected: boolean;
  width: number;
  height: number;
  onSelect: (id: string) => void;
};

export default function ProductPanel({ panel, product, selected, width, height, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(panel.id)}
      aria-label={`${product.name} panel, row ${panel.cellRow + 1}, column ${panel.cellCol + 1}, rotated ${panel.rotation} degrees${selected ? ", selected" : ""}`}
      style={{
        width,
        height,
        display: "block",
        position: "relative",
        overflow: "hidden",
        padding: 0,
        border: "none",
        background: "transparent",
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
            objectFit: "fill",
            display: "block",
            transform: `rotate(${panel.rotation}deg)`,
          }}
        draggable={false}
      />
    </button>
  );
}