import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Simple protection to prevent public access
  if (secret !== "SuperSecretAdminSeed2025!") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const email = "admin@bdefensup.fr";
    const password = "AdminPassword123!";
    const name = "Admin BDE";

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If exists, just update verification and role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          emailVerified: true,
          role: "admin",
        },
      });
      return NextResponse.json({ message: "User updated", user: updatedUser });
    }

    // 2. Create user via Better Auth
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 3. Force verify and admin role
    const finalUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        role: "admin",
      },
    });

    return NextResponse.json({
      message: "User created and verified",
      user: finalUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
