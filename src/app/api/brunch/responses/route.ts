import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedInvitee } from "@/lib/brunch-access";
import { getBrunchContent } from "@/lib/github-content";

const responseSchema = z.object({
  coffee: z.string().min(1),
  food: z.string().min(1),
  notes: z.string().trim().max(500),
  attending: z.boolean(),
});

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isAllowedValue(value: string, options: { value: string }[]): boolean {
  return options.some((option) => option.value === value);
}

export async function POST(request: Request) {
  const invitee = await getAuthenticatedInvitee();
  if (!invitee) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = responseSchema.safeParse(parsedBody);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid response data" }, { status: 400 });
  }

  const content = await getBrunchContent();
  if (
    !isAllowedValue(result.data.coffee, content.preferences.coffee.options) ||
    !isAllowedValue(result.data.food, content.preferences.food.options)
  ) {
    return NextResponse.json({ error: "Invalid preference selection" }, { status: 400 });
  }

  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const token = getRequiredEnvironmentVariable("GITHUB_RESPONSES_TOKEN");
  const issueBody = [
    "## Brunch response",
    "",
    `- Invitee: ${invitee.name}`,
    `- Attendance: ${result.data.attending ? "I'll be there" : "I won't make it"}`,
    ...(result.data.attending
      ? [`- Coffee: ${result.data.coffee}`, `- Food: ${result.data.food}`]
      : []),
    `- Notes: ${result.data.notes || "None"}`,
    `- Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  const githubResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/issues`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: `Brunch response — ${invitee.name} — ${result.data.attending ? "attending" : "not attending"}`,
        body: issueBody,
        labels: ["brunch-response"],
      }),
    },
  );

  if (!githubResponse.ok) {
    return NextResponse.json({ error: "Could not save response" }, { status: 502 });
  }

  return NextResponse.json({ confirmation: content.response.confirmation });
}
