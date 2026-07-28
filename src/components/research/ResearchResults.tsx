import styles from "./ResearchResults.module.css";
import type { Confidence, ResearchReport } from "@/lib/types";

interface ResearchResultsProps {
  report: ResearchReport;
}

const confidenceLabel: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

function formatDeadline(iso: string) {
  // iso is "YYYY-MM-DD"; the "T00:00:00" forces local time so the date
  // doesn't display a day early in US timezones.
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className={styles.sectionLabel}>{children}</h3>;
}

export default function ResearchResults({ report }: ResearchResultsProps) {
  const generated = new Date(report.generatedAt);

  return (
    <article className={styles.report} aria-label={`Research report: ${report.orgName}`}>
      <header className={styles.reportHeader}>
        <h2 className={styles.orgName}>{report.orgName}</h2>
        <p className={styles.meta}>
          {report.website && (
            <>
              <a href={report.website} target="_blank" rel="noopener noreferrer">
                {report.website}
              </a>
              {" · "}
            </>
          )}
          Generated{" "}
          {generated.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      <section className={styles.section}>
        <SectionLabel>Executive summary</SectionLabel>
        <p>{report.executiveSummary}</p>
      </section>

      {(report.mission || report.programs.length > 0) && (
        <section className={styles.section}>
          <SectionLabel>Mission &amp; programs</SectionLabel>
          {report.mission && <p>{report.mission}</p>}
          {report.programs.length > 0 && (
            <ul className={styles.list}>
              {report.programs.map((program) => (
                <li key={program}>{program}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {report.leadership.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Leadership</SectionLabel>
          <ul className={styles.plainList}>
            {report.leadership.map((person) => (
              <li key={`${person.name}-${person.role}`} className={styles.person}>
                <span className={styles.personName}>{person.name}</span>
                <span className={styles.personRole}>{person.role}</span>
                {person.note && <span className={styles.personNote}>{person.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.financialSnapshot.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Financial snapshot</SectionLabel>
          <dl className={styles.financials}>
            {report.financialSnapshot.map((line) => (
              <div key={line.label} className={styles.financialLine}>
                <dt className={styles.financialLabel}>{line.label}</dt>
                <dd className={styles.financialValue}>
                  {line.value}
                  {line.note && <span className={styles.financialNote}> — {line.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {report.existingFunders.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Existing funders</SectionLabel>
          <ul className={styles.list}>
            {report.existingFunders.map((funder) => (
              <li key={funder}>{funder}</li>
            ))}
          </ul>
        </section>
      )}

{report.federalGrants.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Federal grants · Grants.gov</SectionLabel>
          <ul className={styles.plainList}>
            {report.federalGrants.map((grant) => (
              <li key={grant.sourceUrl} className={styles.fit}>
                <span className={styles.fitFunder}>
                  <a href={grant.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {grant.grantName}
                  </a>
                </span>
                <span className={styles.fitMeta}>
                  {grant.agency}
                  {grant.deadline
                    ? ` · Deadline ${formatDeadline(grant.deadline)}`
                    : " · No deadline listed"}
                  {grant.number && ` · ${grant.number}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.webGrants.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Other grants · web-sourced</SectionLabel>
          <p className={styles.disclaimer}>
            Found via web search and not independently verified. Confirm each
            deadline and eligibility at the source before relying on it.
          </p>
          <ul className={styles.plainList}>
            {report.webGrants.map((grant, i) => (
              <li key={`${grant.sourceUrl}-${i}`} className={styles.fit}>
                <span className={styles.fitFunder}>
                  <a href={grant.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {grant.grantName}
                  </a>
                  <span className={styles.fitProgram}> · {grant.funder}</span>
                </span>
                <span className={styles.fitRationale}>{grant.rationale}</span>
                <span className={styles.fitMeta}>
                  {grant.deadlineText
                    ? `Deadline (as listed): ${grant.deadlineText}`
                    : "Deadline not stated — verify at source"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.introCallQuestions.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Questions for an intro call</SectionLabel>
          <ol className={styles.list}>
            {report.introCallQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>
      )}

      {report.verificationNotes.length > 0 && (
        <section className={styles.section}>
          <SectionLabel>Confidence &amp; verification notes</SectionLabel>
          <ul className={styles.plainList}>
            {report.verificationNotes.map((note) => (
              <li key={note.note} className={styles.verification}>
                <span
                  className={`${styles.chip} ${styles[note.confidence]}`}
                >
                  {confidenceLabel[note.confidence]}
                </span>
                <span>{note.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
