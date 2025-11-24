import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    // Delete all events
    await prisma.event.deleteMany({});

    // Create proper seed event
    await prisma.event.create({
      data: {
        title: "Christmas Party 2025",
        description:
          "Célébrez Noël avec le BDE FEN'SUP ! Une soirée inoubliable vous attend. Tenue correcte exigée.",
        date: new Date("2025-12-20T20:00:00"),
        location: "Lieu Secret, Paris",
        price: 8.0,
        memberPrice: 5.0,
        externalPaymentLink: "https://BDE-FENSUP.short.gy/Christmas-Party-8-€",
        externalMemberPaymentLink:
          "https://BDE-FENSUP.short.gy/Christmas-Party-5-€",
        maxSeats: 150,
        image:
          "https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&q=80&w=1000",
      },
    });

    return NextResponse.json({ message: "Database cleaned and seeded!" });
  } catch (error) {
    console.error("Error reseeding:", error);
    return NextResponse.json({ error: "Failed to reseed" }, { status: 500 });
  }
}
