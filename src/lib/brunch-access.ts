import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getInviteeByAccessCode, getInviteeContent } from "./github-content";
import type { Invitee } from "./brunch-schema";

const accessCookieName = "brunch-access";
const accessCookieValue = "granted";

export { accessCookieName };

function getAccessToken(pin: string): string {
  const secret = process.env.BRUNCH_ACCESS_COOKIE_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: BRUNCH_ACCESS_COOKIE_SECRET");
  }
  return createHmac("sha256", secret).update(`${accessCookieValue}:${pin}`).digest("hex");
}

function valuesMatch(expected: string, actual: string | undefined): boolean {
  if (!actual || actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

export async function hasBrunchAccess(): Promise<boolean> {
  return Boolean(await getAuthenticatedInvitee());
}

export async function isValidBrunchPin(pin: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) {
    return false;
  }

  return Boolean(await getInviteeByAccessCode(pin));
}

export async function createBrunchAccessCookie(pin: string, secure = process.env.NODE_ENV === "production") {
  return {
    name: accessCookieName,
    value: getAccessToken(pin),
    options: {
      httpOnly: true,
      secure,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export async function getAuthenticatedInvitee(): Promise<Invitee | undefined> {
  const cookie = (await cookies()).get(accessCookieName);
  if (!cookie) {
    return undefined;
  }

  const { invitees } = await getInviteeContent();
  return invitees.find((invitee) => valuesMatch(getAccessToken(invitee.accessCode), cookie.value));
}
