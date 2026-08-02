import { WallProduct } from "@/types/wallDesigner";

export const PANEL_SIZE_INCHES = 22.5;

export const wallProducts: WallProduct[] = [
  {
    id: "dune",
    name: "Dune",
    image: "/products/dune.png",
    panelSizeInches: PANEL_SIZE_INCHES,
  },
  {
    id: "orbit",
    name: "Orbit",
    image: "/products/orbit.png",
    panelSizeInches: PANEL_SIZE_INCHES,
  },
];