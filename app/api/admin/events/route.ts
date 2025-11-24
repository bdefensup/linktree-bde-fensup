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
      capacity,
    } = body;

    // Basic validation
    if (!title || !date || !location || !price || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        price: parseFloat(price),
        memberPrice: memberPrice ? parseFloat(memberPrice) : null,
        image,
        maxSeats: parseInt(capacity),
      },
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
