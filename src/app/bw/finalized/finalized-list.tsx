"use client";

import { faSquareMinus, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment, useState } from "react";
import Markdown from "../markdown";
import styles from "../page.module.css";

type Issue = {
  number: number;
  title: string;
  body?: string | null;
  html_url?: string;
  finalization: {
    proposedRound: string;
    theme: string;
    notes: string;
    finalizedBy: string;
    finalizedAt: string;
    commentBody: string;
  };
};

export default function FinalizedList({ issues }: { issues: Issue[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(issueNumber: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(issueNumber)) next.delete(issueNumber);
      else next.add(issueNumber);
      return next;
    });
  }

  if (!issues.length) return <p className={styles.empty}>No finalized questions yet.</p>;

  return (
    <div className={styles.finalizeList}>
      <div className={styles.finalizeTableWrap}>
        <table className={styles.responseTable}>
          <thead>
            <tr>
              <th>Question</th><th>Round</th><th>Theme</th><th>Notes</th>
              <th>Finalized by</th><th>Finalized</th><th>Details</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => {
              const isExpanded = expanded.has(issue.number);
              return (
                <Fragment key={issue.number}>
                  <tr>
                    <td><a href={issue.html_url} target="_blank" rel="noreferrer">{issue.title}</a></td>
                    <td>{issue.finalization.proposedRound}</td>
                    <td>{issue.finalization.theme}</td>
                    <td>{issue.finalization.notes}</td>
                    <td>{issue.finalization.finalizedBy}</td>
                    <td>{new Date(issue.finalization.finalizedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className={styles.rowExpandButton}
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Hide finalized question details" : "Show finalized question details"}
                        onClick={() => toggle(issue.number)}
                      >
                        <FontAwesomeIcon icon={isExpanded ? faSquareMinus : faSquarePlus} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td className={styles.expandedCell} colSpan={7}>
                        <div className={styles.expandedCard}>
                          <div className={styles.issueMarkdown}><Markdown source={issue.body ?? ""} /></div>
                          <div className={styles.issueMarkdown}>
                            <Markdown source={issue.finalization.commentBody} />
                          </div>
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
    </div>
  );
}
