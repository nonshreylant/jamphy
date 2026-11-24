import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!verifyWebhookSignature({ rawBody, signature })) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id || null;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const paymentRecord = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!paymentRecord) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentId || paymentRecord.razorpayPaymentId,
          },
        }),
        prisma.user.update({
          where: { id: paymentRecord.userId },
          data: {
            isPro: true,
            proPurchasedAt: new Date(),
          },
        }),
      ]);
    } else if (eventType === "payment.failed") {
      if (paymentRecord.status !== "PAID") {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: "FAILED",
            razorpayPaymentId: paymentId || paymentRecord.razorpayPaymentId,
          },
        });
      }
    } else if (eventType === "refund.created" || eventType === "payment.refunded") {
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "REFUNDED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

