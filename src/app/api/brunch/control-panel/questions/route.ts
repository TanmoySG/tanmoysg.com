import { NextResponse } from "next/server";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import { preferenceQuestionSchema } from "@/lib/brunch-schema";
import { updatePreferenceQuestions } from "@/lib/preference-admin";

export async function POST(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = preferenceQuestionSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: "Enter a valid question and options" }, { status: 400 });
  }

  try {
    const questions = await updatePreferenceQuestions((current) => {
      if (current.some((question) => question.id === result.data.id)) {
        throw new Error("That question ID is already in use");
      }
      return [...current, result.data];
    });
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add question" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const originalId = body && typeof body === "object" && "originalId" in body && typeof body.originalId === "string"
    ? body.originalId
    : "";
  const question = body && typeof body === "object" && "question" in body ? body.question : null;
  const result = preferenceQuestionSchema.safeParse(question);
  if (!originalId || !result.success) {
    return NextResponse.json({ error: "Enter a valid question and options" }, { status: 400 });
  }

  try {
    const questions = await updatePreferenceQuestions((current) => {
      if (!current.some((item) => item.id === originalId)) throw new Error("Question not found");
      if (result.data.id !== originalId && current.some((item) => item.id === result.data.id)) {
        throw new Error("That question ID is already in use");
      }
      return current.map((item) => item.id === originalId ? result.data : item);
    });
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update question" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("id" in body) || typeof body.id !== "string") {
    return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
  }

  try {
    const questions = await updatePreferenceQuestions((current) => {
      const next = current.filter((question) => question.id !== body.id);
      if (next.length === current.length) throw new Error("Question not found");
      return next;
    });
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove question" },
      { status: 400 },
    );
  }
}
