import styles from "./page.module.css";
import { hasControlPanelAccess } from "@/lib/control-panel-access";

export const dynamic = "force-dynamic";

export default async function ControlPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!(await hasControlPanelAccess())) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>brunch control panel</p>
          <h1>brunch <span>responses</span></h1>
          <form className={styles.loginForm} action="/brunch/control-panel/login" method="post">
            <label htmlFor="control-panel-secret">panel secret</label>
            <input id="control-panel-secret" name="secret" type="password" required autoComplete="current-password" />
            {error === "invalid-secret" && <p className={styles.error}>That secret is not valid.</p>}
            <button className={styles.button} type="submit">open panel ↗</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>brunch</p>
            <h1>control <span>panel</span></h1>
          </div>
          <div className={styles.headerActions}>
            <a href="/brunch/control-panel/logout">log out</a>
          </div>
        </div>
        <p className={styles.disclaimer}>Choose an area to manage the brunch invitation.</p>
        <nav className={styles.panelNav} aria-label="Control panel sections">
          <a className={styles.panelNavCard} href="/brunch/control-panel/responses">
            <strong>responses</strong>
            <span>Review and acknowledge GitHub responses.</span>
          </a>
          <a className={styles.panelNavCard} href="/brunch/control-panel/invitees">
            <strong>invitees</strong>
            <span>Add or remove people and access codes.</span>
          </a>
          <a className={styles.panelNavCard} href="/brunch/control-panel/questions">
            <strong>questions</strong>
            <span>Manage the preference form questions.</span>
          </a>
        </nav>
      </section>
    </main>
  );
}
