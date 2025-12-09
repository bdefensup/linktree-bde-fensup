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

  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { campaigns: true },
      },
    },
  });

  return NextResponse.json(segments);
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
    const { name, query } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const segment = await prisma.segment.create({
      data: {
        name,
        query: query || {}, // Default to empty query (all contacts?) or specific structure
      },
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Create segment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
