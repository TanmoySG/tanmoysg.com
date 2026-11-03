import type { ControlPanelIssue } from "./issue-list";

type GitHubIssue = ControlPanelIssue & { pull_request?: unknown };

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function getOpenIssues(): Promise<GitHubIssue[]> {
  const owner = required("GITHUB_CONTENT_OWNER");
  const repository = required("GITHUB_CONTENT_REPO");
  const token = required("GITHUB_RESPONSES_TOKEN");
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/issues?state=open&labels=brunch-response&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) throw new Error(`GitHub issues request failed (${response.status})`);
  const issues = (await response.json()) as unknown;
  return Array.isArray(issues)
    ? issues.filter((issue): issue is GitHubIssue => (
        typeof issue === "object" &&
        issue !== null &&
        "number" in issue &&
        "title" in issue &&
        !("pull_request" in issue)
      ))
    : [];
}
