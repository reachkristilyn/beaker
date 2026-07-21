import styles from "./page.module.css";
import SplatViewer from "./SplatViewer";

export default function SplatsPage() {
  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Robotics Lab · Tool 03</p>
        <h1 className={styles.title}>Gaussian Splat Robotics</h1>
        <p className={styles.lede}>
          A live 3D Gaussian splat scene with a robot traversing it — a scaffold
          for exploring splat-based scene representations for robot perception
          and navigation.
        </p>
      </section>
      <SplatViewer />
    </main>
  );
}