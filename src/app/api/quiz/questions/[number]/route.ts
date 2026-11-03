import { NextResponse } from "next/server";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { closeQuizIssue } from "@/lib/quiz-issues";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!(await getAuthenticatedQuizUser())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const issueNumber = Number((await params).number);
  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
    return NextResponse.json({ error: "Invalid issue number" }, { status: 400 });
  }

  try {
    await closeQuizIssue(issueNumber);
    return NextResponse.json({ removed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove quiz question" },
      { status: 502 },
    );
  }
}
