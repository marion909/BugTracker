import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isOffline } = body;

    // Wenn Version offline geht, erstelle neue OfflinePeriod
    if (isOffline) {
      await prisma.offlinePeriod.create({
        data: {
          versionId: id,
          offlineDate: new Date(),
        },
      });
    } else {
      // Wenn Version wieder online geht, setze onlineDate der letzten Periode
      const lastOfflinePeriod = await prisma.offlinePeriod.findFirst({
        where: {
          versionId: id,
          onlineDate: null,
        },
        orderBy: {
          offlineDate: 'desc',
        },
      });

      if (lastOfflinePeriod) {
        await prisma.offlinePeriod.update({
          where: { id: lastOfflinePeriod.id },
          data: { onlineDate: new Date() },
        });
      }
    }

    const updatedVersion = await prisma.version.update({
      where: { id },
      data: { isOffline },
    });

    return NextResponse.json(updatedVersion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update version' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.version.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete version' }, { status: 500 });
  }
}
