import { redirect } from "next/navigation";
import styles from "./page.module.css";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import IssueList, { type ControlPanelIssue } from "./issue-list";
import RefreshButton from "./refresh-button";

export const dynamic = "force-dynamic";

type GitHubIssue = ControlPanelIssue & { pull_request?: unknown };

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function getOpenIssues(): Promise<GitHubIssue[]> {
  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const token = getRequiredEnvironmentVariable("GITHUB_RESPONSES_TOKEN");
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/issues?state=open&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub issues request failed (${response.status})`);
  }

  const issues = (await response.json()) as unknown;
  return Array.isArray(issues) ? issues.filter((issue): issue is GitHubIssue => {
    return typeof issue === "object" && issue !== null && "number" in issue && "title" in issue && !("pull_request" in issue);
  }) : [];
}

export default async function ControlPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; refresh?: string }>;
}) {
  const { error } = await searchParams;

  if (!(await hasControlPanelAccess())) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>private control panel</p>
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

  const issues = await getOpenIssues();
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>private control panel</p>
            <h1>open <span>responses</span></h1>
          </div>
          <div className={styles.headerActions}>
            <RefreshButton />
            <a href="/brunch/control-panel/logout">log out</a>
          </div>
        </div>
        <p className={styles.disclaimer}>
          Responses are saved as GitHub issues. Use refresh to load the latest data.
        </p>
        <p className={styles.count}>{issues.length} open {issues.length === 1 ? "response" : "responses"}</p>
        {issues.length === 0 ? (
          <p className={styles.empty}>No open responses yet.</p>
        ) : (
          <IssueList issues={issues} />
        )}
      </section>
    </main>
  );
}
