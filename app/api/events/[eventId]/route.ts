import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: params.eventId,
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ["PENDING", "CONFIRMED"],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event", details: String(error) },
      { status: 500 }
    );
  }
}
