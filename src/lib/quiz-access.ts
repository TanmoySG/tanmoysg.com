import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getQuizAccessContent } from "./github-content";
import type { QuizUser } from "./brunch-schema";

const quizCookieName = "quiz-access";

function getToken(accessCode: string): string {
  const secret = process.env.QUIZ_ACCESS_COOKIE_SECRET;
  if (!secret) throw new Error("Missing required environment variable: QUIZ_ACCESS_COOKIE_SECRET");
  return createHmac("sha256", secret).update(`quiz:${accessCode}`).digest("hex");
}

function secureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  return (forwardedProto ?? new URL(request.url).protocol.replace(":", "")) === "https";
}

export async function getAuthenticatedQuizUser(): Promise<QuizUser | undefined> {
  const value = (await cookies()).get(quizCookieName)?.value;
  if (!value) return undefined;
  const { users } = await getQuizAccessContent();
  return users.find((user) => {
    const expected = getToken(user.accessCode);
    return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  });
}

export async function createQuizAccessCookie(accessCode: string, secure: boolean) {
  return {
    name: quizCookieName,
    value: getToken(accessCode),
    options: {
      httpOnly: true,
      secure,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

export function clearQuizAccessCookie(secure: boolean) {
  return {
    name: quizCookieName,
    value: "",
    options: {
      httpOnly: true,
      secure,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

export { secureRequest };
