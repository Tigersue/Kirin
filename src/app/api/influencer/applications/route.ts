import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const influencerIdOrUserIdFromQuery = searchParams.get("influencerId");
    const session = await getServerSession(authOptions);
    const userIdFromSession = (session?.user as any)?.id as string | undefined;

    const influencerIdOrUserId = influencerIdOrUserIdFromQuery || userIdFromSession;

    if (!influencerIdOrUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const influencerProfile =
      (await prisma.influencerProfile.findUnique({
        where: { id: influencerIdOrUserId },
      })) ||
      (await prisma.influencerProfile.findUnique({
        where: { userId: influencerIdOrUserId },
      }));

    if (!influencerProfile) {
      return NextResponse.json(
        {
          error: "Influencer profile not found",
          details: `Could not find influencerProfile by id or userId: ${influencerIdOrUserId}`,
        },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { influencerId: influencerProfile.id },
      include: {
        campaign: {
          include: {
            merchant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch influencer applications:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
