import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      date,
      location,
      price,
      memberPrice,
      image,
      externalPrice,
      capacity,
    } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price: price !== undefined ? parseFloat(price) : undefined,
        memberPrice: memberPrice !== undefined ? parseFloat(memberPrice) : null,
        externalPrice:
          externalPrice !== undefined ? parseFloat(externalPrice) : null,
        image,
        maxSeats: capacity !== undefined ? parseInt(capacity) : undefined,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
