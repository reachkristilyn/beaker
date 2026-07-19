import WallDesigner from "@/components/wall-designer/WallDesigner";
import styles from "./page.module.css";

export const metadata = {
  title: "Wall Designer",
};

export default function WallDesignerPage() {
  return (
    <main className={styles.main}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Tool 02</p>
        <h1 className={styles.title}>Modular Wall Designer</h1>
        <p className={styles.lede}>
          Size a wall, place panels, and preview the layout.
        </p>
      </div>
      <WallDesigner />
    </main>
  );
}