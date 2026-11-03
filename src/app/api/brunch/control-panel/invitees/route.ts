import { NextResponse } from "next/server";
import { z } from "zod";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import { updateInvitees } from "@/lib/invitee-admin";

const inviteeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  accessCode: z.string().regex(/^\d{4}$/),
});

export async function POST(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = inviteeSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: "Enter a name and a four-digit access code" }, { status: 400 });
  }

  try {
    const content = await updateInvitees((current) => {
      if (current.invitees.some((invitee) => invitee.accessCode === result.data.accessCode)) {
        throw new Error("That access code is already in use");
      }
      return { invitees: [...current.invitees, result.data] };
    });
    return NextResponse.json({ invitees: content.invitees });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add invitee" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await hasControlPanelAccess())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = z.object({ accessCode: z.string().regex(/^\d{4}$/) }).safeParse(
    await request.json().catch(() => null),
  );
  if (!result.success) return NextResponse.json({ error: "Invalid access code" }, { status: 400 });

  try {
    const content = await updateInvitees((current) => ({
      invitees: current.invitees.filter((invitee) => invitee.accessCode !== result.data.accessCode),
    }));
    return NextResponse.json({ invitees: content.invitees });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove invitee" },
      { status: 400 },
    );
  }
}
