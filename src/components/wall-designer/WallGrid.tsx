"use client";

import { PlacedPanel, WallProduct } from "@/types/wallDesigner";
import ProductPanel from "./ProductPanel";

type Props = {
  rows: number;
  columns: number;
  cellSize: number;
  panels: PlacedPanel[];
  product: WallProduct;
  selectedId: string | null;
  onPlace: (row: number, column: number) => void;
  onSelect: (id: string) => void;
};

export default function WallGrid({
  rows,
  columns,
  cellSize,
  panels,
  product,
  selectedId,
  onPlace,
  onSelect,
}: Props) {
  if (rows < 1 || columns < 1) {
    return (
      <p className="text-gray-500">
        No complete panels fit these dimensions. Try a larger wall.
      </p>
    );
  }

  const panelAt = (row: number, column: number) =>
    panels.find(p => p.row === row && p.column === column);

  return (
    <div
      role="grid"
      aria-label="Wall panel grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        margin: "0 auto",
        width: "fit-content",
        border: "1px solid #ccc",
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: columns }).map((_, c) => {
          const placed = panelAt(r, c);
          return (
            <div key={`${r}-${c}`} role="gridcell" className="relative">
              {placed ? (
                <ProductPanel
                  panel={placed}
                  product={product}
                  selected={placed.id === selectedId}
                  size={cellSize}
                  onSelect={onSelect}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onPlace(r, c)}
                  aria-label={`Empty cell, row ${r + 1}, column ${c + 1}. Place ${product.name} panel.`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    border: "1px dashed #999",
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