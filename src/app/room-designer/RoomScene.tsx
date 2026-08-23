"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { PANEL_SIZE_INCHES } from "@/data/wallProducts";
import CalibrationPanel from "./CalibrationPanel";
import styles from "./page.module.css";

// Public indoor room (Mip-NeRF 360 "room" scene, 51 MB). Loaded from the HF CDN
// for Phase A; vendor into public/splats/ once confirmed working.
const SPLAT_URL = "https://vyiohij2d53jlpdw.public.blob.vercel-storage.com/splats/room.splat";

// 1 scene unit = 1 inch. The splat's own units are arbitrary until Phase B
// calibration; SPLAT_PRESCALE just makes it a viewable size for now.
const SPLAT_PRESCALE = 100;

// Benchmark scenes rarely import Y-up. Tune these once you can see the room.
const SPLAT_ROTATION = new THREE.Euler(Math.PI, 0, 0);

type SceneHandle = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  room: SplatMesh;
  panel: THREE.Mesh;
};

export default function RoomScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [pickedCount, setPickedCount] = useState(0);
  const [distanceInput, setDistanceInput] = useState("");
  const [inchesPerUnit, setInchesPerUnit] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = width * (9 / 16);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // --- Scene & camera (units are inches, so far/near are large) ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);
    camera.position.set(0, 120, 300);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    // --- Room splat ---
    const room = new SplatMesh({ url: SPLAT_URL });
    room.rotation.copy(SPLAT_ROTATION);
    room.scale.setScalar(SPLAT_PRESCALE);
    scene.add(room);

    // --- Orientation helpers: floor grid + axes ---
    // 480 in = 40 ft square, 12 in cells. Purely visual; removed once real
    // floor plane exists in Phase C.
    const grid = new THREE.GridHelper(480, 40, 0x7c4dd0, 0xd0c8e8);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);
    scene.add(new THREE.AxesHelper(24));

    // --- Lights (for panels; splats carry their own baked color) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(200, 400, 300);
    scene.add(dir);

    // --- One correctly-scaled panel, standing on the grid, facing +Z ---
    const PANEL_DEPTH = 3; // inches; nominal, panels are effectively flat
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(PANEL_SIZE_INCHES, PANEL_SIZE_INCHES, PANEL_DEPTH),
      new THREE.MeshStandardMaterial({
        color: 0x9b6fd4,
        metalness: 0.1,
        roughness: 0.6,
      })
    );
    panel.position.set(0, PANEL_SIZE_INCHES / 2, 0);
    scene.add(panel);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 40, 0);

    // --- Resize ---
    const onResize = () => {
      width = container.clientWidth;
      height = width * (9 / 16);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    sceneRef.current = { renderer, scene, camera, controls, room, panel };

    // --- Loop ---
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      sceneRef.current = null;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

return (
  <div className={styles.viewerWrap}>
    <div ref={containerRef} className={styles.viewer} />
    <CalibrationPanel
      pickedCount={pickedCount}
      isPicking={isPicking}
      distanceInput={distanceInput}
      onDistanceChange={setDistanceInput}
      onStartPicking={() => setIsPicking(true)}
      onApply={() => {}}
      onReset={() => {}}
      inchesPerUnit={inchesPerUnit}
    />
  </div>
);
}