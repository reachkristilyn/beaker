"use client";

import dynamic from "next/dynamic";

// SplatScene touches window/WebGL, so it must never render on the server.
const SplatScene = dynamic(() => import("./SplatScene"), { ssr: false });

export default function SplatViewer() {
  return <SplatScene />;
}