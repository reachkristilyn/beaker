import styles from "./landing.module.css";

const tools = [
  { href: "/research", name: "Nonprofit Lab", tag: "01" },
  { href: "/wall-designer", name: "Atomic Wall Lab", tag: "02" },
  { href: "/room-designer", name: "Space Design Lab", tag: "03" },
  { href: "/splats", name: "Robotics Lab", tag: "04" },
];




export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Tools for experiments</h1>
      <ul className={styles.list}>
        {tools.map(t => (
          <li key={t.href}>
            <a className={styles.card} href={t.href}>
              <span className={styles.toolName}>{t.name}</span>
              <span className={styles.toolTag}>{t.tag}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}