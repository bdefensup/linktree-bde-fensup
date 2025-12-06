import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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
      isFeatured,
      manualRemainingSeats,
    } = body;

    // Basic validation
    if (
      !title ||
      !date ||
      !location ||
      price === undefined ||
      capacity === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this event is featured, unfeature all others
    if (isFeatured) {
      await prisma.event.updateMany({
        data: { isFeatured: false },
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price: parseFloat(price),
        memberPrice: memberPrice ? parseFloat(memberPrice) : null,
        externalPrice: externalPrice ? parseFloat(externalPrice) : null,
        image,
        maxSeats: parseInt(capacity),
        isFeatured: isFeatured || false,
        manualRemainingSeats: manualRemainingSeats ? parseInt(manualRemainingSeats) : null,
      } as any,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
