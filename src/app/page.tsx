"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ResearchForm from "@/components/ResearchForm";
import ResearchResults from "@/components/ResearchResults";
import type { ResearchReport } from "@/lib/types";

type Status = "idle" | "loading" | "error" | "success";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOrg, setActiveOrg] = useState<string>("");

  async function runResearch(orgName: string, website: string) {
    setStatus("loading");
    setErrorMessage(null);
    setActiveOrg(orgName);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          website: website.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data?.error?.message ?? "Research failed for an unknown reason."
        );
        setStatus("error");
        return;
      }

      setReport(data as ResearchReport);
      setStatus("success");
    } catch {
      setErrorMessage(
        "Could not reach the research service. Check your connection and try again."
      );
      setStatus("error");
    }
  }

  return (
    <main className={styles.main}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Grant research</p>
        <h1 className={styles.title}>Research a nonprofit</h1>
        <p className={styles.lede}>
          Enter an organization to generate a structured research brief:
          mission, leadership, financials, current funders, and where new
          grants might fit.
        </p>
      </section>

      <ResearchForm onSubmit={runResearch} busy={status === "loading"} />

      {status === "loading" && (
        <div className={styles.statusStrip} role="status" aria-live="polite">
          <span className={styles.statusText}>
            Researching {activeOrg}…
          </span>
          <span className={styles.statusBar} aria-hidden="true" />
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className={styles.errorBox} role="alert">
          <p className={styles.errorLabel}>Research failed</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {status === "success" && report && <ResearchResults report={report} />}
    </main>
  );
}
