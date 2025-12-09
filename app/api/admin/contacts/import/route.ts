import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n");
    // Assume header: email,firstName,lastName
    // Skip header if present (simple check if first line contains "email")
    const startIndex = lines[0].toLowerCase().includes("email") ? 1 : 0;

    let successCount = 0;
    let errorCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [email, firstName, lastName] = line.split(",").map(s => s.trim());

      if (!email || !email.includes("@")) {
        errorCount++;
        continue;
      }

      try {
        // 1. Create in Resend
        let resendId: string | undefined;
        try {
          const { data } = await resend.contacts.create({
            email,
            firstName,
            lastName,
          });
          resendId = data?.id;
        } catch (err) {
          console.error(`Resend error for ${email}:`, err);
        }

        // 2. Create/Update in DB
        await prisma.contact.upsert({
          where: { email },
          update: {
            firstName,
            lastName,
            resendId, // Update resendId if we got it
          },
          create: {
            email,
            firstName,
            lastName,
            resendId,
          },
        });

        successCount++;
      } catch (err) {
        console.error(`DB error for ${email}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({ success: true, successCount, errorCount });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
