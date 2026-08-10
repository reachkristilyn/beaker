export type Rotation = 0 | 90 | 180 | 270;

export type WallProduct = {
  id: string;
  name: string;
  image: string;
  panelSizeInches: number;
  aspect?: number; // width ÷ height of the cell; absent = 1 (square). >1 = wider/shorter.
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
  angleDeg: number; // 2D lean; 0 = head-on, +/- tilts opposite ways
  cellAspect?: number; // overrides the product's aspect for THIS grid while tuning; absent = use product/default
  panels: PlacedPanel[];
};

export type Workspace = {
  cellSizePct: number;
  grids: Grid[];
};