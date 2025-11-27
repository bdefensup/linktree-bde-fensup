import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, role, name } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // 1. Create user with random password
    const temporaryPassword = crypto.randomUUID();

    // We use signUpEmail to leverage better-auth's creation logic (hashing, etc.)
    // Note: This might trigger a verification email if configured,
    // but we will override the verification status immediately after.
    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        password: temporaryPassword,
        name: name || email.split("@")[0],
      },
      headers: new Headers({ "x-admin-invite": "true" }),
    });

    if (!signUpResponse) {
      // If signUpResponse is null/undefined, something went wrong or user exists
      // better-auth usually throws or returns error, but let's check if user exists manually if needed
      // For now, assume success or catch block handles it.
      // Actually, better-auth api calls might throw APIError.
      // Handle error if needed
    }

    // 2. Update user role and verify email (since admin invited)
    // We need to find the user we just created.
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User creation failed");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: role,
        emailVerified: true, // Auto-verify invited users
      },
    });

    // 3. Trigger password reset email (acts as invitation)
    // We call the auth endpoint directly since auth.api.forgetPassword is not available server-side
    const origin = new URL(req.url).origin;
    const resetResponse = await fetch(`${origin}/api/auth/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        redirectTo: "/reset-password",
      }),
    });

    if (!resetResponse.ok) {
      console.error(
        "Failed to trigger password reset:",
        await resetResponse.text()
      );
      // We don't fail the whole request since the user is created
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Invite user error:", error);

    // Handle specific better-auth errors if possible
    if (error.body?.message) {
      return NextResponse.json({ error: error.body.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to invite user" },
      { status: 500 }
    );
  }
}
