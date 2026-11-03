import { redirect } from "next/navigation";
import styles from "../page.module.css";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import IssueList from "../issue-list";
import RefreshButton from "../refresh-button";
import { getOpenIssues } from "../issues";

export const dynamic = "force-dynamic";

export default async function ResponsesPage() {
  if (!(await hasControlPanelAccess())) redirect("/brunch/control-panel");
  const issues = await getOpenIssues();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div><p className={styles.label}>brunch</p><h1>open <span>responses</span></h1></div>
          <div className={styles.headerActions}><RefreshButton /><a href="/brunch/control-panel">home</a></div>
        </div>
        <p className={styles.disclaimer}>Responses are saved as GitHub issues.</p>
        <p className={styles.count}>{issues.length} open {issues.length === 1 ? "response" : "responses"}</p>
        {issues.length === 0 ? <p className={styles.empty}>No open responses yet.</p> : <IssueList issues={issues} />}
      </section>
    </main>
  );
}
