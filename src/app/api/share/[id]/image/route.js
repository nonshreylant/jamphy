import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new NextResponse('Missing ID', { status: 400 });
    }

    const sharedImage = await prisma.sharedImage.findUnique({
      where: { id },
    });

    if (!sharedImage) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // imageData will typically look like "data:image/png;base64,iVBORw0KGgo..."
    // We need to strip the prefix to get the raw base64 string
    const matches = sharedImage.imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    let buffer;
    let mimeType = 'image/png';
    
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      // Fallback in case it was saved without the prefix
      buffer = Buffer.from(sharedImage.imageData, 'base64');
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving shared image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
