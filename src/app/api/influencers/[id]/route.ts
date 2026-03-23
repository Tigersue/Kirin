import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const influencer = await prisma.influencerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        applications: {
          where: { status: "COMPLETED" },
          include: {
            campaign: {
              include: {
                merchant: true
              }
            },
            performance: true
          }
        }
      }
    });

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    // Calculate aggregate performance
    const totalGMV = influencer.applications.reduce((acc: number, app: any) => acc + (app.performance?.gmv || 0), 0);
    const totalConversions = influencer.applications.reduce((acc: number, app: any) => acc + (app.performance?.conversions || 0), 0);
    const completedCampaigns = influencer.applications.length;

    return NextResponse.json({
      ...influencer,
      stats: {
        totalGMV,
        totalConversions,
        completedCampaigns,
      }
    });
  } catch (error) {
    console.error("Fetch influencer detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
