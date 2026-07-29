export type Rotation = 0 | 90 | 180 | 270;

export type WallProduct = {
  id: string;
  name: string;
  image: string;
  panelSizeInches: number;
};

// A single placed panel. row/column renamed to cellRow/cellCol to make it
// unambiguous: these are the cell's position INSIDE its grid, not the grid's
// position on the workspace lattice.
export type PlacedPanel = {
  id: string;
  productId: string;
  cellRow: number;
  cellCol: number;
  rotation: Rotation;
};

// A "block" of squares placed on the shared lattice.
export type Grid = {
  id: string;
  // Position on the shared lattice, measured in whole squares from top-left.
  col: number;
  row: number;
  // Size of the block, in squares.
  columns: number;
  rows: number;
  // Stacking order — higher sits on top.
  layerOrder: number;
  // Panels belonging to THIS grid; cellRow/cellCol are local to this block.
  panels: PlacedPanel[];
};

// The whole editor state.
export type Workspace = {
  // ONE global scale for the venue: a 22.5" square as a fraction of the
  // image width (e.g. 0.06 = 6% of the image width). Kept proportional so
  // grids don't drift when the browser resizes. Set once per venue.
  cellSizePct: number;
  grids: Grid[];
};