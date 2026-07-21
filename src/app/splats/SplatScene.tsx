"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import styles from "./page.module.css";

// Placeholder splat: a hosted sample OBJECT (not an environment).
// Swap this URL for a room/scene splat when you have one — nothing else changes.
const SPLAT_URL = "https://sparkjs.dev/assets/splats/butterfly.spz";

export default function SplatScene() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    // --- Scene & camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
    camera.position.set(0, 2.5, 6);

    // Spark's renderer must be added to the scene to draw splats.
    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    // --- Splat ---
    const splat = new SplatMesh({ url: SPLAT_URL });
    // Splats commonly import flipped; this quaternion rotates 180° on X.
    // If yours looks upside-down or sideways, adjust here.
    splat.quaternion.set(1, 0, 0, 0);
    splat.position.set(0, 0, 0);
    scene.add(splat);

    // --- Lights (for the robot mesh; splats carry their own baked color) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    // --- Robot (simple placeholder mesh) ---
    const robot = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3a7afe, metalness: 0.2, roughness: 0.5 })
    );
    body.position.y = 0.2;
    const sensor = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xff5a3a, metalness: 0.1, roughness: 0.4 })
    );
    // Front of the robot is -Z (matches lookAt below), so the sensor leads.
    sensor.position.set(0, 0.45, -0.2);
    robot.add(body, sensor);
    scene.add(robot);

    // --- Navigation path (a smooth closed loop the robot patrols) ---
    const path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-2, 0, -2),
        new THREE.Vector3(2, 0, -2),
        new THREE.Vector3(2.5, 0, 1),
        new THREE.Vector3(0, 0, 2.5),
        new THREE.Vector3(-2.5, 0, 1),
      ],
      true
    );

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, 0);

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

    // --- Animation loop ---
    const clock = new THREE.Clock();
    const lookTarget = new THREE.Vector3();

    renderer.setAnimationLoop(() => {
      const t = (clock.getElapsedTime() * 0.05) % 1; // ~20s per lap
      const point = path.getPointAt(t);
      robot.position.copy(point);

      // Face direction of travel, kept level (no pitch/roll).
      const tangent = path.getTangentAt(t);
      lookTarget.copy(point).add(tangent);
      robot.lookAt(lookTarget.x, robot.position.y, lookTarget.z);

      controls.update();
      renderer.render(scene, camera);
    });

    // --- Cleanup (also handles React StrictMode's double-mount in dev) ---
    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={styles.viewer} />;
}