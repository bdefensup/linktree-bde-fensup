import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    // Basic auth check using headers (better-auth usually works with cookies/headers)
    // Since we have middleware protecting /admin, we can assume some level of safety,
    // but it's good practice to verify the session here too if possible.
    // For now, we rely on the middleware for the main protection layer.

    const bookings = await prisma.booking.findMany({
      include: {
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
