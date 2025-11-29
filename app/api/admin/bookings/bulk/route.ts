import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import PaymentReceivedEmail from "@/components/emails/payment-received";
import BookingCancelledEmail from "@/components/emails/booking-cancelled";

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

    // Fetch bookings to send emails
    const bookings = await prisma.booking.findMany({
      where: {
        id: {
          in: bookingIds,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
    });

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

    // Send emails
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

      // Send emails in parallel but don't block response
      Promise.all(
        bookings.map(async (booking) => {
          try {
            if (status === "CONFIRMED") {
              await resend.emails.send({
                from,
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
                from,
                to: booking.email,
                subject: `Mise à jour réservation - ${booking.event.title}`,
                react: BookingCancelledEmail({
                  firstName: booking.firstName,
                  eventName: booking.event.title,
                  bookingId: booking.id,
                }),
              });
            }
          } catch (err) {
            console.error(`Failed to send email to ${booking.email}:`, err);
          }
        })
      ).catch((err) => console.error("Error in bulk email sending:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      { error: "Failed to update bookings" },
      { status: 500 }
    );
  }
}
