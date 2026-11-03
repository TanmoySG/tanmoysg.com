import { faSquareMinus, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight } from "@fortawesome/free-regular-svg-icons";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { getQuizIssues } from "@/lib/quiz-issues";
import QuizForm from "./quiz-form";
import QuizResults from "./quiz-results";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getAuthenticatedQuizUser();
  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>private quiz</p>
          <h1 className={styles.title}>quiz <span className={styles.titleAccent}>questions</span></h1>
          <form className={styles.loginForm} action="/bw/login" method="post">
            <label htmlFor="quiz-access-code">four digit access code</label>
            <input id="quiz-access-code" name="accessCode" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required />
            {error === "invalid-code" && <p>That code is not valid.</p>}
            <button className={styles.button} type="submit">
              open quiz <FontAwesomeIcon icon={faArrowAltCircleRight} aria-hidden="true" />
            </button>
          </form>
        </section>
      </main>
    );
  }

  const issues = await getQuizIssues();
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div><p className={styles.label}>quiz workspace · {user.name}</p><h1 className={styles.title}>quiz <span className={styles.titleAccent}>questions</span></h1></div>
          <div className={styles.headerActions}>
            <a className={styles.headerButton} href="/bw">refresh</a>
            <a className={styles.headerButton} href="/bw/logout">log out</a>
          </div>
        </div>
        <div className={styles.panels}>
          <details className={styles.panel} open>
            <summary className={styles.panelLabel}>
              submit question
              <span className={styles.summaryIcon} aria-hidden="true">
                <FontAwesomeIcon className={styles.summaryPlus} icon={faSquarePlus} />
                <FontAwesomeIcon className={styles.summaryMinus} icon={faSquareMinus} />
              </span>
            </summary>
            <QuizForm />
          </details>
          <details className={styles.panel} open>
            <summary className={styles.panelLabel}>
              saved questions ({issues.length})
              <span className={styles.summaryIcon} aria-hidden="true">
                <FontAwesomeIcon className={styles.summaryPlus} icon={faSquarePlus} />
                <FontAwesomeIcon className={styles.summaryMinus} icon={faSquareMinus} />
              </span>
            </summary>
            <QuizResults issues={issues} />
          </details>
        </div>
      </section>
    </main>
  );
}
