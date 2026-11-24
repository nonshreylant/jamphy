import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields." },
        { status: 400 }
      );
    }

    const paymentRecord = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment order not found." }, { status: 404 });
    }

    if (paymentRecord.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          isPro: true,
          proPurchasedAt: now,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      isPro: true,
      proPurchasedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment. Please contact support if charged." },
      { status: 500 }
    );
  }
}

