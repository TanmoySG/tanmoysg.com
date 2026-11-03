import { redirect } from "next/navigation";
import styles from "../page.module.css";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import { getBrunchContent } from "@/lib/github-content";
import QuestionManager from "../question-manager";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  if (!(await hasControlPanelAccess())) redirect("/brunch/control-panel");
  const brunch = await getBrunchContent();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div><p className={styles.label}>brunch</p><h1>manage <span>questions</span></h1></div>
          <a href="/brunch/control-panel">home</a>
        </div>
        <QuestionManager initialQuestions={brunch.preferences.questions} />
      </section>
    </main>
  );
}
