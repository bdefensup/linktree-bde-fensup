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
      isFeatured,
    } = body;

    // If this event is featured, unfeature all others
    if (isFeatured) {
      await prisma.event.updateMany({
        where: { id: { not: id } },
        data: { isFeatured: false },
      });
    }

    // Construct update data dynamically to support partial updates
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (location !== undefined) updateData.location = location;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (memberPrice !== undefined)
      updateData.memberPrice = parseFloat(memberPrice);
    if (externalPrice !== undefined)
      updateData.externalPrice = parseFloat(externalPrice);
    if (image !== undefined) updateData.image = image;
    if (capacity !== undefined) updateData.maxSeats = parseInt(capacity);
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
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
