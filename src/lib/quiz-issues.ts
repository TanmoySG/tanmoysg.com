import "server-only";

export const quizLabel = "quiz-question";

type GitHubIssue = {
  number: number;
  title: string;
  body?: string | null;
  html_url?: string;
  labels?: Array<{ name?: string }>;
  pull_request?: unknown;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function token(): string {
  return process.env.GITHUB_RESPONSES_TOKEN ?? required("GITHUB_CONTENT_TOKEN");
}

function repositoryUrl(path = "issues"): string {
  return `https://api.github.com/repos/${encodeURIComponent(required("GITHUB_CONTENT_OWNER"))}/${encodeURIComponent(required("GITHUB_CONTENT_REPO"))}/${path}`;
}

function headers(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getQuizIssues(): Promise<GitHubIssue[]> {
  const response = await fetch(`${repositoryUrl()}?state=open&labels=${encodeURIComponent(quizLabel)}&per_page=100`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Quiz issues request failed (${response.status})`);
  const issues = (await response.json()) as unknown;
  return Array.isArray(issues)
    ? issues.filter((issue): issue is GitHubIssue => (
        typeof issue === "object" && issue !== null &&
        "number" in issue && "title" in issue && !("pull_request" in issue)
      ))
    : [];
}

export async function createQuizIssue(
  question: {
    question: string;
    resources: string;
    answer: string;
    clues: string;
  },
  submittedBy: string,
) {
  const response = await fetch(repositoryUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      title: `Quiz question — ${question.question.slice(0, 80)}`,
      body: [
        "## Quiz question",
        "",
        `### Q. Question\n${question.question}`,
        `### R. Resources and References\n${question.resources || "None"}`,
        `### A. Answer\n${question.answer}`,
        `### C. Clues\n${question.clues || "None"}`,
        `Submitted by: ${submittedBy}`,
        "",
        `Submitted: ${new Date().toISOString()}`,
      ].join("\n\n"),
      labels: [quizLabel],
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    console.error("Could not create quiz issue", { status: response.status, body: message });
    throw new Error("Could not save quiz question");
  }
}

export async function closeQuizIssue(issueNumber: number) {
  const response = await fetch(repositoryUrl(`issues/${issueNumber}`), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ state: "closed" }),
  });
  if (!response.ok) {
    const message = await response.text();
    console.error("Could not close quiz issue", { status: response.status, body: message });
    throw new Error("Could not remove quiz question");
  }
}

export async function closeQuizIssues(issueNumbers: number[]) {
  for (const issueNumber of issueNumbers) {
    await closeQuizIssue(issueNumber);
  }
}
