import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, imageData } = body;

    if (!id || !imageData) {
      return NextResponse.json({ error: 'Missing id or imageData' }, { status: 400 });
    }

    // Save to the database
    await prisma.sharedImage.create({
      data: {
        id,
        imageData,
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error in /api/share POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
