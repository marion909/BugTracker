# Bug Tracker

Ein modernes Bug-Tracking-System für Versionen und Bugs mit umfangreichen Statistiken.

## Features

- ✅ **Versions-Management**: Erstellen und verwalten von Software-Versionen mit Datum und Uhrzeit
- 🐛 **Bug-Tracking**: Bugs mit Titel, Beschreibung und 3-Zeichen Developer-Kürzel
- 📊 **Statistik-Dashboard**:
  - Version mit den meisten Bugs
  - Top Developer-Rankings (nach verursachten Bugs)
  - Kürzeste Offline-Periode
  - Gesamtstatistiken
- 🔄 **Offline/Online-Tracking**: Versionen können offline genommen und wieder online gebracht werden
- 📅 **Offline-Historie**: Vollständige Historie aller Offline-Perioden mit präziser Zeitangabe
- 📱 **Mobile Responsive**: Funktioniert auf allen Bildschirmgrößen
- ⌨️ **Keyboard-freundlich**: Vollständige Tastaturunterstützung
- 🌓 **Dark Mode**: Automatische Dark Mode Unterstützung

## Technologie-Stack

- **Framework**: Next.js 15 (App Router)
- **Sprache**: TypeScript
- **Datenbank**: SQLite mit Prisma ORM
- **Styling**: Tailwind CSS
- **Datum-Handling**: date-fns

## Installation

```bash
# Dependencies installieren
npm install

# Datenbank einrichten
npx prisma generate
npx prisma db push

# Development Server starten
npm run dev
```

Die Anwendung läuft dann auf [http://localhost:3000](http://localhost:3000)

## Datenbank Schema

### Version
- Version-Nummer (eindeutig)
- Veröffentlichungsdatum mit Uhrzeit
- Offline-Status
- Zugehörige Bugs
- Offline-Perioden Historie

### Bug
- Titel
- Beschreibung
- Developer-Kürzel (3 Zeichen)
- Zugehörige Version

### OfflinePeriod
- Offline-Datum mit Uhrzeit
- Online-Datum mit Uhrzeit (null wenn aktuell offline)
- Zugehörige Version

## Features im Detail

### Zeiterfassung
- Versionen können mit präzisem Datum und Uhrzeit erfasst werden
- Offline-Perioden werden in Minuten, Stunden oder Tagen angezeigt:
  - Unter 1 Stunde: `45m`
  - Unter 1 Tag: `3h 25m`
  - Ab 1 Tag: `2d 5h`

### Statistiken
- **Version mit meisten Bugs**: Zeigt die problematischste Version
- **Top Developer**: Ranking nach verursachten Bugs
- **Kürzeste Offline-Periode**: Zeigt die Version mit der kürzesten Downtime
- **Gesamtübersicht**: Anzahl Bugs, Versionen und aktive Versionen

## Scripts

```bash
npm run dev      # Development Server
npm run build    # Production Build
npm start        # Production Server
npm run lint     # Linting
```

## Projekt-Struktur

```
app/
├── api/
│   ├── bugs/
│   │   ├── route.ts           # GET/POST Bugs
│   │   └── [id]/route.ts      # DELETE Bug
│   ├── versions/
│   │   ├── route.ts           # GET/POST Versionen
│   │   └── [id]/route.ts      # PATCH/DELETE Version
│   └── stats/
│       └── route.ts           # Statistiken
├── page.tsx                   # Haupt-UI
├── layout.tsx                 # Root Layout
└── globals.css               # Global Styles

lib/
└── prisma.ts                 # Prisma Client

prisma/
├── schema.prisma             # Datenbank Schema
└── dev.db                    # SQLite Datenbank
```

## Lizenz

MIT

## Autor

marion909
