import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // RFC 8058: The POST request body is empty.
    // We rely on the query parameters or the URL itself to identify the user.
    // In our case, we'll pass ?email=... (encoded)
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Decode email if necessary (though searchParams handles standard encoding)
    // Ideally, this should be a signed token to prevent abuse.
    // For this implementation, we assume the email is passed directly.
    
    await prisma.unsubscribedRecipient.upsert({
      where: { email },
      update: {},
      create: {
        email,
        reason: "One-Click Unsubscribe",
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, unsubscribed, topicIds } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Update Contact
    await prisma.contact.update({
      where: { email },
      data: {
        unsubscribed,
        topics: {
          deleteMany: {}, // Clear existing
          create: topicIds?.map((id: string) => ({
            topic: { connect: { id } },
          })),
        },
      },
    });

    // Also update UnsubscribedRecipient if globally unsubscribed
    if (unsubscribed) {
      await prisma.unsubscribedRecipient.upsert({
        where: { email },
        update: {},
        create: { email, reason: "User Preference" },
      });
    } else {
      // If re-subscribing globally, remove from UnsubscribedRecipient
      await prisma.unsubscribedRecipient.deleteMany({
        where: { email },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
