import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const merchantProfileSchema = z.object({
  brandName: z.string().min(1),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

const influencerProfileSchema = z.object({
  bio: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  platforms: z.string().optional().nullable(),
  followerCount: z.coerce.number().int().nonnegative().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        merchantProfile: true,
        influencerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const body = await req.json();
    console.log("PATCH /api/profile body:", body);

    if (role === "MERCHANT") {
      const validatedData = merchantProfileSchema.parse(body);
      await prisma.merchantProfile.upsert({
        where: { userId },
        create: {
          userId,
          brandName: validatedData.brandName,
          industry: validatedData.industry,
          website: validatedData.website,
          description: validatedData.description,
          avatar: validatedData.avatar,
        },
        update: {
          brandName: validatedData.brandName,
          industry: validatedData.industry,
          website: validatedData.website,
          description: validatedData.description,
          avatar: validatedData.avatar,
        },
      });
    } else if (role === "INFLUENCER") {
      const validatedData = influencerProfileSchema.parse(body);
      await prisma.influencerProfile.upsert({
        where: { userId },
        create: {
          userId,
          bio: validatedData.bio,
          avatar: validatedData.avatar,
          tags: validatedData.tags,
          platforms: validatedData.platforms,
          followerCount: validatedData.followerCount || 0,
        },
        update: {
          bio: validatedData.bio,
          avatar: validatedData.avatar,
          tags: validatedData.tags,
          platforms: validatedData.platforms,
          followerCount: validatedData.followerCount || 0,
        },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod validation error:", error.errors);
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("PATCH /api/profile detailed error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
