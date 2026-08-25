"use client";

import { useState } from "react";
import styles from "./layout.module.css";

export default function NavLinks() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={styles.hamburger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <nav className={`${styles.toolTag} ${open ? styles.navOpen : ""}`}>
        <a href="/research" onClick={() => setOpen(false)}>Nonprofit Lab · 01</a>
        <a href="/wall-designer" onClick={() => setOpen(false)}>Atomic Inc. Wall Lab · 02</a>
        <a href="/room-designer" onClick={() => setOpen(false)}>Space Design Lab · 03</a>
        <a href="/splats" onClick={() => setOpen(false)}>Robotics Lab · 04</a>
      </nav>
    </>
  );
}