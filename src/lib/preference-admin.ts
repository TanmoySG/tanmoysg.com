import "server-only";

import {
  preferenceQuestionsSchema,
  type PreferenceQuestion,
} from "./brunch-schema";

type GitHubFile = {
  content?: string;
  encoding?: string;
  sha?: string;
  message?: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function token(): string {
  return process.env.GITHUB_INVITEES_TOKEN ?? required("GITHUB_CONTENT_TOKEN");
}

function fileUrl(): string {
  const owner = required("GITHUB_CONTENT_OWNER");
  const repo = required("GITHUB_CONTENT_REPO");
  const ref = required("GITHUB_CONTENT_REF");
  const path = (process.env.GITHUB_PREFERENCES_PATH ?? "source/preferences.json")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(ref)}`;
}

function headers(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token()}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function updatePreferenceQuestions(
  update: (questions: PreferenceQuestion[]) => PreferenceQuestion[],
): Promise<PreferenceQuestion[]> {
  const response = await fetch(fileUrl(), { headers: headers(), cache: "no-store" });
  const current = (await response.json()) as GitHubFile;
  if (!response.ok || !current.content || !current.sha || current.encoding !== "base64") {
    throw new Error(`Could not read preference questions: ${current.message ?? response.status}`);
  }

  const parsed = preferenceQuestionsSchema.safeParse(
    JSON.parse(Buffer.from(current.content.replace(/\s/g, ""), "base64").toString("utf8")),
  );
  if (!parsed.success) throw new Error("Preference questions failed schema validation");
  const next = preferenceQuestionsSchema.parse({ questions: update(parsed.data.questions) });

  const updateResponse = await fetch(fileUrl(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message: "Update brunch preference questions",
      content: Buffer.from(`${JSON.stringify(next, null, 2)}\n`).toString("base64"),
      sha: current.sha,
      branch: required("GITHUB_CONTENT_REF"),
    }),
  });
  if (!updateResponse.ok) {
    const error = (await updateResponse.json()) as GitHubFile;
    throw new Error(`Could not update preference questions: ${error.message ?? updateResponse.status}`);
  }

  return next.questions;
}
