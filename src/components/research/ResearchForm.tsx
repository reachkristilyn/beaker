"use client";

import { useState, type FormEvent } from "react";
import styles from "./ResearchForm.module.css";

interface ResearchFormProps {
  onSubmit: (orgName: string, website: string) => void;
  busy: boolean;
}

export default function ResearchForm({ onSubmit, busy }: ResearchFormProps) {
  const [orgName, setOrgName] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const trimmed = orgName.trim();
    if (!trimmed) {
      setFieldError("Enter an organization name to research.");
      return;
    }

    setFieldError(null);
    onSubmit(trimmed, website);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="orgName">
          Organization name
        </label>
        <input
          id="orgName"
          className={styles.input}
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Fast Feet NYC"
          disabled={busy}
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? "orgName-error" : undefined}
          autoComplete="organization"
        />
        {fieldError && (
          <p id="orgName-error" className={styles.fieldError}>
            {fieldError}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="website">
          Website <span className={styles.optional}>optional</span>
        </label>
        <input
          id="website"
          className={styles.input}
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.org"
          disabled={busy}
          autoComplete="url"
        />
      </div>

      <button className={styles.button} type="submit" disabled={busy}>
        {busy ? "Researching…" : "Run research"}
      </button>
    </form>
  );
}
