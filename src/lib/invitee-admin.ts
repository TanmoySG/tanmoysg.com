import "server-only";

import { inviteesSchema, type InviteeContent } from "./brunch-schema";

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

function contentToken(): string {
  return process.env.GITHUB_INVITEES_TOKEN ?? required("GITHUB_CONTENT_TOKEN");
}

function fileUrl(): string {
  const owner = required("GITHUB_CONTENT_OWNER");
  const repo = required("GITHUB_CONTENT_REPO");
  const ref = required("GITHUB_CONTENT_REF");
  const path = required("GITHUB_INVITEES_PATH").split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}?ref=${encodeURIComponent(ref)}`;
}

function headers(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${contentToken()}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function decode(content: string): string {
  return Buffer.from(content.replace(/\s/g, ""), "base64").toString("utf8");
}

export async function updateInvitees(
  update: (content: InviteeContent) => InviteeContent,
): Promise<InviteeContent> {
  const currentResponse = await fetch(fileUrl(), { headers: headers(), cache: "no-store" });
  const current = (await currentResponse.json()) as GitHubFile;
  if (!currentResponse.ok || !current.content || !current.sha || current.encoding !== "base64") {
    throw new Error(`Could not read invitees file: ${current.message ?? currentResponse.status}`);
  }

  const parsed = inviteesSchema.safeParse(JSON.parse(decode(current.content)));
  if (!parsed.success) throw new Error("Invitees file failed schema validation");
  const next = inviteesSchema.parse(update(parsed.data));

  const updateResponse = await fetch(fileUrl(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message: "Update brunch invitees",
      content: Buffer.from(`${JSON.stringify(next, null, 2)}\n`).toString("base64"),
      sha: current.sha,
      branch: required("GITHUB_CONTENT_REF"),
    }),
  });
  if (!updateResponse.ok) {
    const error = (await updateResponse.json()) as GitHubFile;
    throw new Error(`Could not update invitees file: ${error.message ?? updateResponse.status}`);
  }

  return next;
}
