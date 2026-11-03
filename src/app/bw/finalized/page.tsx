import { faCircleXmark, faFlag, faListAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { getFinalizedQuizIssues } from "@/lib/quiz-issues";
import styles from "../page.module.css";
import FinalizedList from "./finalized-list";

export const dynamic = "force-dynamic";

export default async function FinalizedPage() {
  const user = await getAuthenticatedQuizUser();
  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>private quiz</p>
          <h1 className={styles.title}>sign in to view finalized</h1>
          <a className={styles.headerButton} href="/bw">open quiz</a>
        </section>
      </main>
    );
  }

  const issues = await getFinalizedQuizIssues();
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>quiz workspace · {user.name}</p>
            <h1 className={styles.title}>finalized <span className={styles.titleAccent}>questions</span></h1>
          </div>
          <div className={styles.headerActions}>
            <a className={styles.headerButton} href="/bw">
              <FontAwesomeIcon icon={faListAlt} aria-hidden="true" /> questions
            </a>
            <a className={styles.headerButton} href="/bw/finalize">
              <FontAwesomeIcon icon={faFlag} aria-hidden="true" /> finalize
            </a>
            <a className={styles.headerButton} href="/bw/logout">
              <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" /> log out
            </a>
          </div>
        </div>
        <FinalizedList issues={issues} />
      </section>
    </main>
  );
}
