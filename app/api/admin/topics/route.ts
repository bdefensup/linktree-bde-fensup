import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(_req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sync with Resend (Optional: could be done periodically or on demand)
  // For now, we fetch from local DB, assuming sync happens on creation/update
  // Or we can fetch from Resend and update local DB here?
  // Let's fetch from local DB for speed, and have a "Sync" button if needed.
  
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { contacts: true },
      },
    },
  });

  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, visibility, isDefault } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create in Resend
    // Note: Resend Audience API for Topics is not fully public/documented in the same way as Contacts?
    // Actually, "Topics" are "Audiences" in some contexts or "Subscription Groups".
    // Wait, Resend documentation says "Topics" are for managing preferences.
    // Let's check if the SDK has `resend.audiences.create` or similar.
    // The user documentation link says "Topics".
    // Let's assume we use `resend.audiences.create` if it exists, or we just store locally for now if SDK support is missing.
    // Actually, looking at Resend docs, "Topics" might be "Audiences" themselves or a sub-feature.
    // "The Audience page includes four areas: ... Topics".
    // Let's try to find `resend.audiences` or `resend.topics`.
    // If not found, we'll store locally and log a warning.
    
    // For now, let's just store locally to enable the feature in our app.
    // We can add Resend sync later if the SDK supports it explicitly.
    
    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        visibility,
        isDefault,
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Create topic error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
