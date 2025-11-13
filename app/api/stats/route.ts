import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type VersionWithBugs = {
  id: string;
  version: string;
  releaseDate: Date;
  isOffline: boolean;
  bugs: Array<{ developerCode: string }>;
  offlinePeriods?: Array<{
    id: string;
    offlineDate: Date;
    onlineDate: Date | null;
  }>;
};

export async function GET() {
  try {
    const versions = await prisma.version.findMany({
      include: {
        bugs: true,
        offlinePeriods: true,
      },
    }) as VersionWithBugs[];

    // Version mit den meisten Bugs
    const versionWithMostBugs = versions.reduce((max: VersionWithBugs | null, version: VersionWithBugs) => {
      return version.bugs.length > (max?.bugs.length || 0) ? version : max;
    }, versions[0] || null);

    // Developer Rankings
    const developerStats = versions
      .flatMap((v: VersionWithBugs) => v.bugs)
      .reduce((acc: Record<string, number>, bug: { developerCode: string }) => {
        acc[bug.developerCode] = (acc[bug.developerCode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topDevelopers = Object.entries(developerStats)
      .map(([code, count]) => ({ code, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Kürzeste Online-Periode (Zeit zwischen Release und erstem Offline)
    type OnlinePeriodWithDuration = {
      version: string;
      durationMs: number;
      durationDisplay: string;
      releaseDate: Date;
      firstOfflineDate: Date;
    };

    const allOnlinePeriods: OnlinePeriodWithDuration[] = [];
    
    versions.forEach((v: VersionWithBugs) => {
      // Finde die erste Offline-Periode
      if (v.offlinePeriods && v.offlinePeriods.length > 0) {
        const firstOffline = v.offlinePeriods.reduce((earliest: any, period: any) => {
          return new Date(period.offlineDate) < new Date(earliest.offlineDate) ? period : earliest;
        }, v.offlinePeriods[0]);

        const duration = new Date(firstOffline.offlineDate).getTime() - new Date(v.releaseDate).getTime();
        
        if (duration > 0) {
          const days = Math.floor(duration / (1000 * 60 * 60 * 24));
          const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
          
          let durationDisplay = '';
          if (days > 0) {
            durationDisplay = `${days}d ${hours}h`;
          } else if (hours > 0) {
            durationDisplay = `${hours}h ${minutes}m`;
          } else {
            durationDisplay = `${minutes}m`;
          }
          
          allOnlinePeriods.push({
            version: v.version,
            durationMs: duration,
            durationDisplay,
            releaseDate: new Date(v.releaseDate),
            firstOfflineDate: new Date(firstOffline.offlineDate),
          });
        }
      }
    });

    const shortestPeriod = allOnlinePeriods.length > 0
      ? allOnlinePeriods.reduce((min, period) => 
          period.durationMs < min.durationMs ? period : min
        )
      : null;

    const stats = {
      versionWithMostBugs: versionWithMostBugs
        ? {
            version: versionWithMostBugs.version,
            bugCount: versionWithMostBugs.bugs.length,
          }
        : null,
      topDevelopers,
      shortestVersion: shortestPeriod
        ? {
            version: shortestPeriod.version,
            duration: shortestPeriod.durationDisplay,
          }
        : null,
      totalBugs: versions.reduce((sum: number, v: VersionWithBugs) => sum + v.bugs.length, 0),
      totalVersions: versions.length,
      activeVersions: versions.filter((v: VersionWithBugs) => !v.isOffline).length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
