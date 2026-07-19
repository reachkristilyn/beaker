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
      className="mx-auto grid w-fit border border-gray-300"
      style={{
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
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
                  className="h-full w-full border border-dashed border-gray-400 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
                  style={{ width: cellSize, height: cellSize }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}