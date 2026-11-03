import "server-only";

export const quizLabel = "quiz-question";
export const finalizedQuizLabel = "finalized";

type GitHubIssue = {
  number: number;
  title: string;
  body?: string | null;
  html_url?: string;
  labels?: Array<{ name?: string }>;
  pull_request?: unknown;
};

export type FinalizationDetails = {
  proposedRound: string;
  theme: string;
  notes: string;
  finalizedBy: string;
  finalizedAt: string;
  commentBody: string;
};

export type FinalizedQuizIssue = GitHubIssue & {
  finalization: FinalizationDetails;
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

function additionalQuizLabel(): string | undefined {
  const label = process.env.QUIZ_ISSUE_ADDITIONAL_TAG?.trim();
  return label || undefined;
}

function quizLabels(): string[] {
  return [quizLabel, additionalQuizLabel()].filter((label): label is string => Boolean(label));
}

export async function getQuizIssues(): Promise<GitHubIssue[]> {
  const response = await fetch(`${repositoryUrl()}?state=open&labels=${encodeURIComponent(quizLabels().join(","))}&per_page=100`, {
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

export async function getFinalizedQuizIssues(): Promise<FinalizedQuizIssue[]> {
  const labels = [...quizLabels(), finalizedQuizLabel];
  const response = await fetch(`${repositoryUrl()}?state=all&labels=${encodeURIComponent(labels.join(","))}&per_page=100`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Finalized quiz issues request failed (${response.status})`);
  const issues = (await response.json()) as unknown;
  const finalizedIssues = Array.isArray(issues)
    ? issues.filter((issue): issue is GitHubIssue => (
        typeof issue === "object" && issue !== null &&
        "number" in issue && "title" in issue && !("pull_request" in issue)
      ))
    : [];
  return Promise.all(finalizedIssues.map(async (issue): Promise<FinalizedQuizIssue> => {
    const commentsResponse = await fetch(repositoryUrl(`issues/${issue.number}/comments?per_page=100`), {
      headers: headers(),
      cache: "no-store",
    });
    if (!commentsResponse.ok) {
      throw new Error(`Finalized quiz comments request failed (${commentsResponse.status})`);
    }
    const comments = (await commentsResponse.json()) as Array<{
      body?: string | null;
      created_at?: string;
    }>;
    const comment = comments.find((entry) => entry.body?.includes("## Quiz question finalized"));
    if (!comment?.body) {
      throw new Error(`Finalization details are missing for quiz issue ${issue.number}`);
    }
    const match = comment.body.match(
      /- \*\*Proposed round:\*\* (.+)\n- \*\*Theme:\*\* (.+)\n- \*\*Notes:\*\* ([\s\S]*?)\n\nFinalized by: (.+)\nFinalized: (.+)/,
    );
    if (!match) {
      throw new Error(`Finalization details are invalid for quiz issue ${issue.number}`);
    }
    return {
      ...issue,
      finalization: {
        proposedRound: match[1].trim(),
        theme: match[2].trim(),
        notes: match[3].trim(),
        finalizedBy: match[4].trim(),
        finalizedAt: match[5].trim(),
        commentBody: comment.body,
      },
    };
  }));
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
      labels: quizLabels(),
    }),
  });
  if (!response.ok) {
    const message = await response.text();
    console.error("Could not create quiz issue", { status: response.status, body: message });
    throw new Error("Could not save quiz question");
  }
}

export async function finalizeQuizIssue(
  issueNumber: number,
  details: { proposedRound: string; theme: string; notes: string },
  finalizedBy: string,
) {
  const issueResponse = await fetch(repositoryUrl(`issues/${issueNumber}`), {
    headers: headers(),
    cache: "no-store",
  });
  if (!issueResponse.ok) throw new Error("Could not load quiz question");

  const issue = (await issueResponse.json()) as GitHubIssue;
  const labels = (issue.labels ?? [])
    .map((label) => label.name)
    .filter((label): label is string => Boolean(label));
  if (!quizLabels().every((label) => labels.includes(label))) {
    throw new Error("Question is not part of the quiz workspace");
  }
  if (labels.includes(finalizedQuizLabel)) {
    throw new Error("Question has already been finalized");
  }
  if (!labels.includes(details.proposedRound)) {
    labels.push(details.proposedRound);
  }
  labels.push(finalizedQuizLabel);

  const labelResponse = await fetch(repositoryUrl(`issues/${issueNumber}`), {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ labels }),
  });
  if (!labelResponse.ok) {
    const message = await labelResponse.text();
    console.error("Could not finalize quiz issue labels", { status: labelResponse.status, body: message });
    throw new Error("Could not finalize quiz question");
  }

  const commentResponse = await fetch(repositoryUrl(`issues/${issueNumber}/comments`), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      body: [
        "## Quiz question finalized",
        "",
        `- **Proposed round:** ${details.proposedRound}`,
        `- **Theme:** ${details.theme}`,
        `- **Notes:** ${details.notes || "None"}`,
        "",
        `Finalized by: ${finalizedBy}`,
        `Finalized: ${new Date().toISOString()}`,
      ].join("\n"),
    }),
  });
  if (!commentResponse.ok) {
    const message = await commentResponse.text();
    console.error("Could not add quiz finalization comment", { status: commentResponse.status, body: message });
    throw new Error("Question was tagged but finalization details could not be saved");
  }
}

export async function finalizeQuizIssues(
  finalizations: Array<{
    issueNumber: number;
    proposedRound: string;
    theme: string;
    notes: string;
  }>,
  finalizedBy: string,
) {
  for (const finalization of finalizations) {
    await finalizeQuizIssue(finalization.issueNumber, finalization, finalizedBy);
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
