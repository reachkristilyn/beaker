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
  row: number;
  column: number;
  rotation: Rotation;
};