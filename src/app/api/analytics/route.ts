import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantIdOrUserIdFromQuery = searchParams.get("merchantId");
    const session = await getServerSession(authOptions);
    const userIdFromSession = (session?.user as any)?.id as string | undefined;
    const roleFromSession = (session?.user as any)?.role as string | undefined;

    const merchantIdOrUserId = merchantIdOrUserIdFromQuery || userIdFromSession;

    if (!merchantIdOrUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (roleFromSession && roleFromSession !== "MERCHANT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const merchantProfile =
      (await prisma.merchantProfile.findUnique({
        where: { id: merchantIdOrUserId },
      })) ||
      (await prisma.merchantProfile.findUnique({
        where: { userId: merchantIdOrUserId },
      }));

    if (!merchantProfile) {
      return NextResponse.json(
        {
          error: "Merchant profile not found",
          details: `Could not find merchantProfile by id or userId: ${merchantIdOrUserId}`,
        },
        { status: 404 }
      );
    }

    const merchantId = merchantProfile.id;

    // 1. Fetch all performance data for this merchant's campaigns
    const performance = await prisma.performanceData.findMany({
      where: {
        application: {
          campaign: {
            merchantId
          }
        }
      },
      include: {
        application: {
          include: {
            campaign: true,
            influencer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    // 2. Fetch all campaigns to calculate total budget
    const campaigns = await prisma.campaign.findMany({
      where: { merchantId },
      select: {
        id: true,
        platform: true,
        budget: true,
        createdAt: true,
      },
    });

    const totalBudget = campaigns.reduce((acc: number, c: any) => acc + c.budget, 0);
    const totalClicks = performance.reduce((acc: number, p: any) => acc + p.clicks, 0);
    const totalConversions = performance.reduce((acc: number, p: any) => acc + p.conversions, 0);
    const totalGMV = performance.reduce((acc: number, p: any) => acc + p.gmv, 0);

    const averageROI = totalBudget > 0 ? (totalGMV / totalBudget).toFixed(1) : "0";
    const cpa = totalConversions > 0 ? (totalBudget / totalConversions).toFixed(1) : "0";

    // 3. Platform distribution
    const platformData: Record<string, { gmv: number; count: number }> = {};
    if (performance.length > 0) {
      performance.forEach((p: any) => {
        const platform = p.application.campaign.platform;
        if (!platformData[platform]) {
          platformData[platform] = { gmv: 0, count: 0 };
        }
        platformData[platform].gmv += p.gmv;
        platformData[platform].count += 1;
      });
    } else {
      campaigns.forEach((c: any) => {
        const platform = c.platform;
        if (!platformData[platform]) {
          platformData[platform] = { gmv: 0, count: 0 };
        }
        platformData[platform].count += 1;
      });
    }

    const totalPlatformCount = Object.values(platformData).reduce((acc, v) => acc + v.count, 0);
    const platformDistribution = Object.entries(platformData).map(([name, d]) => ({
      name,
      val:
        totalGMV > 0
          ? Math.round((d.gmv / totalGMV) * 100)
          : totalPlatformCount > 0
            ? Math.round((d.count / totalPlatformCount) * 100)
            : 0,
      gmv: d.gmv,
    }));

    // 4. Top Influencers (by GMV)
    const influencerMap: Record<string, { name: string, gmv: number, avatar: string | null, roi: number }> = {};
    performance.forEach((p: any) => {
      const influencer = p.application.influencer;
      const id = influencer.id;
      if (!influencerMap[id]) {
        influencerMap[id] = { 
          name: influencer.user.name, 
          gmv: 0, 
          avatar: influencer.avatar,
          roi: 0 
        };
      }
      influencerMap[id].gmv += p.gmv;
    });

    const topInfluencers = Object.values(influencerMap)
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5);

    // 5. Recent Activity
    const recentActivity = performance
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        influencer: p.application.influencer.user.name,
        campaign: p.application.campaign.title,
        gmv: p.gmv,
        time: p.updatedAt
      }));

    const formatKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const formatLabel = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const seriesDays = 12;
    const seriesKeyToIndex = new Map<string, number>();
    const gmvSeries = Array.from({ length: seriesDays }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (seriesDays - 1 - idx));
      const key = formatKey(d);
      seriesKeyToIndex.set(key, idx);
      return {
        key,
        label: formatLabel(d),
        gmv: 0,
      };
    });

    performance.forEach((p: any) => {
      const updatedAt = new Date(p.updatedAt);
      updatedAt.setHours(0, 0, 0, 0);
      const key = formatKey(updatedAt);
      const idx = seriesKeyToIndex.get(key);
      if (idx === undefined) return;
      gmvSeries[idx].gmv += p.gmv || 0;
    });

    return NextResponse.json({
      merchantId,
      campaignsCount: campaigns.length,
      performanceCount: performance.length,
      totalClicks,
      totalConversions,
      totalGMV,
      totalBudget,
      averageROI,
      cpa,
      gmvSeries: gmvSeries.map(({ label, gmv }) => ({ label, gmv })),
      platformDistribution,
      topInfluencers,
      recentActivity
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
