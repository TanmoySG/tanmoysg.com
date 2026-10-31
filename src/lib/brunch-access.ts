import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getInviteeByAccessCode, getInviteeContent } from "./github-content";
import type { Invitee } from "./brunch-schema";

const accessCookieName = "brunch-access";
const accessCookieValue = "granted";

export { accessCookieName };

function getAccessToken(pin: string): string {
  return createHmac("sha256", pin).update(accessCookieValue).digest("hex");
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

export async function createBrunchAccessCookie(pin: string) {
  return {
    name: accessCookieName,
    value: getAccessToken(pin),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
