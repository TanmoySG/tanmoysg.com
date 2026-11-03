import { NextResponse } from "next/server";
import { accessCookieName } from "@/lib/brunch-access";
import { getPublicUrl } from "@/lib/redirect-url";

export function GET(request: Request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/brunch"));
  response.cookies.set(accessCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
