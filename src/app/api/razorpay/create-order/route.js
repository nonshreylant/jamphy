import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  getRazorpayClient,
  getRazorpayKeyId,
  IS_PAYWALL_ENABLED,
  isFreeProEmail,
  PRO_PLAN_CODE,
  PRO_PLAN_CURRENCY,
  PRO_PLAN_PRICE_PAISE,
} from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (!IS_PAYWALL_ENABLED) {
      return NextResponse.json({ error: "Payments are currently disabled." }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, isPro: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.isPro || isFreeProEmail(user.email)) {
      return NextResponse.json({ error: "You already have Jamphy Pro access." }, { status: 400 });
    }

    if (PRO_PLAN_PRICE_PAISE < 100) {
      return NextResponse.json(
        { error: "Order amount must be at least 100 paise." },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();
    const receipt = `jp_${user.id.slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: PRO_PLAN_PRICE_PAISE,
      currency: PRO_PLAN_CURRENCY,
      receipt,
      notes: {
        userId: user.id,
        email: user.email || "",
        plan: PRO_PLAN_CODE,
      },
    });

    await prisma.payment.create({
      data: {
        userId: user.id,
        razorpayOrderId: order.id,
        amount: PRO_PLAN_PRICE_PAISE,
        currency: PRO_PLAN_CURRENCY,
        status: "CREATED",
        plan: PRO_PLAN_CODE,
      },
    });

    return NextResponse.json({
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      user: {
        name: user.name || "",
        email: user.email || "",
      },
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    if (error?.statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Check your API credentials." },
        { status: 401 }
      );
    }
    const message =
      error?.message?.includes("Razorpay keys are not configured")
        ? error.message
        : "Failed to initiate payment order. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

