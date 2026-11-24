import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isFreeProEmail, IS_PAYWALL_ENABLED } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!IS_PAYWALL_ENABLED) {
      return NextResponse.json({ isPro: true, paywallEnabled: false }, { status: 200 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isPro: false }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        isPro: true,
        proPurchasedAt: true,
      },
    });

    return NextResponse.json({
      isPro: Boolean(user?.isPro) || isFreeProEmail(user?.email),
      proPurchasedAt: user?.proPurchasedAt || null,
    });
  } catch (error) {
    console.error("Error checking Pro status:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}

