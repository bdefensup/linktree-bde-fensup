import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, message, donorName } = body;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        message,
        donorName,
        status: "PENDING",
      },
    });

    // Generate Revolut link
    // Format: https://revolut.me/<username>/<amount>?note=<note>
    const revolutUsername = process.env.REVOLUT_USERNAME || "bdefensup";
    const note = `DON-${donation.id}`;
    // Encode the note to be URL-safe
    const encodedNote = encodeURIComponent(note);

    const revolutLink = `https://revolut.me/${revolutUsername}/${amount}?note=${encodedNote}`;

    return NextResponse.json({
      donationId: donation.id,
      revolutLink,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
