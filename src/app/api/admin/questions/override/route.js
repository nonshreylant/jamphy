import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { syllabus } from "@/data/syllabus";

export const dynamic = "force-dynamic";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("admin_session");
    const isCookieAdmin = adminCookie && adminCookie.value === "authenticated";
    const isGoogleAdmin = isAdminEmail(session?.user?.email);

    if (!isGoogleAdmin && !isCookieAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      questionKey,
      questionId,
      subjectId,
      subject,
      subSubtopic,
      difficulty,
      marks,
    } = body || {};

    if (!questionKey || typeof questionKey !== "string") {
      return NextResponse.json({ error: "Missing questionKey." }, { status: 400 });
    }

    const subjectEntry = syllabus.find((s) => s.id === subjectId);
    if (!subjectEntry) {
      return NextResponse.json({ error: "Invalid subject selected." }, { status: 400 });
    }

    if (!subject || !subjectEntry.subtopics.includes(subject)) {
      return NextResponse.json(
        { error: "Selected subtopic does not belong to the selected subject." },
        { status: 400 }
      );
    }

    const validSubSubtopics = subjectEntry.subSubtopics?.[subject] || [];
    const normalizedSubSubtopic =
      subSubtopic && validSubSubtopics.includes(subSubtopic) ? subSubtopic : null;

    const validDifficulties = new Set(["Easy", "Medium", "Hard"]);
    const normalizedDifficulty =
      difficulty && validDifficulties.has(difficulty) ? difficulty : null;

    const parsedMarks =
      marks !== undefined && marks !== null && marks !== ""
        ? Number(marks)
        : null;
    const normalizedMarks =
      parsedMarks === 1 || parsedMarks === 2 ? parsedMarks : null;

    const override = await prisma.questionOverride.upsert({
      where: { questionKey },
      update: {
        subjectId: subjectEntry.id,
        subject,
        subSubtopic: normalizedSubSubtopic,
        difficulty: normalizedDifficulty,
        marks: normalizedMarks,
        updatedBy: session?.user?.email || "admin",
      },
      create: {
        questionKey,
        subjectId: subjectEntry.id,
        subject,
        subSubtopic: normalizedSubSubtopic,
        difficulty: normalizedDifficulty,
        marks: normalizedMarks,
        updatedBy: session?.user?.email || "admin",
      },
    });

    // If this question also exists as a DB Question row (cuid), sync its subject too
    if (questionId && typeof questionId === "string") {
      await prisma.question
        .updateMany({
          where: { id: questionId },
          data: { subject },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      override: {
        questionKey: override.questionKey,
        subjectId: override.subjectId,
        subject: override.subject,
        subSubtopic: override.subSubtopic,
        difficulty: override.difficulty,
        marks: override.marks,
      },
    });
  } catch (error) {
    console.error("Error updating question override:", error);
    return NextResponse.json(
      { error: "Failed to save question changes." },
      { status: 500 }
    );
  }
}
