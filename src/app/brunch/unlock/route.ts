import { NextResponse } from "next/server";
import {
  createBrunchAccessCookie,
  isValidBrunchPin,
} from "@/lib/brunch-access";

export async function POST(request: Request) {
  const formData = await request.formData();
  const pin = formData.get("pin");

  return unlock(request, typeof pin === "string" ? pin : undefined);
}

export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin");
  return unlock(request, pin ?? undefined);
}

async function unlock(request: Request, pin: string | undefined) {
  if (!pin || !(await isValidBrunchPin(pin))) {
    return redirectWithRelativeLocation("/brunch?error=invalid-pin");
  }

  const response = redirectWithRelativeLocation("/brunch");
  const cookie = await createBrunchAccessCookie(pin);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

function redirectWithRelativeLocation(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}
