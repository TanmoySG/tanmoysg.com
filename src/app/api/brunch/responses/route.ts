import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedInvitee } from "@/lib/brunch-access";
import { getBrunchContent } from "@/lib/github-content";
import { getPublicUrl } from "@/lib/redirect-url";

const responseSchema = z.object({
  answers: z.record(z.string(), z.union([z.string().trim().max(500), z.array(z.string().min(1)).max(50)])),
  attending: z.boolean(),
});

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: Request) {
  const isFormSubmission = request.headers.get("content-type")?.includes("application/x-www-form-urlencoded");
  const invitee = await getAuthenticatedInvitee();
  if (!invitee) {
    return isFormSubmission
      ? redirectToBrunch(request, "error=authentication-required")
      : NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    if (isFormSubmission) {
      const formData = await request.formData();
      const answers: Record<string, string | string[]> = {};
      for (const [key, value] of formData.entries()) {
        if (key === "attending" || typeof value !== "string") continue;
        const current = answers[key];
        answers[key] = current === undefined
          ? value
          : Array.isArray(current) ? [...current, value] : [current, value];
      }
      parsedBody = { answers, attending: formData.get("attending") === "true" };
    } else {
      parsedBody = await request.json();
    }
  } catch {
    return isFormSubmission
      ? redirectToBrunch(request, "error=invalid-response")
      : NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = responseSchema.safeParse(parsedBody);
  if (!result.success) {
    return isFormSubmission
      ? redirectToBrunch(request, "error=invalid-response")
      : NextResponse.json({ error: "Invalid response data" }, { status: 400 });
  }

  const content = await getBrunchContent();
  const questions = content.preferences.questions;
  const questionIds = new Set(questions.map((question) => question.id));
  if (Object.keys(result.data.answers).some((id) => !questionIds.has(id))) {
    return isFormSubmission
      ? redirectToBrunch(request, "error=invalid-response")
      : NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  for (const question of result.data.attending ? questions : []) {
    const answer = result.data.answers[question.id];
    if (question.type === "input") {
      if (answer !== undefined && typeof answer !== "string") {
        return isFormSubmission
          ? redirectToBrunch(request, "error=invalid-response")
          : NextResponse.json({ error: "Invalid input response" }, { status: 400 });
      }
      continue;
    }

    if (question.type === "multi-select" && (
      !Array.isArray(answer) ||
      answer.some((value) => !question.options.some((option) => option.value === value))
    )) {
      return isFormSubmission
        ? redirectToBrunch(request, "error=invalid-response")
        : NextResponse.json({ error: "Invalid selection response" }, { status: 400 });
    }

    if (question.type === "single-select" && (
      typeof answer !== "string" ||
      !question.options.some((option) => option.value === answer)
    )) {
      return isFormSubmission
        ? redirectToBrunch(request, "error=invalid-response")
        : NextResponse.json({ error: "Invalid selection response" }, { status: 400 });
    }
  }

  const owner = getRequiredEnvironmentVariable("GITHUB_CONTENT_OWNER");
  const repository = getRequiredEnvironmentVariable("GITHUB_CONTENT_REPO");
  const token = process.env.GITHUB_RESPONSES_TOKEN ?? getRequiredEnvironmentVariable("GITHUB_CONTENT_TOKEN");
  const issueBody = [
    "## Brunch response",
    "",
    `- Invitee: ${invitee.name}`,
    `- Attendance: ${result.data.attending ? "I'll be there" : "I won't make it"}`,
    ...(result.data.attending
      ? questions.map((question) => {
          const answer = result.data.answers[question.id];
          const value = Array.isArray(answer) ? answer.join(", ") : answer || "None";
          return `- ${question.label}: ${value}`;
        })
      : []),
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
    console.error("Could not create brunch response issue", {
      status: githubResponse.status,
      body: await githubResponse.text(),
    });
    return isFormSubmission
      ? redirectToBrunch(request, "error=save-failed")
      : NextResponse.json({ error: "Could not save response" }, { status: 502 });
  }

  return isFormSubmission
    ? redirectToBrunch(request, "submitted=1")
    : NextResponse.json({ confirmation: content.response.confirmation });
}

function redirectToBrunch(request: Request, query: string): Response {
  const url = getPublicUrl(request, "/brunch");
  url.search = query;
  return Response.redirect(url, 303);
}
