import styles from "./landing.module.css";

const tools = [
  {
    href: "/research",
    name: "Nonprofit Lab",
    tag: "Tool 01",
    blurb: "Grant research and funder matching for nonprofits.",
  },
  {
    href: "/wall-designer",
    name: "Atomic Inc. Wall Lab",
    tag: "Tool 02",
    blurb: "Lay out modular wall panels against a venue photograph.",
  },
  {
    href: "/room-designer",
    name: "Space Design Lab",
    tag: "Tool 03",
    blurb: "Plan a room in three dimensions before anything gets built.",
  },
  {
    href: "/splats",
    name: "Robotics Lab",
    tag: "Tool 04",
    blurb: "View and inspect Gaussian splat captures.",
  },
  {
    href: "/nfl-fun",
    name: "NFL Fun Lab",
    tag: "Tool 05",
    blurb: "Track favorite players and build single game lineups.",
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Tools</h1>
      <ul className={styles.list}>
        {tools.map((t) => (
          <li key={t.href}>
            <a className={styles.card} href={t.href}>
              <span className={styles.cardText}>
                <span className={styles.toolName}>{t.name}</span>
                <span className={styles.toolBlurb}>{t.blurb}</span>
              </span>
              <span className={styles.toolTag}>{t.tag}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
