import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount } = body;
    const numAmount = Number(amount);

    console.log("POST /api/recharge - incoming data:", { userId, amount, numAmount });

    if (!userId || isNaN(numAmount)) {
      return NextResponse.json({ 
        error: "Missing or invalid required fields",
        received: { userId, amount }
      }, { status: 400 });
    }

    // Try to find merchant profile by userId
    const merchantExists = await prisma.merchantProfile.findUnique({
      where: { userId },
    });

    if (!merchantExists) {
      console.error("Merchant profile not found for userId:", userId);
      return NextResponse.json({ 
        error: "Merchant profile not found",
        details: `No merchant profile found for userId: ${userId}`
      }, { status: 404 });
    }

    const merchant = await prisma.merchantProfile.update({
      where: { userId },
      data: {
        balance: merchantExists.balance + numAmount,
      },
    });

    return NextResponse.json(merchant);
  } catch (error) {
    console.error("Recharge API detailed error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
