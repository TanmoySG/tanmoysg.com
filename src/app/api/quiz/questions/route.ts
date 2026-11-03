import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { createQuizIssue } from "@/lib/quiz-issues";

const questionSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  resources: z.string().trim().max(5000),
  answer: z.string().trim().min(1).max(5000),
  clues: z.string().trim().max(5000),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedQuizUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = questionSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
  }

  try {
    await createQuizIssue(result.data, user.name);
    return NextResponse.json({ saved: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save quiz question" },
      { status: 502 },
    );
  }
}
