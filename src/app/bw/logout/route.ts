import { NextResponse } from "next/server";
import { clearQuizAccessCookie, secureRequest } from "@/lib/quiz-access";
import { getPublicUrl } from "@/lib/redirect-url";

export function GET(request: Request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/bw"));
  const cookie = clearQuizAccessCookie(secureRequest(request));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
