import { NextResponse } from "next/server";
import { z } from "zod";
import { hasControlPanelAccess } from "@/lib/control-panel-access";

const requestSchema = z.object({
  issueNumbers: z.array(z.number().int().positive()).min(1).max(100),
});

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = requestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Select at least one issue" }, { status: 400 });
  }

  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const token = getRequiredEnvironmentVariable("GITHUB_RESPONSES_TOKEN");

  for (const issueNumber of result.data.issueNumbers) {
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
      return NextResponse.json({ error: `Could not close issue #${issueNumber}` }, { status: 502 });
    }
  }

  return NextResponse.json({ acknowledged: result.data.issueNumbers.length });
}
