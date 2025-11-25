import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import PaymentReceivedEmail from "@/components/emails/payment-received";
import BookingCancelledEmail from "@/components/emails/booking-cancelled";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update booking and fetch related data for email
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

    // Send email based on status
    if (process.env.RESEND_API_KEY) {
      if (status === "CONFIRMED") {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: booking.email,
          subject: `Paiement validé - ${booking.event.title}`,
          react: PaymentReceivedEmail({
            firstName: booking.firstName,
            eventName: booking.event.title,
            bookingId: booking.id,
          }),
        });
      } else if (status === "CANCELLED") {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: booking.email,
          subject: `Mise à jour réservation - ${booking.event.title}`,
          react: BookingCancelledEmail({
            firstName: booking.firstName,
            eventName: booking.event.title,
            bookingId: booking.id,
          }),
        });
      }
    } else {
      console.warn("RESEND_API_KEY is missing, skipping email sending.");
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
