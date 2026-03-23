import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const roiSchema = z.object({
  clicks: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
  gmv: z.number().nonnegative(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const body = await req.json();
    const validatedData = roiSchema.parse(body);

    const performance = await prisma.performanceData.upsert({
      where: { applicationId },
      update: validatedData,
      create: {
        applicationId,
        ...validatedData,
      },
    });

    return NextResponse.json(performance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Failed to update ROI data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
