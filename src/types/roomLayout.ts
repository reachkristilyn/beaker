// Layout state for Room Designer (Tool 03).
// 1 scene unit = 1 inch throughout. The splat is scaled to match; panels are always real inches.

import type { WallProduct } from "@/types/wallDesigner";

export type Vec3 = { x: number; y: number; z: number };

/** A plane defined from clicked points on the splat (Phase C). */
export type RoomPlane = {
  id: string;
  kind: "floor" | "wall";
  /** Plane origin, scene units (inches). */
  origin: Vec3;
  /** Unit normal. */
  normal: Vec3;
  label?: string;
};

/** A cols × rows group of panels for one product, placed against a plane (Phase D). */
export type PlacedPanelGroup = {
  id: string;
  productId: WallProduct["id"];
  cols: number;
  rows: number;
  /** World position of the group's bottom-left corner, inches. */
  position: Vec3;
  /** Rotation about Y in radians (0 = facing +Z). */
  rotationY: number;
  /** Which plane this group is snapped to, if any. */
  planeId?: string;
};

/** Scale calibration result (Phase B). */
export type ScaleCalibration = {
  /** Multiply raw splat units by this to get inches. */
  splatUnitsToInches: number;
  /** The two picked points and known distance that produced it, for editing/undo. */
  pointA: Vec3;
  pointB: Vec3;
  knownDistanceInches: number;
};

export type RoomLayout = {
  version: 1;
  splatUrl: string;
  /** Rotation applied to the splat to make it roughly Y-up. */
  splatRotation: Vec3;
  scale?: ScaleCalibration;
  planes: RoomPlane[];
  groups: PlacedPanelGroup[];
};

export const emptyRoomLayout = (splatUrl: string): RoomLayout => ({
  version: 1,
  splatUrl,
  splatRotation: { x: 0, y: 0, z: 0 },
  planes: [],
  groups: [],
});