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
    const { role, banned, position } = body;

    // Handle Position Update (Strict RBAC)
    if (position !== undefined) {
      // 1. Only Super Admin can assign positions
      if (session.user.email !== "admin@bdefenelon.org") {
        return NextResponse.json(
          { error: "Seul le Super Admin peut attribuer des positions." },
          { status: 403 }
        );
      }

      // 2. Only Admins can have a position
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (!targetUser || targetUser.role !== "admin") {
        return NextResponse.json(
          { error: "Seuls les administrateurs peuvent avoir une position officielle." },
          { status: 400 }
        );
      }

      // 3. Check if position is already taken
      if (position) {
        const existingHolder = await prisma.user.findFirst({
          where: {
            position: position,
            id: { not: id },
          },
          select: { name: true, email: true },
        });

        if (existingHolder) {
          return NextResponse.json(
            {
              error: `Cette position est déjà occupée par ${
                existingHolder.name || existingHolder.email
              }.`,
              code: "POSITION_TAKEN",
              holderName: existingHolder.name || existingHolder.email,
            },
            { status: 409 }
          );
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(typeof banned === "boolean" && { banned }),
        ...(position !== undefined && { position }),
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
