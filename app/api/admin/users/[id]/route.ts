import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role, banned } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(typeof banned === "boolean" && { banned }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = session.user.role;

    // Adherent cannot delete anyone
    if (currentUserRole === "adherent") {
      return NextResponse.json(
        {
          error: "Vous n'avez pas la permission de supprimer des utilisateurs.",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting self
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 }
      );
    }

    // Fetch target user to check their role
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Staff cannot delete Admin
    if (currentUserRole === "staff" && targetUser.role === "admin") {
      return NextResponse.json(
        {
          error: "Les membres du staff ne peuvent pas supprimer un administrateur.",
        },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
