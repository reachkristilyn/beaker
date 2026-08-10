"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grid, PlacedPanel, Rotation, WallProduct } from "@/types/wallDesigner";
import { wallProducts } from "@/data/wallProducts";
import WallGrid from "./WallGrid";
import { toPng } from "html-to-image";

const VENUE_IMAGE = "/venues/ziegfeld.png";

const ROTATIONS: Rotation[] = [0, 90, 180, 270];
const nextRotation = (r: Rotation): Rotation =>
  ROTATIONS[(ROTATIONS.indexOf(r) + 1) % ROTATIONS.length];

const productMap: Record<string, WallProduct> = Object.fromEntries(
  wallProducts.map((p) => [p.id, p])
);

// Start with one wall near center; the "Start over" button recreates this.
const makeStarterGrid = (): Grid => ({
  id: crypto.randomUUID(),
  xPct: 0.33,
  yPct: 0.34,
  columns: 3,
  rows: 3,
  layerOrder: 1,
  angleDeg: 0,
  panels: [],
});

export default function WallDesigner() {
  const [cellSizePct, setCellSizePct] = useState(0.04);
  const [grids, setGrids] = useState<Grid[]>(() => [makeStarterGrid()]);
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string>(wallProducts[0]?.id ?? "");

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
  const maxLayer = () => grids.reduce((m, g) => Math.max(m, g.layerOrder), 0);

  const selected = useMemo(() => {
    if (!selectedPanelId) return null;
    for (const g of grids) {
      const p = g.panels.find((pp) => pp.id === selectedPanelId);
      if (p) return { grid: g, panel: p };
    }
    return null;
  }, [grids, selectedPanelId]);

  // ── Panel placement / selection ──
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
    setSelectedPanelId(null);
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

  // ── Grid size (steppers) ──
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
          panels: g.panels.filter((p) => p.cellCol < columns && p.cellRow < rows),
        };
      })
    );
  }

function setSelectedGridAngle(deg: number) {
    if (!selectedGrid) return;
    setGrids((prev) =>
      prev.map((g) => (g.id !== selectedGrid.id ? g : { ...g, angleDeg: deg }))
    );
  }  

  // ── Phase 2: add / duplicate / delete / layer order ──
  function addGrid() {
    const g: Grid = {
      id: crypto.randomUUID(),
      xPct: 0.02,
      yPct: 0.02,
      columns: 2,
      rows: 2,
      angleDeg: 0,
      layerOrder: maxLayer() + 1,
      panels: [],
    };
    setGrids((prev) => [...prev, g]);
    setSelectedGridId(g.id);
    setSelectedPanelId(null);
  }

  function duplicateGrid() {
    if (!selectedGrid) return;
    const copy: Grid = {
      ...selectedGrid,
      id: crypto.randomUUID(),
      xPct: selectedGrid.xPct + cellSizePct, // offset one square so it's visible
      yPct: selectedGrid.yPct + cellSizePct,
      layerOrder: maxLayer() + 1,
      panels: selectedGrid.panels.map((p) => ({ ...p, id: crypto.randomUUID() })),
    };
    setGrids((prev) => [...prev, copy]);
    setSelectedGridId(copy.id);
    setSelectedPanelId(null);
  }

  function deleteGrid() {
    if (!selectedGrid) return;
    setGrids((prev) => prev.filter((g) => g.id !== selectedGrid.id));
    setSelectedGridId(null);
    setSelectedPanelId(null);
  }

  function bringForward() {
    if (!selectedGrid) return;
    setGrids((prev) => {
      const sorted = [...prev].sort((a, b) => a.layerOrder - b.layerOrder);
      const i = sorted.findIndex((g) => g.id === selectedGrid.id);
      if (i < 0 || i === sorted.length - 1) return prev;
      const a = sorted[i], b = sorted[i + 1];
      return prev.map((g) =>
        g.id === a.id ? { ...g, layerOrder: b.layerOrder }
        : g.id === b.id ? { ...g, layerOrder: a.layerOrder }
        : g
      );
    });
  }
  function sendBackward() {
    if (!selectedGrid) return;
    setGrids((prev) => {
      const sorted = [...prev].sort((a, b) => a.layerOrder - b.layerOrder);
      const i = sorted.findIndex((g) => g.id === selectedGrid.id);
      if (i <= 0) return prev;
      const a = sorted[i], b = sorted[i - 1];
      return prev.map((g) =>
        g.id === a.id ? { ...g, layerOrder: b.layerOrder }
        : g.id === b.id ? { ...g, layerOrder: a.layerOrder }
        : g
      );
    });
  }

  function startOver() {
    const g = makeStarterGrid();
    setGrids([g]);
    setSelectedGridId(g.id);
    setSelectedPanelId(null);
  }
// ── Save / load design to a .json file ──
  function saveDesign() {
    const design = { version: 1, cellSizePct, grids };
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beaker-wall-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function exportImage() {
    if (!imageRef.current) return;

    const wasPreview = previewMode;
    // Force preview + clear selection so no chrome is in the shot.
    setPreviewMode(true);
    setSelectedGridId(null);
    setSelectedPanelId(null);

    // Let React paint the preview state before we capture.
    await new Promise((r) => setTimeout(r, 80));

    try {
      const dataUrl = await toPng(imageRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `beaker-wall-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Couldn't export the image — check the console.");
    } finally {
      // Restore whatever mode they were in before exporting.
      setPreviewMode(wasPreview);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadDesign(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (typeof parsed.cellSizePct !== "number" || !Array.isArray(parsed.grids)) {
          alert("That doesn't look like a Beaker wall design file.");
          return;
        }
        setCellSizePct(parsed.cellSizePct);
        setGrids(parsed.grids);
        setSelectedGridId(null);
        setSelectedPanelId(null);
      } catch {
        alert("Couldn't read that file — is it a valid design JSON?");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset so loading the same file twice still fires
  }


  // ── Free drag (no snapping) via a dedicated handle ──
  const dragRef = useRef<{
    gridId: string; startX: number; startY: number; startXPct: number; startYPct: number;
  } | null>(null);

  function onHandleDown(e: React.PointerEvent, g: Grid) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    selectGrid(g.id);
    dragRef.current = {
      gridId: g.id, startX: e.clientX, startY: e.clientY, startXPct: g.xPct, startYPct: g.yPct,
    };
  }
  function onHandleMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d || imageWidthPx === 0) return;
    const dxPct = (e.clientX - d.startX) / imageWidthPx;
    const dyPct = (e.clientY - d.startY) / imageWidthPx;
    setGrids((prev) =>
      prev.map((g) =>
        g.id !== d.gridId
          ? g
          : { ...g, xPct: Math.max(0, d.startXPct + dxPct), yPct: Math.max(0, d.startYPct + dyPct) }
      )
    );
  }
  function onHandleUp(e: React.PointerEvent) {
    if (dragRef.current) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
    dragRef.current = null;
  }

  // Keyboard: R rotates selected panel.
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

  const btn = { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 13 } as const;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1: square size + grid steppers */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: 13, fontWeight: 500 }}>
          Square size ({(cellSizePct * 100).toFixed(1)}% of image)
          <input type="range" min={0.03} max={0.15} step={0.005} value={cellSizePct}
            onChange={(e) => setCellSizePct(parseFloat(e.target.value))} style={{ width: 200 }} />
        </label>

<label style={{ display: "flex", flexDirection: "column", fontSize: 13, fontWeight: 500 }}>
          Product
          <select
            value={activeProductId}
            onChange={(e) => setActiveProductId(e.target.value)}
            style={{ marginTop: 4, padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc" }}
          >
            {wallProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            Grid {selectedGrid ? `${selectedGrid.columns}×${selectedGrid.rows}` : "—"}
          </span>
          <button type="button" style={btn} onClick={() => resizeSelectedGrid(-1, 0)} disabled={!selectedGrid}>– col</button>
          <button type="button" style={btn} onClick={() => resizeSelectedGrid(1, 0)} disabled={!selectedGrid}>+ col</button>
          <button type="button" style={btn} onClick={() => resizeSelectedGrid(0, -1)} disabled={!selectedGrid}>– row</button>
          <button type="button" style={btn} onClick={() => resizeSelectedGrid(0, 1)} disabled={!selectedGrid}>+ row</button>
        </div>
        <button type="button" style={btn} onClick={() => resizeSelectedGrid(0, 1)} disabled={!selectedGrid}>+ row</button>
        </div>

        {/* Angle slider — paste here */}
        <label style={{ display: "flex", flexDirection: "column", fontSize: 13, fontWeight: 500 }}>
          Angle ({selectedGrid?.angleDeg ?? 0}°)
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={selectedGrid?.angleDeg ?? 0}
            onChange={(e) => setSelectedGridAngle(parseInt(e.target.value))}
            disabled={!selectedGrid}
            style={{ width: 160 }}
          />
        </label>
      </div>

      /* Row 2: grid + panel actions */
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" style={btn} onClick={addGrid}>+ Add grid</button>
        <button type="button" style={btn} onClick={duplicateGrid} disabled={!selectedGrid}>Duplicate</button>
        <button type="button" style={btn} onClick={deleteGrid} disabled={!selectedGrid}>Delete grid</button>
        <button type="button" style={btn} onClick={bringForward} disabled={!selectedGrid}>Bring forward</button>
        <button type="button" style={btn} onClick={sendBackward} disabled={!selectedGrid}>Send backward</button>
        <span style={{ width: 12 }} />
        <button type="button" style={btn} onClick={rotateSelected} disabled={!selected}>Rotate panel (R)</button>
        <button type="button" style={btn} onClick={deleteSelectedPanel} disabled={!selected}>Delete panel</button>
        <span style={{ width: 12 }} />
        <button type="button" style={{ ...btn, borderColor: "#9B6FD4", color: "#7c4dd0" }} onClick={startOver}>Start over (one wall)</button>
        <button
          type="button"
          style={{ ...btn, borderColor: "#9B6FD4", color: previewMode ? "#fff" : "#7c4dd0", background: previewMode ? "#7c4dd0" : "#fff" }}
          onClick={() => { setPreviewMode((v) => !v); setSelectedGridId(null); setSelectedPanelId(null); }}
        >
          {previewMode ? "Edit mode" : "Preview"}
        </button>
        <button type="button" style={btn} onClick={saveDesign}>Save design</button>
        <button type="button" style={btn} onClick={() => fileInputRef.current?.click()}>Load design</button>
        <button type="button" style={{ ...btn, borderColor: "#9B6FD4", color: "#7c4dd0" }} onClick={exportImage}>Export image (PNG)</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={loadDesign}
          style={{ display: "none" }}
        />
      </div>

      {/* Venue + free-placed blocks */}
      <div ref={imageRef} style={{ position: "relative", width: "100%", maxWidth: 1000, margin: "0 auto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VENUE_IMAGE} alt="Venue backdrop" style={{ width: "100%", display: "block" }} draggable={false} />

        {imageWidthPx > 0 &&
          [...grids].sort((a, b) => a.layerOrder - b.layerOrder).map((g) => (
            <div key={g.id} style={{ position: "absolute", left: g.xPct * imageWidthPx, top: g.yPct * imageWidthPx, zIndex: g.layerOrder }}>
              {/* Drag handle — grab THIS to move; click cells to place panels */}
                                {!previewMode && g.id === selectedGridId && (

              <div
                onPointerDown={(e) => onHandleDown(e, g)}
                onPointerMove={onHandleMove}
                onPointerUp={onHandleUp}
                title="Drag to move"
                style={{
                  position: "absolute",
                  top: -22,
                  left: 0,
                  height: 18,
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  lineHeight: 1,
                  color: "#fff",
                  background: g.id === selectedGridId ? "#7c4dd0" : "rgba(124,77,208,0.7)",
                  borderRadius: 5,
                  cursor: dragRef.current?.gridId === g.id ? "grabbing" : "grab",
                  userSelect: "none",
                  touchAction: "none",
                  whiteSpace: "nowrap",
                }}
              >
                ⠿ move
              </div>
              )}
              <div style={{
                outline: !previewMode && g.id === selectedGridId ? "2px solid rgba(155,111,212,0.9)" : "none",
                transform: g.angleDeg ? `skewX(${g.angleDeg}deg)` : undefined,
                transformOrigin: "center center",
              }}>                  gridId={g.id}
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
            </div>
          ))}
      </div>
    </div>
  );
}