import { NextResponse } from "next/server";
import { hasControlPanelAccess } from "@/lib/control-panel-access";

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const issueNumber = Number((await params).number);
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
    return NextResponse.json({ error: "Invalid issue number" }, { status: 400 });
  }

  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const token = getRequiredEnvironmentVariable("GITHUB_RESPONSES_TOKEN");
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/issues/${issueNumber}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ state: "closed" }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Could not close issue" }, { status: 502 });
  }

  return NextResponse.json({ acknowledged: true });
}
