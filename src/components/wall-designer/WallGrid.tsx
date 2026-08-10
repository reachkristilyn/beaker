"use client";

import { PlacedPanel, WallProduct } from "@/types/wallDesigner";
import ProductPanel from "./ProductPanel";

type Props = {
  gridId: string;
  rows: number;
  columns: number;
  cellSize: number;
  // Effective aspect (width ÷ height) for THIS grid's cells. 1 = square.
  cellAspect: number;
  panels: PlacedPanel[];
  products: Record<string, WallProduct>;
  selectedId: string | null;
  onPlace: (gridId: string, cellRow: number, cellCol: number) => void;
  onSelect: (gridId: string, panelId: string) => void;
};

export default function WallGrid({
  gridId,
  rows,
  columns,
  cellSize,
  cellAspect,
  panels,
  products,
  selectedId,
  onPlace,
  onSelect,
}: Props) {
  if (rows < 1 || columns < 1) return null;

  // Width stays the 22.5" square width; height shrinks/grows by aspect.
  const cellH = cellSize;
  const cellW = cellSize / (cellAspect || 1);

  const panelAt = (cellRow: number, cellCol: number) =>
    panels.find((p) => p.cellRow === cellRow && p.cellCol === cellCol);

  return (
    <div
      role="grid"
      aria-label="Wall panel grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${cellW}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
        gap: 0, // stacked panels butt together — no gaps
        background: "transparent",
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: columns }).map((_, c) => {
          const placed = panelAt(r, c);
          const product = placed ? products[placed.productId] : undefined;

          return (
            <div key={`${r}-${c}`} role="gridcell" className="relative">
              {placed && product ? (
                <ProductPanel
                  panel={placed}
                  product={product}
                  selected={placed.id === selectedId}
                  width={cellW}
                  height={cellH}
                  onSelect={() => onSelect(gridId, placed.id)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onPlace(gridId, r, c)}
                  aria-label={`Empty cell, row ${r + 1}, column ${c + 1}`}
                  style={{
                    width: cellW,
                    height: cellH,
                    border: "1px dashed rgba(155,111,212,0.5)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}