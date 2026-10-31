import { NextResponse } from "next/server";
import { clearControlPanelCookie } from "@/lib/control-panel-access";
import { getPublicUrl } from "@/lib/redirect-url";

export function GET(request: Request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/brunch/control-panel"));
  const cookie = clearControlPanelCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
