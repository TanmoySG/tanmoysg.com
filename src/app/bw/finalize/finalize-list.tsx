"use client";

import { faSquareMinus, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useState } from "react";
import Markdown from "../markdown";
import styles from "../page.module.css";

type Issue = { number: number; title: string; body?: string | null; html_url?: string };
type Details = { proposedRound: string; theme: string; notes: string };

function questionBody(body?: string | null): string {
  const match = body?.match(/### Q\. Question\s+([\s\S]*?)(?=\n### |\nSubmitted by:|$)/);
  return match?.[1]?.trim() || "Question details unavailable";
}

export default function FinalizeList({ issues, rounds }: { issues: Issue[]; rounds: string[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [details, setDetails] = useState<Record<number, Details>>({});
  const [expandedTable, setExpandedTable] = useState<Set<number>>(new Set());
  const [expandedSelected, setExpandedSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allSelected = issues.length > 0 && selected.size === issues.length;

  function toggle(issue: Issue) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(issue.number)) {
        next.delete(issue.number);
      } else {
        next.add(issue.number);
        setDetails((values) => ({
          ...values,
          [issue.number]: values[issue.number] ?? { proposedRound: "", theme: "", notes: "" },
        }));
      }
      return next;
    });
  }

  function updateDetails(issueNumber: number, field: keyof Details, value: string) {
    setDetails((current) => ({
      ...current,
      [issueNumber]: { ...current[issueNumber], [field]: value },
    }));
  }

  function toggleExpanded(
    issueNumber: number,
    setExpanded: (value: Set<number>) => void,
    expanded: Set<number>,
  ) {
    const next = new Set(expanded);
    if (next.has(issueNumber)) next.delete(issueNumber);
    else next.add(issueNumber);
    setExpanded(next);
  }

  async function saveFinalizations() {
    setSaving(true);
    setError("");
    const finalizations = [...selected].map((issueNumber) => ({
      issueNumber,
      ...details[issueNumber],
    }));
    const response = await fetch("/api/quiz/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finalizations }),
    });
    if (response.ok) {
      window.location.reload();
      return;
    }
    const result = await response.json().catch(() => null);
    setError(typeof result?.error === "string" ? result.error : "Could not finalize questions");
    setSaving(false);
  }

  if (!issues.length) return <p className={styles.empty}>No questions are waiting for finalization.</p>;

  const selectedIssues = issues.filter((issue) => selected.has(issue.number));

  return (
    <div className={styles.finalizeList}>
      <div className={styles.finalizeTableWrap}>
        <table className={styles.responseTable}>
          <thead>
            <tr><th>Select</th><th>Question</th><th>Submitted question</th><th>Details</th></tr>
          </thead>
          <tbody>
            {issues.map((issue) => {
              const isExpanded = expandedTable.has(issue.number);
              return (
                <Fragment key={`table-${issue.number}`}>
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(issue.number)}
                        onChange={() => toggle(issue)}
                        aria-label={`Select ${issue.title}`}
                      />
                    </td>
                    <td><a href={issue.html_url} target="_blank" rel="noreferrer">{issue.title}</a></td>
                    <td>{questionBody(issue.body)}</td>
                    <td>
                      <button
                        className={styles.rowExpandButton}
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Hide question details" : "Show question details"}
                        onClick={() => toggleExpanded(issue.number, setExpandedTable, expandedTable)}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faSquareMinus : faSquarePlus} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${issue.number}-table-details`}>
                      <td className={styles.expandedCell} colSpan={4}>
                        <div className={styles.expandedCard}>
                          <div className={styles.issueMarkdown}><Markdown source={issue.body ?? ""} /></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <label className={styles.selectAllFinalize}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => {
            if (allSelected) {
              setSelected(new Set());
            } else {
              setSelected(new Set(issues.map((issue) => issue.number)));
              setDetails((values) => Object.fromEntries(
                issues.map((issue) => [
                  issue.number,
                  values[issue.number] ?? { proposedRound: "", theme: "", notes: "" },
                ]),
              ));
            }
          }}
        />
        select all questions
      </label>

      {selectedIssues.length > 0 && (
        <section className={styles.selectedFinalize}>
          <h2>questions to finalize ({selectedIssues.length})</h2>
          {selectedIssues.map((issue) => (
            <article className={styles.finalizeItem} key={`selected-${issue.number}`}>
              <div className={styles.finalizeItemHeader}>
                <a href={issue.html_url} target="_blank" rel="noreferrer">{issue.title}</a>
                <button
                  className={styles.rowExpandButton}
                  type="button"
                  aria-expanded={expandedSelected.has(issue.number)}
                  aria-label={expandedSelected.has(issue.number) ? "Hide question details" : "Show question details"}
                  onClick={() => toggleExpanded(issue.number, setExpandedSelected, expandedSelected)}
                >
                  <FontAwesomeIcon icon={expandedSelected.has(issue.number) ? faSquareMinus : faSquarePlus} />
                </button>
              </div>
              <p>{questionBody(issue.body)}</p>
              {expandedSelected.has(issue.number) && (
                <div className={styles.expandedCard}>
                  <div className={styles.issueMarkdown}><Markdown source={issue.body ?? ""} /></div>
                </div>
              )}
              <div className={styles.finalizeForm}>
                <label>
                  Proposed round
                  <select
                    value={details[issue.number]?.proposedRound ?? ""}
                    onChange={(event) => updateDetails(issue.number, "proposedRound", event.target.value)}
                    required
                  >
                    <option value="">Select a round</option>
                    {rounds.map((round) => <option key={round} value={round}>{round}</option>)}
                  </select>
                </label>
                <label>
                  Theme
                  <input
                    value={details[issue.number]?.theme ?? ""}
                    onChange={(event) => updateDetails(issue.number, "theme", event.target.value)}
                    maxLength={200}
                    required
                  />
                </label>
                <label>
                  Notes
                  <textarea
                    value={details[issue.number]?.notes ?? ""}
                    onChange={(event) => updateDetails(issue.number, "notes", event.target.value)}
                    maxLength={5000}
                  />
                </label>
              </div>
            </article>
          ))}
          <button className={styles.button} type="button" disabled={saving} onClick={() => void saveFinalizations()}>
            {saving ? "finalizing..." : `finalize selected (${selectedIssues.length})`}
          </button>
        </section>
      )}
      {error && <p className={styles.formError} role="alert">{error}</p>}
    </div>
  );
}
