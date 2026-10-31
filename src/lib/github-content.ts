import "server-only";

import {
  brunchSchema,
  inviteesSchema,
  type BrunchContent,
  type Invitee,
  type InviteeContent,
} from "./brunch-schema";

const revalidateSeconds = 60;

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getGitHubFileUrl(pathEnvironmentVariable: string, defaultPath?: string): string {
  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const reference = getRequiredEnvironmentVariable("GITHUB_CONTENT_REF");
  const configuredPath = process.env[pathEnvironmentVariable] ?? defaultPath;
  if (!configuredPath) {
    throw new Error(`Missing required environment variable: ${pathEnvironmentVariable}`);
  }

  const path = configuredPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/contents/${path}?ref=${encodeURIComponent(reference)}`;
}

type GitHubFileResponse = {
  type?: string;
  content?: string;
  encoding?: string;
  message?: string;
};

function decodeGitHubContent(content: string): string {
  try {
    return Buffer.from(content.replace(/\s/g, ""), "base64").toString("utf8");
  } catch {
    throw new Error("GitHub content could not be decoded");
  }
}

async function getGitHubJson(pathEnvironmentVariable: string, defaultPath?: string): Promise<unknown> {
  const token = getRequiredEnvironmentVariable("GITHUB_CONTENT_TOKEN");
  const response = await fetch(getGitHubFileUrl(pathEnvironmentVariable, defaultPath), {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: {
      revalidate: revalidateSeconds,
    },
  });

  let payload: GitHubFileResponse;
  try {
    payload = (await response.json()) as GitHubFileResponse;
  } catch {
    throw new Error(`GitHub returned an invalid response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      `GitHub content request failed (${response.status}): ${payload.message ?? "unknown error"}`,
    );
  }

  if (payload.type !== "file" || !payload.content || payload.encoding !== "base64") {
    throw new Error("Configured GitHub content path is not a Base64-encoded file");
  }

  try {
    return JSON.parse(decodeGitHubContent(payload.content));
  } catch {
    throw new Error("GitHub content is not valid JSON");
  }
}

export async function getBrunchContent(): Promise<BrunchContent> {
  const result = brunchSchema.safeParse(await getGitHubJson("GITHUB_CONTENT_PATH"));
  if (!result.success) {
    const invalidFields = result.error.issues
      .map((issue) => issue.path.join(".") || "root")
      .join(", ");
    throw new Error(`GitHub brunch content failed schema validation: ${invalidFields}`);
  }

  return result.data;
}

export async function getInviteeContent(): Promise<InviteeContent> {
  const result = inviteesSchema.safeParse(
    await getGitHubJson("GITHUB_INVITEES_PATH", "source/invitees.json"),
  );
  if (!result.success) {
    const invalidFields = result.error.issues
      .map((issue) => issue.path.join(".") || "root")
      .join(", ");
    throw new Error(`GitHub invitee content failed schema validation: ${invalidFields}`);
  }

  return result.data;
}

export async function getInviteeByAccessCode(accessCode: string): Promise<Invitee | undefined> {
  const { invitees } = await getInviteeContent();
  return invitees.find((invitee) => invitee.accessCode === accessCode);
}
