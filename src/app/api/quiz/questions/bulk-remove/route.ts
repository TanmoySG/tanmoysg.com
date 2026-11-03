import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { closeQuizIssues } from "@/lib/quiz-issues";

const requestSchema = z.object({
  issueNumbers: z.array(z.number().int().positive()).min(1).max(100),
});

export async function POST(request: Request) {
  if (!(await getAuthenticatedQuizUser())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = requestSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: "Select at least one question" }, { status: 400 });
  }

  try {
    await closeQuizIssues(result.data.issueNumbers);
    return NextResponse.json({ removed: result.data.issueNumbers.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove questions" },
      { status: 502 },
    );
  }
}
