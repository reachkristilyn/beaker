import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Image from "next/image";

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
  metadataBase: new URL("https://beakerresearch.org"),
  title: "Beaker",
  description:
    "Beaker is an AI experimentation and research platform.",
  openGraph: {
    title: "Beaker",
    description:
      "Beaker is an AI experimentation and research platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <header className={styles.header}>
        <a href="/" className={styles.wordmark}>
        <Image
         src="/beaker-mark.png"
         alt=""
         width={36}
         height={36}
         className={styles.mark}
         priority
        />
            Beaker
          </a>
          <nav className={styles.toolTag}>
            <a href="/research">Grant Research · Tool 01</a>
            {" · "}
            <a href="/wall-designer">Wall Designer · Tool 02</a>
            {" · "}
            <a href="/splats">Robotics Lab · Tool 03</a> 
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
