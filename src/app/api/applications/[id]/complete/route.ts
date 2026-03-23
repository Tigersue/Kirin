import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const applicationData = await prisma.application.findUnique({
      where: { id },
      include: {
        campaign: true,
        influencer: true,
      },
    });

    if (!applicationData) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (applicationData.paymentStatus !== "ESCROW") {
      return NextResponse.json({ error: "No funds in escrow for this application" }, { status: 400 });
    }

    // Release funds to influencer
    await prisma.influencerProfile.update({
      where: { id: applicationData.influencerId },
      data: {
        balance: applicationData.influencer.balance + applicationData.campaign.budget,
      },
    });

    const application = await prisma.application.update({
      where: { id },
      data: { 
        status: "COMPLETED",
        paymentStatus: "PAID",
      },
      include: {
        campaign: true,
        influencer: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create notification for influencer
    await prisma.notification.create({
      data: {
        userId: application.influencer.userId,
        title: "佣金已到账",
        content: `“${application.campaign.title}” 活动已结案，佣金 ¥${application.campaign.budget} 已进入您的账户余额。`,
        type: "SUCCESS",
        link: `/influencer/dashboard`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to complete application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
