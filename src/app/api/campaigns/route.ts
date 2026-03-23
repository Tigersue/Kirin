import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  platform: z.string().min(1),
  budget: z.number().positive(),
  deadline: z.string().pipe(z.coerce.date()),
  merchantId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("POST /api/campaigns body:", body);
    const validatedData = campaignSchema.parse(body);

    // 1. Verify if the merchant profile exists
    const merchant = await prisma.merchantProfile.findUnique({
      where: { id: validatedData.merchantId },
    });

    if (!merchant) {
      // If not found by id, try to find by userId (as some frontend might send userId)
      const merchantByUser = await prisma.merchantProfile.findUnique({
        where: { userId: validatedData.merchantId },
      });
      
      if (!merchantByUser) {
        return NextResponse.json({ 
          error: "Merchant profile not found", 
          details: `Could not find merchant with id or userId: ${validatedData.merchantId}` 
        }, { status: 404 });
      }
      
      // Update merchantId to the correct profile ID if found by userId
      validatedData.merchantId = merchantByUser.id;
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        platform: validatedData.platform,
        budget: validatedData.budget,
        deadline: validatedData.deadline,
        merchantId: validatedData.merchantId,
        status: "OPEN",
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to create campaign:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        merchant: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
