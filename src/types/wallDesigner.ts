export type Rotation = 0 | 90 | 180 | 270;

export type WallProduct = {
  id: string;
  name: string;
  image: string;
  panelSizeInches: number;
};

export type PlacedPanel = {
  id: string;
  productId: string;
  cellRow: number;
  cellCol: number;
  rotation: Rotation;
};

export type Grid = {
  id: string;
  // Top-left position as a fraction of the IMAGE WIDTH (both axes use width,
  // so position and square size all scale together on resize). Free placement
  // — no snapping to a lattice.
  xPct: number;
  yPct: number;
  // Size of the block, in squares.
  columns: number;
  rows: number;
  layerOrder: number;
  panels: PlacedPanel[];
};

export type Workspace = {
  cellSizePct: number;
  grids: Grid[];
};