import WallDesigner from "@/components/wall-designer/WallDesigner";
import styles from "./page.module.css";

export const metadata = {
  title: "ATOMIC Design Inc. Wall Designer",
};

export default function WallDesignerPage() {
  return (
    <main className={styles.main}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Tool 02</p>
        <h1 className={styles.title}>ATOMIC Modular Designer</h1>
        <p className={styles.lede}>
         Pick your venue, size a wall, place panels, and preview the layout using{" "}
        <a href="https://www.atomicdesign.tv" target="_blank" rel="noopener noreferrer">
         Atomic Design Inc.
        </a>{" "}
         product.
        </p>
      </div>
      <WallDesigner />
    </main>
  );
}