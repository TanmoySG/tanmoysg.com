import styles from "./page.module.css";

export default function Loading() {
  return (
    <main className={styles.page} aria-busy="true">
      <section className={styles.card}>
        <p className={styles.label}>loading invitation</p>
      </section>
    </main>
  );
}
