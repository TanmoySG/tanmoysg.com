import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { finalizedQuizLabel, getQuizIssues } from "@/lib/quiz-issues";
import { getQuizRoundsContent } from "@/lib/github-content";
import styles from "../page.module.css";
import FinalizeList from "./finalize-list";

export const dynamic = "force-dynamic";

export default async function FinalizePage() {
  const user = await getAuthenticatedQuizUser();
  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>private quiz</p>
          <h1 className={styles.title}>sign in to finalize</h1>
          <a className={styles.headerButton} href="/bw">open quiz</a>
        </section>
      </main>
    );
  }

  const [issuesResult, roundsResult] = await Promise.all([getQuizIssues(), getQuizRoundsContent()]);
  const issues = issuesResult.filter(
    (issue) => !issue.labels?.some((label) => label.name === finalizedQuizLabel),
  );

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>quiz workspace · {user.name}</p>
            <h1 className={styles.title}>finalize <span className={styles.titleAccent}>questions</span></h1>
          </div>
          <div className={styles.headerActions}>
            <a className={styles.headerButton} href="/bw">questions</a>
            <a className={styles.headerButton} href="/bw/finalized">finalized</a>
            <a className={styles.headerButton} href="/bw/logout">log out</a>
          </div>
        </div>
        <FinalizeList issues={issues} rounds={roundsResult.rounds} />
      </section>
    </main>
  );
}
