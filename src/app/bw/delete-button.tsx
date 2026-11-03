"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import styles from "./page.module.css";

export default function DeleteButton({ issueNumber }: { issueNumber: number }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    if (!window.confirm("Delete this quiz question?")) return;
    setDeleting(true);
    setError("");
    const response = await fetch(`/api/quiz/questions/${issueNumber}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result && typeof result.error === "string" ? result.error : "Could not delete quiz question");
      setDeleting(false);
      return;
    }
    window.location.reload();
  };

  return (
    <div className={styles.deleteAction}>
      <button className={styles.deleteButton} type="button" disabled={deleting} onClick={() => void remove()}>
        <span aria-hidden="true">
          {deleting ? "…" : <FontAwesomeIcon icon={faTrashCan} />}
        </span>
        <span className={styles.srOnly}>{deleting ? "Removing" : "Delete"}</span>
      </button>
      {error && <span className={styles.deleteError} role="alert">{error}</span>}
    </div>
  );
}
