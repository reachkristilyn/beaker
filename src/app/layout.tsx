import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Beaker · Grant Research",
  description:
    "Beaker is an AI experimentation platform. Grant Research is its first tool.",
};

function BeakerMark() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 4.5 3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.5 4.5h15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 4.5V17a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 13h12"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <header className={styles.header}>
          <span className={styles.wordmark}>
            <BeakerMark />
            Beaker
          </span>
          <nav className={styles.toolTag}>
            <a href="/">Grant Research · Tool 01</a>
            {" · "}
            <a href="/wall-designer">Wall Designer · Tool 02</a>
          </nav>
        </header>
        {children}
        <footer className={styles.footer}>
          Beaker — an AI experimentation platform
        </footer>
      </body>
    </html>
  );
}
