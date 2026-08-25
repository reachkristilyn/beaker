import styles from "./page.module.css";
import RoomViewer from "./RoomViewer";

export default function RoomDesignerPage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Space Designer · Tool 03</p>
        <h1 className={styles.title}>Design in a Captured Space</h1>
        <p className={styles.lede}>
          Place and arrange objects inside a real 3D Gaussian splat 
          of any environment. Calibrate real-world scale, then lay 
          out and position elements directly in the captured space.
        </p>
      </section>
      <RoomViewer />
    </main>
  );
}