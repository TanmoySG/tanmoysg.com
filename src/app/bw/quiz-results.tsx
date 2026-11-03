"use client";

import { Fragment, useState } from "react";
import { faSquareMinus, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeleteButton from "./delete-button";
import Markdown from "./markdown";
import styles from "./page.module.css";

type QuizIssue = {
  number: number;
  title: string;
  body?: string | null;
  html_url?: string;
};

function getIssueSection(body: string | null | undefined, heading: string): string {
  if (!body) return "None";
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.trim() === `### ${heading}`);
  if (start === -1) return "None";
  const content: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("### ") || line.startsWith("Submitted")) break;
    content.push(line);
  }
  return content.join("\n").trim() || "None";
}

function getSubmittedBy(body: string | null | undefined): string {
  return body?.match(/Submitted by: (.+)/)?.[1]?.trim() || "Unknown";
}

export default function QuizResults({ issues }: { issues: QuizIssue[] }) {
  const [view, setView] = useState<"table" | "card">("table");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [removing, setRemoving] = useState(false);

  const toggleExpanded = (issueNumber: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(issueNumber)) next.delete(issueNumber);
      else next.add(issueNumber);
      return next;
    });
  };

  const allSelected = issues.length > 0 && selected.size === issues.length;
  const toggleSelected = (issueNumber: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(issueNumber)) next.delete(issueNumber);
      else next.add(issueNumber);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(issues.map((issue) => issue.number)));
  };

  const removeSelected = async () => {
    if (!selected.size || !window.confirm(`Remove ${selected.size} selected questions?`)) return;
    setRemoving(true);
    const response = await fetch("/api/quiz/questions/bulk-remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueNumbers: [...selected] }),
    });
    if (response.ok) window.location.reload();
    setRemoving(false);
  };

  return (
    <>
      <div className={styles.viewSwitch} aria-label="Saved question view">
        <button className={view === "table" ? styles.activeView : ""} type="button" onClick={() => setView("table")}>table</button>
        <button className={view === "card" ? styles.activeView : ""} type="button" onClick={() => setView("card")}>cards</button>
      </div>
      {view === "table" && issues.length > 0 && (
        <div className={styles.bulkActions}>
          <label>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            select all
          </label>
          <button type="button" className={styles.bulkRemoveButton} disabled={!selected.size || removing} onClick={() => void removeSelected()}>
            {removing ? "removing..." : `remove selected (${selected.size})`}
          </button>
        </div>
      )}
      {issues.length === 0 ? <p className={styles.empty}>No questions saved yet.</p> : view === "table" ? (
        <div className={styles.tableWrap}>
          <table className={styles.responseTable}>
            <thead>
              <tr><th>Select</th><th>Q. Question</th><th>R. Resources</th><th>A. Answer</th><th>C. Clues</th><th>Submitted by</th><th>Action</th></tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const isExpanded = expanded.has(issue.number);
                return (
                  <Fragment key={issue.number}>
                    <tr>
                      <td><input type="checkbox" checked={selected.has(issue.number)} onChange={() => toggleSelected(issue.number)} aria-label={`Select ${issue.title}`} /></td>
                      <td><a href={issue.html_url} target="_blank" rel="noreferrer">{getIssueSection(issue.body, "Q. Question")}</a></td>
                      <td>{getIssueSection(issue.body, "R. Resources and References")}</td>
                      <td>{getIssueSection(issue.body, "A. Answer")}</td>
                      <td>{getIssueSection(issue.body, "C. Clues")}</td>
                      <td>{getSubmittedBy(issue.body)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.rowExpandButton}
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Hide question details" : "Show question details"}
                            onClick={() => toggleExpanded(issue.number)}
                          >
                            <FontAwesomeIcon icon={isExpanded ? faSquareMinus : faSquarePlus} />
                          </button>
                          <DeleteButton issueNumber={issue.number} />
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${issue.number}-details`}>
                        <td className={styles.expandedCell} colSpan={7}>
                          <div className={styles.expandedCard}>
                            <a href={issue.html_url} target="_blank" rel="noreferrer">{issue.title}</a>
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
      ) : (
        <div className={styles.issues}>
          {issues.map((issue) => (
            <article key={issue.number}>
              <a href={issue.html_url} target="_blank" rel="noreferrer">{issue.title}</a>
              <div className={styles.issueMarkdown}><Markdown source={issue.body ?? ""} /></div>
              <DeleteButton issueNumber={issue.number} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
