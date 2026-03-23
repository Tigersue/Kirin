import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const influencers = await prisma.influencerProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(influencers);
  } catch (error) {
    console.error("Failed to fetch influencers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
