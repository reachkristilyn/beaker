"use client";

import dynamic from "next/dynamic";

// RoomScene touches window/WebGL; it must never render on the server.
const RoomScene = dynamic(() => import("./RoomScene"), { ssr: false });

export default function RoomViewer() {
  return <RoomScene />;
}