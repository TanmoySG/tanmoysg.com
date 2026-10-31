import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "brunch-control-panel";

function getSecret(): string {
  const secret = process.env.GITHUB_CONTROL_PANEL_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: GITHUB_CONTROL_PANEL_SECRET");
  }
  return secret;
}

function getToken(): string {
  return createHmac("sha256", getSecret()).update("authorized").digest("hex");
}

export async function hasControlPanelAccess(): Promise<boolean> {
  const value = (await cookies()).get(cookieName)?.value;
  const expected = getToken();
  if (!value || value.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function createControlPanelCookie() {
  return {
    name: cookieName,
    value: getToken(),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 8,
    },
  };
}

export function clearControlPanelCookie() {
  return {
    name: cookieName,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 0,
    },
  };
}
