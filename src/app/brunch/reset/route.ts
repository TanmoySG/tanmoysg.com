import { NextResponse } from "next/server";
import { accessCookieName } from "@/lib/brunch-access";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/brunch", request.url));
  response.cookies.set(accessCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
