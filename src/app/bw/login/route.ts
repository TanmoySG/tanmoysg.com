import { NextResponse } from "next/server";
import { createQuizAccessCookie, secureRequest } from "@/lib/quiz-access";
import { getPublicUrl } from "@/lib/redirect-url";
import { getQuizUserByAccessCode } from "@/lib/github-content";

export async function POST(request: Request) {
  const formData = await request.formData();
  const accessCode = formData.get("accessCode");
  const user = typeof accessCode === "string" && /^\d{4}$/.test(accessCode)
    ? await getQuizUserByAccessCode(accessCode)
    : undefined;
  const url = getPublicUrl(request, "/bw");

  if (!user) {
    url.searchParams.set("error", "invalid-code");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(url);
  const cookie = await createQuizAccessCookie(user.accessCode, secureRequest(request));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
