'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

type Version = {
  id: string;
  version: string;
  releaseDate: string;
  isOffline: boolean;
  bugs: Bug[];
  offlinePeriods?: Array<{
    id: string;
    offlineDate: string;
    onlineDate: string | null;
  }>;
};

type Bug = {
  id: string;
  title: string;
  description: string;
  developerCode: string;
  versionId: string;
};

type Stats = {
  versionWithMostBugs: { version: string; bugCount: number } | null;
  topDevelopers: Array<{ code: string; count: number }>;
  shortestVersion: { version: string; duration: string } | null;
  totalBugs: number;
  totalVersions: number;
  activeVersions: number;
};

export default function Home() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('');
  
  // Form states
  const [versionNumber, setVersionNumber] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [developerCode, setDeveloperCode] = useState('');

  useEffect(() => {
    fetchVersions();
    fetchStats();
  }, []);

  const fetchVersions = async () => {
    const res = await fetch('/api/versions');
    const data = await res.json();
    setVersions(data);
  };

  // Helper: Berechne Gesamtzeit offline für eine Version
  const getTotalOfflineTime = (offlinePeriods?: Version['offlinePeriods']) => {
    if (!offlinePeriods || offlinePeriods.length === 0) return 0;
    
    return offlinePeriods.reduce((total, period) => {
      if (period.onlineDate) {
        const duration = new Date(period.onlineDate).getTime() - new Date(period.offlineDate).getTime();
        return total + duration;
      }
      return total;
    }, 0);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: versionNumber,
        releaseDate: new Date(releaseDate).toISOString(),
      }),
    });
    setVersionNumber('');
    setReleaseDate('');
    setShowVersionForm(false);
    fetchVersions();
    fetchStats();
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/bugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: bugTitle,
        description: bugDescription,
        developerCode: developerCode.toUpperCase(),
        versionId: selectedVersion,
      }),
    });
    setBugTitle('');
    setBugDescription('');
    setDeveloperCode('');
    setShowBugForm(false);
    fetchVersions();
    fetchStats();
  };

  const handleToggleOffline = async (versionId: string, currentStatus: boolean) => {
    await fetch(`/api/versions/${versionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOffline: !currentStatus }),
    });
    fetchVersions();
    fetchStats();
  };

  const handleDeleteBug = async (bugId: string) => {
    await fetch(`/api/bugs/${bugId}`, { method: 'DELETE' });
    fetchVersions();
    fetchStats();
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (confirm('Version und alle Bugs löschen?')) {
      await fetch(`/api/versions/${versionId}`, { method: 'DELETE' });
      fetchVersions();
      fetchStats();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            🐛 Bug Ranking
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Version- und Bug-Tracking System
          </p>
        </header>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                VERSION MIT MEISTEN BUGS
              </h3>
              {stats.versionWithMostBugs ? (
                <>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats.versionWithMostBugs.version}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {stats.versionWithMostBugs.bugCount} Bugs
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Keine Daten</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                TOP DEVELOPER (BUGS)
              </h3>
              {stats.topDevelopers.length > 0 ? (
                <div className="space-y-1">
                  {stats.topDevelopers.slice(0, 3).map((dev, idx) => (
                    <div key={dev.code} className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                        {idx + 1}. {dev.code}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {dev.count} Bugs
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Keine Daten</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                KÜRZESTE ONLINE-PERIODE
              </h3>
              {stats.shortestVersion ? (
                <>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {stats.shortestVersion.version}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {stats.shortestVersion.duration}
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Keine Daten</p>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">GESAMT BUGS</h3>
              <p className="text-4xl font-bold">{stats.totalBugs}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">VERSIONEN</h3>
              <p className="text-4xl font-bold">{stats.totalVersions}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-sm font-semibold mb-2 opacity-90">AKTIVE VERSIONEN</h3>
              <p className="text-4xl font-bold">{stats.activeVersions}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowVersionForm(!showVersionForm)}
            onKeyDown={(e) => e.key === 'Enter' && setShowVersionForm(!showVersionForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            ➕ Neue Version
          </button>
          <button
            onClick={() => setShowBugForm(!showBugForm)}
            onKeyDown={(e) => e.key === 'Enter' && setShowBugForm(!showBugForm)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
            disabled={versions.length === 0}
          >
            🐛 Neuer Bug
          </button>
        </div>

        {/* Version Form */}
        {showVersionForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 mb-8 border-2 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Neue Version erstellen
            </h2>
            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowVersionForm(false)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="z.B. 1.0.0"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Veröffentlichungsdatum und Uhrzeit
                </label>
                <input
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Erstellen
                </button>
                <button
                  type="button"
                  onClick={() => setShowVersionForm(false)}
                  className="px-6 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-100 font-semibold rounded-lg transition-all"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bug Form */}
        {showBugForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 mb-8 border-2 border-red-500">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Neuen Bug hinzufügen
            </h2>
            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Version auswählen
                </label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-slate-100"
                  required
                  autoFocus
                >
                  <option value="">-- Version wählen --</option>
                  {versions.filter(v => !v.isOffline).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bug Titel
                </label>
                <input
                  type="text"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowBugForm(false)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Kurzer Titel"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-slate-100 h-24"
                  placeholder="Detaillierte Beschreibung"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Developer Kürzel (3 Zeichen)
                </label>
                <input
                  type="text"
                  value={developerCode}
                  onChange={(e) => setDeveloperCode(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:text-slate-100 font-mono uppercase"
                  placeholder="ABC"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
                >
                  Bug hinzufügen
                </button>
                <button
                  type="button"
                  onClick={() => setShowBugForm(false)}
                  className="px-6 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-100 font-semibold rounded-lg transition-all"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Versions List */}
        <div className="space-y-6">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-all ${
                version.isOffline ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    Version {version.version}
                    {version.isOffline && (
                      <span className="ml-3 text-sm font-normal bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full">
                        OFFLINE
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Veröffentlicht: {format(new Date(version.releaseDate), 'dd.MM.yyyy HH:mm')} Uhr
                    {version.isOffline && version.offlinePeriods && version.offlinePeriods.length > 0 && (
                      <> • Offline seit: {format(new Date(version.offlinePeriods[version.offlinePeriods.length - 1].offlineDate), 'dd.MM.yyyy HH:mm')}</>
                    )}
                    {version.offlinePeriods && version.offlinePeriods.length > 0 && (
                      <> • {version.offlinePeriods.length} Offline-Periode{version.offlinePeriods.length > 1 ? 'n' : ''}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleOffline(version.id, version.isOffline)}
                    onKeyDown={(e) => e.key === 'Enter' && handleToggleOffline(version.id, version.isOffline)}
                    className={`px-4 py-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-4 ${
                      version.isOffline
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-300 text-white'
                    }`}
                  >
                    {version.isOffline ? '🔄 Online' : '🔻 Offline'}
                  </button>
                  <button
                    onClick={() => handleDeleteVersion(version.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Offline History */}
              {version.offlinePeriods && version.offlinePeriods.length > 0 && (
                <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    📅 Offline-Historie ({version.offlinePeriods.length})
                  </h4>
                  <div className="space-y-2">
                    {version.offlinePeriods.map((period) => (
                      <div key={period.id} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          period.onlineDate 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        }`}>
                          {period.onlineDate ? '✓ Beendet' : '⏳ Aktuell'}
                        </span>
                        <span>
                          Offline: {format(new Date(period.offlineDate), 'dd.MM.yyyy HH:mm')}
                          {period.onlineDate && (
                            <> → Online: {format(new Date(period.onlineDate), 'dd.MM.yyyy HH:mm')}
                            <span className="ml-2 font-semibold">
                              ({(() => {
                                const duration = new Date(period.onlineDate).getTime() - new Date(period.offlineDate).getTime();
                                const days = Math.floor(duration / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                                
                                if (days > 0) {
                                  return `${days}d ${hours}h ${minutes}m`;
                                } else if (hours > 0) {
                                  return `${hours}h ${minutes}m`;
                                } else {
                                  return `${minutes}m`;
                                }
                              })()})
                            </span>
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bugs List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                  Bugs ({version.bugs.length})
                </h4>
                {version.bugs.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 italic">Keine Bugs</p>
                ) : (
                  version.bugs.map((bug) => (
                    <div
                      key={bug.id}
                      className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {bug.developerCode}
                          </span>
                          <h5 className="font-semibold text-slate-800 dark:text-slate-100">
                            {bug.title}
                          </h5>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {bug.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteBug(bug.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDeleteBug(bug.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded transition-all focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Löschen
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {versions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-slate-500 dark:text-slate-400 mb-4">
              Keine Versionen vorhanden
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Erstellen Sie eine neue Version, um zu beginnen!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
