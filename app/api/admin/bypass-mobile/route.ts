import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // Secret key to authorize the device
  // In a real app, this should be an env var, but for this specific request:
  const SECRET_KEY = "YAYA_MOBILE_VIP_ACCESS";

  if (key !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));

  // Set a long-lived cookie (1 year)
  response.cookies.set("admin_mobile_bypass", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
