import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const role = (session?.user as any)?.role as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            merchant: true,
          },
        },
        influencer: {
          include: {
            user: true,
          },
        },
        performance: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const canAccessAsInfluencer = application.influencer.userId === userId;
    const canAccessAsMerchant = application.campaign.merchant.userId === userId;

    if (role === "INFLUENCER") {
      if (!canAccessAsInfluencer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (role === "MERCHANT") {
      if (!canAccessAsMerchant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      if (!canAccessAsInfluencer && !canAccessAsMerchant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const applicationData = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: {
          include: {
            merchant: true,
          }
        },
      },
    });

    if (!applicationData) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (status === "ACCEPTED") {
      const budget = applicationData.campaign.budget;
      const merchant = applicationData.campaign.merchant;

      const merchantBalance = merchant.balance ?? 0;
      if (merchantBalance < budget) {
        return NextResponse.json(
          {
            error: "Insufficient balance for escrow",
            code: "INSUFFICIENT_BALANCE",
            details: {
              merchantBalance,
              requiredBudget: budget,
              shortfall: budget - merchantBalance,
            },
          },
          { status: 400 }
        );
      }

      // Deduct from merchant balance and put in escrow
      await prisma.merchantProfile.update({
        where: { id: merchant.id },
        data: {
          balance: merchantBalance - budget,
        },
      });

      await prisma.application.update({
        where: { id },
        data: { 
          status: "ACCEPTED",
          paymentStatus: "ESCROW",
        },
      });
    } else {
      await prisma.application.update({
        where: { id },
        data: { status: "REJECTED" },
      });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: true,
        influencer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }

    // Create notification for influencer
    await prisma.notification.create({
      data: {
        userId: application.influencer.userId,
        title: status === "ACCEPTED" ? "恭喜！申请已被录取" : "很抱歉，申请未通过",
        content: `您对活动 “${application.campaign.title}” 的申请已被品牌方处理。`,
        type: status === "ACCEPTED" ? "SUCCESS" : "INFO",
        link: `/campaigns/${application.campaignId}`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to update application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
