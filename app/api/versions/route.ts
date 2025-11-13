import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const versions = await prisma.version.findMany({
      include: {
        bugs: true,
        offlinePeriods: {
          orderBy: {
            offlineDate: 'desc',
          },
        },
      },
      orderBy: {
        releaseDate: 'desc',
      },
    });
    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { version, releaseDate } = body;

    if (!version || !releaseDate) {
      return NextResponse.json(
        { error: 'Version and releaseDate are required' },
        { status: 400 }
      );
    }

    const newVersion = await prisma.version.create({
      data: {
        version,
        releaseDate: new Date(releaseDate),
      },
    });

    return NextResponse.json(newVersion);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Version already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}
