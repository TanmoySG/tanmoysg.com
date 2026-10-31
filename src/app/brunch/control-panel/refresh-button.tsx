"use client";

import styles from "./page.module.css";

export default function RefreshButton() {
  return (
    <button className={styles.refreshButton} type="button" onClick={() => window.location.reload()}>
      refresh
    </button>
  );
}
