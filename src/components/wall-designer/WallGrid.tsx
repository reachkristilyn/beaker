"use client";

import { PlacedPanel, WallProduct } from "@/types/wallDesigner";
import ProductPanel from "./ProductPanel";

type Props = {
  gridId: string;
  rows: number;
  columns: number;
  cellSize: number;
  panels: PlacedPanel[];
  // Per-panel lookup now, since each cell can hold a different product.
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
  panels,
  products,
  selectedId,
  onPlace,
  onSelect,
}: Props) {
  if (rows < 1 || columns < 1) return null;

  const panelAt = (cellRow: number, cellCol: number) =>
    panels.find((p) => p.cellRow === cellRow && p.cellCol === cellCol);

  return (
    <div
      role="grid"
      aria-label="Wall panel grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        // No border, no margin: the grid is positioned by its parent on the
        // lattice and must be transparent so the venue shows through.
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
                  size={cellSize}
                  onSelect={() => onSelect(gridId, placed.id)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onPlace(gridId, r, c)}
                  aria-label={`Empty cell, row ${r + 1}, column ${c + 1}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
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