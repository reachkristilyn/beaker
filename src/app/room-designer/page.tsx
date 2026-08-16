import styles from "./page.module.css";
import RoomViewer from "./RoomViewer";

export default function RoomDesignerPage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Room Designer · Tool 03</p>
        <h1 className={styles.title}>Design in a Captured Room</h1>
        <p className={styles.lede}>
          Place modular LED panels inside a real 3D Gaussian splat of a venue.
          Calibrate scale, define floor and wall planes, and lay out product
          groups in the actual space.
        </p>
      </section>
      <RoomViewer />
    </main>
  );
}