import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "staff")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { bookingIds, status } = body;

    if (
      !bookingIds ||
      !Array.isArray(bookingIds) ||
      bookingIds.length === 0 ||
      !status
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Update bookings
    await prisma.booking.updateMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Failed to update bookings" },
      { status: 500 }
    );
  }
}
