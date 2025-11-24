import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Resend } from "resend";
import BookingConfirmationEmail from "@/components/emails/booking-confirmation";

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, firstName, lastName, email, phone, isMember } = body;

    // Validate input
    if (!eventId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if event exists and has available seats
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    const availableSeats = event.maxSeats - event._count.bookings;
    if (availableSeats <= 0) {
      return NextResponse.json(
        { error: "No seats available" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventId,
        firstName,
        lastName,
        email,
        phone,
        isMember: isMember || false,
        status: "PENDING",
      },
    });

    // Determine payment link
    let revolutLink = "";

    if (isMember && event.externalMemberPaymentLink) {
      revolutLink = event.externalMemberPaymentLink;
    } else if (!isMember && event.externalPaymentLink) {
      revolutLink = event.externalPaymentLink;
    } else {
      // Fallback to generated link
      const price =
        isMember && event.memberPrice ? event.memberPrice : event.price;
      const revolutUsername = process.env.REVOLUT_USERNAME || "bdefensup";
      revolutLink = `https://revolut.me/${revolutUsername}/${price}?note=BOOKING-${booking.id}`;
    }

    // Update booking with Revolut link
    await prisma.booking.update({
      where: { id: booking.id },
      data: { revolutLink },
    });

    // Send confirmation email
    if (process.env.RESEND_API_KEY) {
      console.log("Attempting to send email to:", email);
      try {
        const emailResult = await resend.emails.send({
          from: "BDE FEN'SUP <onboarding@resend.dev>", // Default Resend testing domain
          to: email,
          subject: `Confirmation de réservation - ${event.title}`,
          react: BookingConfirmationEmail({
            firstName,
            eventName: event.title,
            bookingId: booking.id,
          }),
        });
        console.log("Email sent successfully:", emailResult);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.warn("RESEND_API_KEY is missing, skipping email.");
    }

    return NextResponse.json({
      bookingId: booking.id,
      revolutLink,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
