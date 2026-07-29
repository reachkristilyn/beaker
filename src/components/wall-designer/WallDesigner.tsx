"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grid, PlacedPanel, Rotation, WallProduct } from "@/types/wallDesigner";
import { wallProducts } from "@/data/wallProducts";
import WallGrid from "./WallGrid";

// ▸ SET THIS to your actual 2026 backdrop filename in /public/venues/
const VENUE_IMAGE = "/venues/ziegfeld.png";

const ROTATIONS: Rotation[] = [0, 90, 180, 270];
const nextRotation = (r: Rotation): Rotation =>
  ROTATIONS[(ROTATIONS.indexOf(r) + 1) % ROTATIONS.length];

// Products keyed by id, so WallGrid can look up per-panel.
const productMap: Record<string, WallProduct> = Object.fromEntries(
  wallProducts.map((p) => [p.id, p])
);

// Two starter blocks placed edge-to-edge on the lattice to prove snapping.
// grid-a spans lattice cols 4–6; grid-b starts at col 7, so they touch.
// Replace these once "Add Grid" (Phase 2) exists.
const INITIAL_GRIDS: Grid[] = [
  { id: "grid-a", col: 4, row: 6, columns: 3, rows: 3, layerOrder: 1, panels: [] },
  { id: "grid-b", col: 7, row: 6, columns: 2, rows: 3, layerOrder: 2, panels: [] },
];

export default function WallDesigner() {
  // ONE global scale: a 22.5" square as a fraction of the image width.
  const [cellSizePct, setCellSizePct] = useState(0.04);
  const [grids, setGrids] = useState<Grid[]>(INITIAL_GRIDS);
  const [selectedGridId, setSelectedGridId] = useState<string | null>("grid-a");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const activeProductId = wallProducts[0]?.id ?? "";

  // Measure the rendered image width so px sizes stay proportional on resize.
  const imageRef = useRef<HTMLDivElement>(null);
  const [imageWidthPx, setImageWidthPx] = useState(0);

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setImageWidthPx(el.offsetWidth));
    ro.observe(el);
    setImageWidthPx(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const cellSizePx = cellSizePct * imageWidthPx;
  const selectedGrid = grids.find((g) => g.id === selectedGridId) ?? null;

  // Resolve the selected panel (and its grid) from the flat id.
  const selected = useMemo(() => {
    if (!selectedPanelId) return null;
    for (const g of grids) {
      const p = g.panels.find((pp) => pp.id === selectedPanelId);
      if (p) return { grid: g, panel: p };
    }
    return null;
  }, [grids, selectedPanelId]);

  function placePanel(gridId: string, cellRow: number, cellCol: number) {
    if (!activeProductId) return;
    setGrids((prev) =>
      prev.map((g) => {
        if (g.id !== gridId) return g;
        if (g.panels.some((p) => p.cellRow === cellRow && p.cellCol === cellCol)) return g;
        const panel: PlacedPanel = {
          id: crypto.randomUUID(),
          productId: activeProductId,
          cellRow,
          cellCol,
          rotation: 0,
        };
        return { ...g, panels: [...g.panels, panel] };
      })
    );
    setSelectedGridId(gridId);
  }

  function selectPanel(gridId: string, panelId: string) {
    setSelectedGridId(gridId);
    setSelectedPanelId(panelId);
  }

  function selectGrid(gridId: string) {
    setSelectedGridId(gridId);
    setSelectedPanelId(null); // switching blocks clears the panel selection
  }

  function rotateSelected() {
    if (!selected) return;
    setGrids((prev) =>
      prev.map((g) =>
        g.id !== selected.grid.id
          ? g
          : {
              ...g,
              panels: g.panels.map((p) =>
                p.id === selected.panel.id ? { ...p, rotation: nextRotation(p.rotation) } : p
              ),
            }
      )
    );
  }

  function deleteSelectedPanel() {
    if (!selected) return;
    setGrids((prev) =>
      prev.map((g) =>
        g.id !== selected.grid.id
          ? g
          : { ...g, panels: g.panels.filter((p) => p.id !== selected.panel.id) }
      )
    );
    setSelectedPanelId(null);
  }

  // Column/row steppers act on the selected grid; grid grows from its corner.
  function resizeSelectedGrid(deltaCols: number, deltaRows: number) {
    if (!selectedGrid) return;
    setGrids((prev) =>
      prev.map((g) => {
        if (g.id !== selectedGrid.id) return g;
        const columns = Math.max(1, g.columns + deltaCols);
        const rows = Math.max(1, g.rows + deltaRows);
        return {
          ...g,
          columns,
          rows,
          // Drop panels that now fall outside the shrunk block.
          panels: g.panels.filter((p) => p.cellCol < columns && p.cellRow < rows),
        };
      })
    );
  }

// ── Drag-to-move (snaps to the shared lattice on drop) ──
const dragRef = useRef<{
  gridId: string;
  startX: number;
  startY: number;
  startCol: number;
  startRow: number;
} | null>(null);
const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);

function onGridPointerDown(e: React.PointerEvent, grid: Grid) {
  // Ignore clicks on cells (place/select happen there) — only drag from the
  // block's own padding/frame. We detect that by checking the target is the
  // wrapper itself, not a child button.
  if (e.target !== e.currentTarget) return;
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  selectGrid(grid.id);
  dragRef.current = {
    gridId: grid.id,
    startX: e.clientX,
    startY: e.clientY,
    startCol: grid.col,
    startRow: grid.row,
  };
  setDragOffset({ dx: 0, dy: 0 });
}

function onGridPointerMove(e: React.PointerEvent) {
  if (!dragRef.current) return;
  setDragOffset({
    dx: e.clientX - dragRef.current.startX,
    dy: e.clientY - dragRef.current.startY,
  });
}

function onGridPointerUp() {
  const drag = dragRef.current;
  const offset = dragOffset;
  dragRef.current = null;
  setDragOffset(null);
  if (!drag || !offset || cellSizePx === 0) return;

  // Convert the pixel drag into whole-square lattice deltas (snap).
  const deltaCol = Math.round(offset.dx / cellSizePx);
  const deltaRow = Math.round(offset.dy / cellSizePx);
  if (deltaCol === 0 && deltaRow === 0) return;

  setGrids((prev) =>
    prev.map((g) =>
      g.id !== drag.gridId
        ? g
        : {
            ...g,
            col: Math.max(0, drag.startCol + deltaCol),
            row: Math.max(0, drag.startRow + deltaRow),
          }
    )
  );
}

  // Keyboard: R rotates the selected panel.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "r") {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT") return;
        rotateSelected();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.panel.id, selected?.panel.rotation]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: 13, fontWeight: 500 }}>
          Square size ({(cellSizePct * 100).toFixed(1)}% of image)
          <input
            type="range"
            min={0.03}
            max={0.15}
            step={0.005}
            value={cellSizePct}
            onChange={(e) => setCellSizePct(parseFloat(e.target.value))}
            style={{ width: 220 }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Grid {selectedGrid ? `${selectedGrid.columns}×${selectedGrid.rows}` : "—"}
          </span>
          <button type="button" onClick={() => resizeSelectedGrid(-1, 0)} disabled={!selectedGrid}>– col</button>
          <button type="button" onClick={() => resizeSelectedGrid(1, 0)} disabled={!selectedGrid}>+ col</button>
          <button type="button" onClick={() => resizeSelectedGrid(0, -1)} disabled={!selectedGrid}>– row</button>
          <button type="button" onClick={() => resizeSelectedGrid(0, 1)} disabled={!selectedGrid}>+ row</button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={rotateSelected} disabled={!selected}>Rotate (R)</button>
          <button type="button" onClick={deleteSelectedPanel} disabled={!selected}>Delete panel</button>
        </div>
      </div>

      {/* Grid selector — needed because empty blocks have no panel to click */}
      <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
        {grids.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => selectGrid(g.id)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: g.id === selectedGridId ? "2px solid #9B6FD4" : "1px solid #ccc",
              background: g.id === selectedGridId ? "#efe9fb" : "#fff",
              cursor: "pointer",
            }}
          >
            {g.id}
          </button>
        ))}
      </div>

      {/* Venue backdrop + lattice overlay */}
      <div ref={imageRef} style={{ position: "relative", width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VENUE_IMAGE} alt="Venue backdrop" style={{ width: "100%", display: "block" }} draggable={false} />

        {imageWidthPx > 0 &&
          [...grids]
            .sort((a, b) => a.layerOrder - b.layerOrder)
            .map((g) => (
              <div
                key={g.id}
                onPointerDown={(e) => onGridPointerDown(e, g)}
                onPointerMove={onGridPointerMove}
                onPointerUp={onGridPointerUp}
                style={{
                  position: "absolute",
                  left:
                    g.col * cellSizePx +
                    (dragOffset && dragRef.current?.gridId === g.id ? dragOffset.dx : 0),
                  top:
                    g.row * cellSizePx +
                    (dragOffset && dragRef.current?.gridId === g.id ? dragOffset.dy : 0),
                  zIndex:
                    dragRef.current?.gridId === g.id ? 999 : g.layerOrder,
                  padding: 6,
                  cursor: dragRef.current?.gridId === g.id ? "grabbing" : "grab",
                  outline:
                    g.id === selectedGridId
                      ? "2px solid rgba(155,111,212,0.9)"
                      : "none",
                }}
              >
                <WallGrid
                  gridId={g.id}
                  rows={g.rows}
                  columns={g.columns}
                  cellSize={cellSizePx}
                  panels={g.panels}
                  products={productMap}
                  selectedId={selectedPanelId}
                  onPlace={placePanel}
                  onSelect={selectPanel}
                />
              </div>
            ))}
      </div>
    </div>
  );
}