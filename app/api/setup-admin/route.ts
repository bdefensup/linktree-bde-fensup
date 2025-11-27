import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "admin" },
    });

    return NextResponse.json({
      success: true,
      message: `User ${session.user.email} is now an admin. You can now use the invite feature.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
