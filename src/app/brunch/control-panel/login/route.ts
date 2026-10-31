import { NextResponse } from "next/server";
import { createControlPanelCookie } from "@/lib/control-panel-access";
import { getPublicUrl } from "@/lib/redirect-url";

export async function POST(request: Request) {
  const formData = await request.formData();
  const secret = formData.get("secret");

  if (typeof secret !== "string" || secret !== process.env.GITHUB_CONTROL_PANEL_SECRET) {
    const url = getPublicUrl(request, "/brunch/control-panel");
    url.searchParams.set("error", "invalid-secret");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(getPublicUrl(request, "/brunch/control-panel"));
  const cookie = createControlPanelCookie();
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
