"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export default function IssueActions({ issueNumber }: { issueNumber: number }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);

  const acknowledge = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/brunch/control-panel/issues/${issueNumber}/close`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Could not acknowledge issue");
      }
      setAcknowledged(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={acknowledge}>
      <button className={styles.closeButton} type="submit" disabled={saving || acknowledged}>
        {acknowledged ? "Saved, refresh data" : saving ? "saving..." : "acknowledge"}
      </button>
    </form>
  );
}
