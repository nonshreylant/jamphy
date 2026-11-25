import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [dbQuestions, dbOverrides] = await Promise.all([
      prisma.question.findMany({
        where: { status: "APPROVED" },
      }),
      prisma.questionOverride.findMany(),
    ]);

    const formatted = dbQuestions.map((q) => ({
      ...q,
      year: Number(q.year) || q.year,
      image: q.imageUrl || q.image || null,
    }));

    const overrides = {};
    for (const item of dbOverrides) {
      overrides[item.questionKey] = {
        questionKey: item.questionKey,
        subjectId: item.subjectId,
        subject: item.subject,
        subSubtopic: item.subSubtopic,
        difficulty: item.difficulty,
        marks: item.marks,
      };
    }

    return NextResponse.json({ questions: formatted, overrides });
  } catch (error) {
    console.error("Error fetching approved questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
