"use client";

import { useState } from "react";
import IssueActions from "./issue-actions";
import styles from "./page.module.css";

export type ControlPanelIssue = {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  user?: { login?: string };
  labels?: Array<{ name?: string }>;
  body?: string | null;
};

export default function IssueList({
  issues,
}: {
  issues: ControlPanelIssue[];
}) {
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allSelected = issues.length > 0 && selected.length === issues.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : issues.map((issue) => issue.number));
  };

  const toggleIssue = (number: number) => {
    setSelected((current) =>
      current.includes(number)
        ? current.filter((value) => value !== number)
        : [...current, number],
    );
  };

  const toggleMultiSelect = () => {
    setMultiSelectEnabled((enabled) => !enabled);
    setSelected([]);
  };

  const acknowledgeSelected = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/brunch/control-panel/issues/bulk-close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumbers: selected }),
      });

      if (!response.ok) {
        throw new Error("Could not acknowledge selected issues");
      }

      setSelected([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not acknowledge selected issues");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.bulkActions}>
        <label>
          <input type="checkbox" checked={multiSelectEnabled} onChange={toggleMultiSelect} />
          select multiple
        </label>
        {multiSelectEnabled && (
          <>
            <label>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              select all
            </label>
            <button
              className={styles.bulkButton}
              type="button"
              disabled={saving || selected.length === 0}
              onClick={() => void acknowledgeSelected()}
            >
              {saving ? "saving..." : `acknowledge selected${selected.length ? ` (${selected.length})` : ""}`}
            </button>
          </>
        )}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.issues}>
        {issues.map((issue) => (
          <article className={styles.issue} key={issue.number}>
            <div className={styles.issueHeader}>
              <label className={styles.issueSelect}>
                {multiSelectEnabled && (
                  <input
                    type="checkbox"
                    checked={selected.includes(issue.number)}
                    onChange={() => toggleIssue(issue.number)}
                  />
                )}
                <a href={issue.html_url} target="_blank" rel="noreferrer">
                  #{issue.number} {issue.title}
                </a>
              </label>
              <time className={styles.date} dateTime={issue.created_at}>
                {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(issue.created_at))}
              </time>
            </div>
            <p>{issue.body || "No details provided."}</p>
            <div className={styles.issueFooter}>
              <small className={styles.meta}>
                {issue.user?.login || "unknown"} · {issue.labels?.map((label) => label.name).filter(Boolean).join(", ") || "unlabeled"}
              </small>
              <IssueActions issueNumber={issue.number} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
