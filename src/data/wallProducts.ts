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
  {
    id: "swirl",
    name: "Swirl",
    image: "/products/swirl.png",
    panelSizeInches: PANEL_SIZE_INCHES,
  },
  {
    id: "swirlangle",
    name: "Swirl Angle",
    image: "/products/swirlangle.png",
    panelSizeInches: PANEL_SIZE_INCHES,
    aspect: 1.3,   
  },

  {
    id: "pyramid",
    name: "Pyramid",
    image: "/products/pyramid.png",
    panelSizeInches: PANEL_SIZE_INCHES,
  },

{
    id: "ripple",
    name: "Ripple",
    image: "/products/ripple.png",
    panelSizeInches: PANEL_SIZE_INCHES,
    rowSpan: 2,
  },

];