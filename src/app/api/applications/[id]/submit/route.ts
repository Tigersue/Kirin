import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const submissionSchema = z.object({
  submissionUrl: z.string().url(),
  submissionScreenshot: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { submissionUrl, submissionScreenshot } = submissionSchema.parse(body);

    const application = await prisma.application.update({
      where: { id },
      data: { 
        submissionUrl,
        submissionScreenshot,
      },
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
      },
    });

    // Create notification for merchant
    await prisma.notification.create({
      data: {
        userId: application.campaign.merchant.userId,
        title: "作品已提交",
        content: `达人 ${application.influencer.user.name} 已为活动 “${application.campaign.title}” 提交了作品链接。`,
        type: "INFO",
        link: `/dashboard/campaigns/${application.campaignId}/applications`,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to submit work:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
