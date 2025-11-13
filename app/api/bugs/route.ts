import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const bugs = await prisma.bug.findMany({
      include: {
        version: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(bugs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bugs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, developerCode, versionId } = body;

    if (!title || !description || !developerCode || !versionId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (developerCode.length !== 3) {
      return NextResponse.json(
        { error: 'Developer code must be exactly 3 characters' },
        { status: 400 }
      );
    }

    const newBug = await prisma.bug.create({
      data: {
        title,
        description,
        developerCode: developerCode.toUpperCase(),
        versionId,
      },
      include: {
        version: true,
      },
    });

    return NextResponse.json(newBug);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bug' }, { status: 500 });
  }
}
