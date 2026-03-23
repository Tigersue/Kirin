import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const applicationSchema = z.object({
  influencerId: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    // Check if campaign exists and is open
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.status !== "OPEN") {
      return NextResponse.json({ error: "Campaign not found or closed" }, { status: 404 });
    }

    // Resolve influencerId: accept either influencerProfile.id or user.id
    const influencerProfile =
      (await prisma.influencerProfile.findUnique({
        where: { id: validatedData.influencerId },
      })) ||
      (await prisma.influencerProfile.findUnique({
        where: { userId: validatedData.influencerId },
      }));

    if (!influencerProfile) {
      return NextResponse.json(
        {
          error: "Influencer profile not found",
          details: `Could not find influencerProfile by id or userId: ${validatedData.influencerId}`,
        },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        campaignId,
        influencerId: influencerProfile.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        campaignId,
        influencerId: influencerProfile.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to submit application:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
