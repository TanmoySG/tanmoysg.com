"use client";

import styles from "./page.module.css";

export default function Error() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.label}>invitation unavailable</p>
        <p className={styles.copy}>
          The brunch details could not be loaded right now. Please try again
          later.
        </p>
      </section>
    </main>
  );
}
