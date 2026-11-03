import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedQuizUser } from "@/lib/quiz-access";
import { finalizeQuizIssues } from "@/lib/quiz-issues";
import { getQuizRoundsContent } from "@/lib/github-content";

const finalizationSchema = z.object({
  issueNumber: z.coerce.number().int().positive(),
  proposedRound: z.string().trim().min(1).max(200),
  theme: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(5000),
});
const bulkFinalizationSchema = z.object({
  finalizations: z.array(finalizationSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedQuizUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const result = bulkFinalizationSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return NextResponse.json({ error: "Select at least one question and complete its fields" }, { status: 400 });

  try {
    const { rounds } = await getQuizRoundsContent();
    if (result.data.finalizations.some((finalization) => !rounds.includes(finalization.proposedRound))) {
      return NextResponse.json({ error: "One or more selected rounds are invalid" }, { status: 400 });
    }
    await finalizeQuizIssues(result.data.finalizations, user.name);
    return NextResponse.json({ finalized: true, count: result.data.finalizations.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not finalize quiz question" },
      { status: 502 },
    );
  }
}
