import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const adminCookie = req.cookies.get("admin_session");
    const isCookieAdmin = adminCookie && adminCookie.value === "authenticated";

    const session = await getServerSession(authOptions);
    const isGoogleAdmin = session?.user?.email === "jamphy.admin@gmail.com";

    if (!isCookieAdmin && !isGoogleAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, block } = await req.json();

    if (!userId || typeof block !== 'boolean') {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: block }
    });

    return NextResponse.json({ success: true, isBlocked: updatedUser.isBlocked });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
