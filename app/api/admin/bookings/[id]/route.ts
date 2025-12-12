import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import PaymentReceivedEmail from "@/components/emails/bookings/payment-received";
import BookingCancelledEmail from "@/components/emails/bookings/booking-cancelled";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW"].includes(status)) {
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
            id: true,
          },
        },
      },
    });

    // Send email based on status
    let emailSent = false;
    let emailError = null;

    if (process.env.RESEND_API_KEY) {
      const from = process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>";
      let emailResult;
      let subject = "";
      let eventType = "";

      if (status === "CONFIRMED") {
        subject = `Paiement validé - ${booking.event.title}`;
        eventType = "payment_received";
        emailResult = await resend.emails.send({
          from,
          to: booking.email,
          subject,
          react: PaymentReceivedEmail({
            firstName: booking.firstName,
            eventName: booking.event.title,
            bookingId: booking.id,
          }),
          tags: [
            { name: "category", value: "booking" },
            { name: "action", value: eventType },
            { name: "eventId", value: booking.event.id },
          ],
        });
      } else if (status === "CANCELLED") {
        subject = `Mise à jour réservation - ${booking.event.title}`;
        eventType = "cancelled";
        emailResult = await resend.emails.send({
          from,
          to: booking.email,
          subject,
          react: BookingCancelledEmail({
            firstName: booking.firstName,
            eventName: booking.event.title,
            bookingId: booking.id,
          }),
          tags: [
            { name: "category", value: "booking" },
            { name: "action", value: eventType },
            { name: "eventId", value: booking.event.id },
          ],
        });
      }

      if (emailResult) {
        if (emailResult.error) {
          console.error("Resend API Error:", emailResult.error);
          emailError = emailResult.error.message;
          
          // Log failure
          await prisma.emailLog.create({
            data: {
              emailId: "failed",
              recipient: booking.email,
              status: "failed",
              eventType: "send_failed",
              bookingId: booking.id,
              bounceMessage: emailResult.error.message,
            },
          });
        } else {
          emailSent = true;
          // Log success
          if (emailResult.data?.id) {
             await prisma.emailLog.create({
              data: {
                emailId: emailResult.data.id,
                recipient: booking.email,
                status: "sent",
                eventType: "sent",
                bookingId: booking.id,
              },
            });
          }
        }
      }
    } else {
      console.warn("RESEND_API_KEY is missing, skipping email sending.");
      emailError = "RESEND_API_KEY missing";
    }

    return NextResponse.json({ ...booking, emailSent, emailError });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
