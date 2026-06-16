import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const dbQuestions = await prisma.question.findMany({
      where: { status: 'APPROVED' }
    });
    
    const formatted = dbQuestions.map(q => ({
      ...q,
      year: Number(q.year) || q.year,
      image: q.imageUrl || q.image || null
    }));

    return NextResponse.json({ questions: formatted });
  } catch (error) {
    console.error("Error fetching approved questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
