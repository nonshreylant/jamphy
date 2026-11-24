import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const PRO_PLAN_PRICE_INR = 499;
export const PRO_PLAN_PRICE_PAISE = PRO_PLAN_PRICE_INR * 100;
export const PRO_PLAN_CURRENCY = "INR";
export const PRO_PLAN_CODE = "PRO_LIFETIME";
export const PRO_PLAN_NAME = "Jamphy Pro Pass";
export const PRO_PLAN_DESCRIPTION = "One-time lifetime access to Custom Tests, Live Rooms, Analytics, Year-wise PYQs & All Filters";

let razorpayInstance = null;

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function getRazorpayClient() {
  const key_id = getRazorpayKeyId();
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment.");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayInstance;
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export function verifyWebhookSignature({ rawBody, signature }) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function isUserPro(userId) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return Boolean(user?.isPro);
}

