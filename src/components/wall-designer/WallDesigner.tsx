"use client";

import { useEffect, useMemo, useState } from "react";
import { PlacedPanel, Rotation } from "@/types/wallDesigner";
import { wallProducts, PANEL_SIZE_INCHES } from "@/data/wallProducts";
import WallGrid from "./WallGrid";

const MAX_GRID_WIDTH_PX = 720;
const MAX_CELL_PX = 64;

const ROTATIONS: Rotation[] = [0, 90, 180, 270];

function nextRotation(r: Rotation): Rotation {
  return ROTATIONS[(ROTATIONS.indexOf(r) + 1) % ROTATIONS.length];
}

export default function WallDesigner() {
  const [widthFt, setWidthFt] = useState("10");
  const [heightFt, setHeightFt] = useState("8");
  const [panels, setPanels] = useState<PlacedPanel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const product = wallProducts[0];

  const widthIn = (parseFloat(widthFt) || 0) * 12;
  const heightIn = (parseFloat(heightFt) || 0) * 12;
  const columns = Math.max(0, Math.floor(widthIn / PANEL_SIZE_INCHES));
  const rows = Math.max(0, Math.floor(heightIn / PANEL_SIZE_INCHES));

  const cellSize = columns > 0
    ? Math.min(MAX_CELL_PX, Math.floor(MAX_GRID_WIDTH_PX / columns))
    : MAX_CELL_PX;

  const visiblePanels = useMemo(
    () => panels.filter(p => p.row < rows && p.column < columns),
    [panels, rows, columns]
  );

  const selectedPanel = visiblePanels.find(p => p.id === selectedId) ?? null;

  function placePanel(row: number, column: number) {
    const panel: PlacedPanel = {
      id: crypto.randomUUID(),
      productId: product.id,
      row,
      column,
      rotation: 0,
    };
    setPanels(prev => [...prev, panel]);
    setSelectedId(panel.id);
  }

  function rotateSelected() {
    if (!selectedPanel) return;
    setPanels(prev =>
      prev.map(p =>
        p.id === selectedPanel.id ? { ...p, rotation: nextRotation(p.rotation) } : p
      )
    );
  }

  function deleteSelected() {
    if (!selectedPanel) return;
    setPanels(prev => prev.filter(p => p.id !== selectedPanel.id));
    setSelectedId(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "r") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT") return;
        rotateSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPanel?.id, selectedPanel?.rotation]);

  const tiledWidthIn = columns * PANEL_SIZE_INCHES;
  const tiledHeightIn = rows * PANEL_SIZE_INCHES;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-sm font-medium">
          Wall width (ft)
          <input
            type="number"
            min="0"
            step="0.5"
            value={widthFt}
            onChange={e => setWidthFt(e.target.value)}
            className="mt-1 w-32 rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col text-sm font-medium">
          Wall height (ft)
          <input
            type="number"
            min="0"
            step="0.5"
            value={heightFt}
            onChange={e => setHeightFt(e.target.value)}
            className="mt-1 w-32 rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={rotateSelected}
            disabled={!selectedPanel}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
          >
            Rotate (R)
          </button>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!selectedPanel}
            className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-3">
        <div><dt className="inline font-semibold">Requested: </dt><dd className="inline">{widthFt || 0}′ × {heightFt || 0}′</dd></div>
        <div><dt className="inline font-semibold">Tiled: </dt><dd className="inline">{tiledWidthIn}″ × {tiledHeightIn}″</dd></div>
        <div><dt className="inline font-semibold">Rows: </dt><dd className="inline">{rows}</dd></div>
        <div><dt className="inline font-semibold">Columns: </dt><dd className="inline">{columns}</dd></div>
        <div><dt className="inline font-semibold">Panels placed: </dt><dd className="inline">{visiblePanels.length}</dd></div>
      </dl>

      <WallGrid
        rows={rows}
        columns={columns}
        cellSize={cellSize}
        panels={visiblePanels}
        product={product}
        selectedId={selectedId}
        onPlace={placePanel}
        onSelect={setSelectedId}
      />
    </div>
  );
}