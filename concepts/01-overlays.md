# 🎨 Overlays (15 Tools)

> Visuelle On-Stream-Elemente für ein professionelles Streaming-Erlebnis

---

## T-OVL-001 — Smart Alert Director

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-OVL-001 |
| **Kategorie** | Overlays |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Streamer, Moderatoren |

### Problem & Lösung

**Problem:**  
Alerts (Follows, Subs, Cheers, Raids) kommen unkoordiniert und können wichtige Stream-Momente stören. Bei intensiven Spielszenen oder wichtigen Gesprächen unterbrechen laute Alerts den Flow.

**Lösung:**  
Ein intelligentes Queue-System priorisiert, bündelt und verzögert Alerts basierend auf Regeln, Kontext und Stream-Aktivität.

**Wertversprechen:**
- Für Streamer: Weniger Unterbrechungen, professionellerer Stream
- Für Moderatoren: Manuelle "Highlight-Momente" triggern
- Für Viewer: Klare, bedeutungsvolle Anerkennung

---

## 1. Aufbau (Architektur)

### 1.1 Systemübersicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Twitch EventSub                              │
│  (channel.follow, channel.subscribe, channel.cheer, channel.raid)   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Alert Director Service                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Ingest    │──│   Filter    │──│   Queue     │──│  Scheduler  │ │
│  │   Layer     │  │   Engine    │  │   Manager   │  │   Engine    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘ │
└─────────────────────────────────────────────────────────────┼───────┘
                                                              │
                               ┌──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Real-time Push (SSE)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Alert Overlay (Browser Source)                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Queue     │  │   Now       │  │   Animation │                  │
│  │   Display   │  │   Playing   │  │   Engine    │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Komponenten-Hierarchie

```
AlertDirector/
├── Dashboard/
│   ├── AlertDirectorPage.tsx         # Hauptseite
│   ├── AlertRulesEditor.tsx          # Regel-Editor
│   ├── AlertQueuePreview.tsx         # Queue-Vorschau
│   └── components/
│       ├── RuleBuilder.tsx           # Visueller Regel-Builder
│       ├── PriorityMatrix.tsx        # Prioritäts-Matrix
│       ├── CooldownSettings.tsx      # Cooldown-Einstellungen
│       ├── QuietHoursConfig.tsx      # Ruhezeiten
│       └── AlertTypeCard.tsx         # Alert-Typ-Konfiguration
│
├── Overlay/
│   ├── AlertDirectorOverlay.tsx      # Haupt-Overlay
│   ├── AlertCard.tsx                 # Einzelne Alert-Karte
│   ├── AlertQueue.tsx                # Queue-Anzeige
│   ├── RecapCard.tsx                 # Zusammenfassungs-Karte
│   └── animations/
│       ├── SlideIn.tsx
│       ├── PopIn.tsx
│       ├── Confetti.tsx
│       └── Glow.tsx
│
└── API/
    ├── route.ts                      # Config CRUD
    ├── queue/route.ts                # Queue Management
    └── events/route.ts               # SSE Endpoint
```

### 1.3 Datenfluss

```
1. Twitch Event empfangen
   └─▶ EventSub Webhook
       └─▶ Signatur verifizieren
           └─▶ Alert-Objekt erstellen

2. Alert verarbeiten
   └─▶ Filter prüfen (Quiet Hours, Blocklist)
       └─▶ Priorität berechnen
           └─▶ Merge-Window prüfen (ähnliche Events bündeln)
               └─▶ In Queue einfügen (sortiert nach Priorität)

3. Alert anzeigen
   └─▶ Scheduler prüft Queue
       └─▶ Cooldown abgelaufen?
           └─▶ Kontext-Check (Szene, Chat-Aktivität)
               └─▶ Via SSE an Overlay pushen
                   └─▶ Animation abspielen
                       └─▶ Optional: Sound abspielen
                           └─▶ Nach Duration: Nächster Alert
```

---

## 2. Logik (Business Logic)

### 2.1 Kernfunktionen

```typescript
interface AlertDirectorService {
  // Alert-Verarbeitung
  processIncomingEvent(event: TwitchEvent): Promise<Alert | null>;
  
  // Queue-Management
  enqueueAlert(alert: Alert): Promise<void>;
  dequeueNextAlert(): Promise<Alert | null>;
  peekQueue(): Promise<Alert[]>;
  
  // Steuerung
  pauseAlerts(userId: string, duration: number): Promise<void>;
  resumeAlerts(userId: string): Promise<void>;
  skipCurrentAlert(userId: string): Promise<void>;
  
  // Regeln
  evaluateRules(alert: Alert, rules: AlertRule[]): AlertDecision;
  calculatePriority(alert: Alert, config: AlertConfig): number;
  
  // Merge-Logik
  findMergeableAlerts(alert: Alert, window: number): Promise<Alert[]>;
  mergeAlerts(alerts: Alert[]): MergedAlert;
}
```

### 2.2 Prioritäts-Berechnung

```typescript
interface PriorityWeights {
  follow: number;      // Default: 10
  sub_tier1: number;   // Default: 50
  sub_tier2: number;   // Default: 75
  sub_tier3: number;   // Default: 100
  gifted_sub: number;  // Default: 60 + (count * 10)
  cheer: number;       // Default: bits / 10
  raid: number;        // Default: 80 + (viewers / 10)
}

function calculatePriority(alert: Alert, weights: PriorityWeights): number {
  let base = weights[alert.type] || 10;
  
  // Modifikatoren
  if (alert.isFirstTime) base *= 1.5;
  if (alert.user.isVIP) base *= 1.2;
  if (alert.user.isModerator) base *= 1.3;
  if (alert.hasMessage && alert.message.length > 50) base *= 1.1;
  
  // Decay über Zeit (ältere Alerts steigen in Priorität)
  const ageMinutes = (Date.now() - alert.createdAt) / 60000;
  base += Math.min(ageMinutes * 2, 20);
  
  return Math.round(base);
}
```

### 2.3 Merge-Logik

```typescript
interface MergeWindow {
  enabled: boolean;
  durationMs: number;  // z.B. 30000 (30 Sekunden)
  maxCount: number;    // z.B. 10 Alerts
  types: AlertType[];  // z.B. ['follow', 'sub_tier1']
}

function shouldMerge(
  newAlert: Alert,
  existingAlerts: Alert[],
  config: MergeWindow
): boolean {
  if (!config.enabled) return false;
  if (!config.types.includes(newAlert.type)) return false;
  
  const recentSameType = existingAlerts.filter(a => 
    a.type === newAlert.type &&
    a.createdAt > Date.now() - config.durationMs
  );
  
  return recentSameType.length > 0 && recentSameType.length < config.maxCount;
}

function mergeAlerts(alerts: Alert[]): MergedAlert {
  return {
    type: 'merged',
    originalType: alerts[0].type,
    count: alerts.length,
    users: alerts.map(a => a.user),
    totalValue: alerts.reduce((sum, a) => sum + (a.value || 0), 0),
    message: `${alerts.length} ${alerts[0].type}s!`,
    createdAt: alerts[0].createdAt
  };
}
```

### 2.4 Zustandsmaschine

```
┌──────────┐    enqueue     ┌──────────┐    schedule    ┌──────────┐
│  QUEUED  │───────────────▶│  PENDING │───────────────▶│ PLAYING  │
└──────────┘                └──────────┘                └────┬─────┘
     │                           │                          │
     │ merge                     │ skip                     │ complete
     ▼                           ▼                          ▼
┌──────────┐                ┌──────────┐              ┌──────────┐
│  MERGED  │                │ SKIPPED  │              │ COMPLETED│
└──────────┘                └──────────┘              └──────────┘
```

### 2.5 Validierung

```typescript
import { z } from 'zod';

export const AlertConfigSchema = z.object({
  // Basis
  enabled: z.boolean().default(true),
  
  // Prioritäts-Gewichte
  weights: z.object({
    follow: z.number().min(0).max(100).default(10),
    sub_tier1: z.number().min(0).max(100).default(50),
    sub_tier2: z.number().min(0).max(100).default(75),
    sub_tier3: z.number().min(0).max(100).default(100),
    gifted_sub: z.number().min(0).max(100).default(60),
    cheer: z.number().min(0).max(100).default(30),
    raid: z.number().min(0).max(100).default(80),
  }).default({}),
  
  // Timing
  alertDuration: z.number().min(1000).max(30000).default(5000),
  cooldown: z.number().min(0).max(60000).default(2000),
  
  // Merge
  mergeWindow: z.object({
    enabled: z.boolean().default(true),
    durationMs: z.number().min(5000).max(120000).default(30000),
    maxCount: z.number().min(2).max(50).default(10),
    types: z.array(z.enum(['follow', 'sub_tier1', 'sub_tier2', 'sub_tier3'])).default(['follow']),
  }).default({}),
  
  // Quiet Hours
  quietHours: z.object({
    enabled: z.boolean().default(false),
    suppressTypes: z.array(z.string()).default(['follow']),
    showRecap: z.boolean().default(true),
    recapInterval: z.number().min(60000).max(600000).default(300000),
  }).default({}),
  
  // Styling
  theme: z.enum(['default', 'minimal', 'gaming', 'custom']).default('default'),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).default('top-right'),
  animation: z.enum(['slide', 'pop', 'fade', 'bounce']).default('slide'),
  
  // Sound
  soundEnabled: z.boolean().default(true),
  soundVolume: z.number().min(0).max(100).default(50),
  customSounds: z.record(z.string()).optional(),
});

export type AlertConfig = z.infer<typeof AlertConfigSchema>;
```

---

## 3. Backend

### 3.1 Datenbankschema

```prisma
/// Alert Director Konfiguration
model AlertDirectorConfig {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Aktiviert/Deaktiviert
  enabled     Boolean  @default(true)
  
  /// Prioritäts-Gewichte (JSON)
  weights     Json     @default("{}")
  
  /// Timing-Einstellungen (ms)
  alertDuration Int    @default(5000)
  cooldown      Int    @default(2000)
  
  /// Merge-Konfiguration (JSON)
  mergeWindow Json     @default("{}")
  
  /// Quiet Hours (JSON)
  quietHours  Json     @default("{}")
  
  /// Styling
  theme       String   @default("default")
  position    String   @default("top-right")
  animation   String   @default("slide")
  
  /// Sound
  soundEnabled Boolean @default(true)
  soundVolume  Int     @default(50)
  
  /// Custom CSS
  customCss   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  /// Beziehungen
  queue       AlertQueue[]
  history     AlertHistory[]
  
  @@index([userId])
}

/// Alert Queue (aktive Alerts)
model AlertQueue {
  id          String   @id @default(cuid())
  configId    String
  config      AlertDirectorConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  /// Alert-Typ
  type        String
  
  /// Alert-Daten (JSON: user, message, value, etc.)
  data        Json
  
  /// Berechnete Priorität
  priority    Int
  
  /// Status: queued, pending, playing, completed, skipped, merged
  status      String   @default("queued")
  
  /// Merge-Referenz (wenn gemerged)
  mergedInto  String?
  
  /// Twitch Event ID (für Deduplizierung)
  twitchEventId String?
  
  createdAt   DateTime @default(now())
  scheduledAt DateTime?
  playedAt    DateTime?
  
  @@index([configId])
  @@index([status])
  @@index([createdAt])
}

/// Alert History (für Analytics)
model AlertHistory {
  id          String   @id @default(cuid())
  configId    String
  config      AlertDirectorConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  type        String
  data        Json
  priority    Int
  
  /// Wie wurde der Alert behandelt
  outcome     String   // played, merged, skipped, suppressed
  
  /// Statistiken
  queueTime   Int?     // Zeit in Queue (ms)
  displayTime Int?     // Anzeigedauer (ms)
  
  createdAt   DateTime @default(now())
  
  @@index([configId])
  @@index([createdAt])
}
```

### 3.2 API Routes

```typescript
// src/app/api/alert-director/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AlertConfigSchema } from '@/types/alert-director';

// GET: Konfiguration abrufen
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  let config = await prisma.alertDirectorConfig.findUnique({
    where: { userId: session.user.id },
    include: {
      queue: {
        where: { status: { in: ['queued', 'pending', 'playing'] } },
        orderBy: { priority: 'desc' },
        take: 20
      }
    }
  });
  
  // Default-Config erstellen falls nicht vorhanden
  if (!config) {
    config = await prisma.alertDirectorConfig.create({
      data: { userId: session.user.id },
      include: { queue: true }
    });
  }
  
  return NextResponse.json({
    success: true,
    data: config,
    meta: { timestamp: new Date().toISOString() }
  });
}

// PUT: Konfiguration aktualisieren
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const validated = AlertConfigSchema.partial().safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: { message: 'Validation failed', details: validated.error.flatten() } },
      { status: 400 }
    );
  }
  
  const config = await prisma.alertDirectorConfig.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...validated.data
    },
    update: validated.data
  });
  
  return NextResponse.json({ success: true, data: config });
}
```

```typescript
// src/app/api/alert-director/queue/route.ts

// GET: Queue abrufen
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { message: 'Missing userId' } },
      { status: 400 }
    );
  }
  
  const queue = await prisma.alertQueue.findMany({
    where: {
      config: { userId },
      status: { in: ['queued', 'pending'] }
    },
    orderBy: { priority: 'desc' },
    take: 50
  });
  
  return NextResponse.json({ success: true, data: queue });
}

// POST: Alert manuell hinzufügen (für Tests/Mods)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  
  const config = await prisma.alertDirectorConfig.findUnique({
    where: { userId: session.user.id }
  });
  
  if (!config) {
    return NextResponse.json(
      { success: false, error: { message: 'Config not found' } },
      { status: 404 }
    );
  }
  
  const alert = await prisma.alertQueue.create({
    data: {
      configId: config.id,
      type: body.type,
      data: body.data,
      priority: body.priority || 50,
      status: 'queued'
    }
  });
  
  return NextResponse.json({ success: true, data: alert }, { status: 201 });
}

// DELETE: Alert aus Queue entfernen
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get('id');
  
  if (!session?.user?.id || !alertId) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized or missing ID' } },
      { status: 401 }
    );
  }
  
  await prisma.alertQueue.updateMany({
    where: {
      id: alertId,
      config: { userId: session.user.id }
    },
    data: { status: 'skipped' }
  });
  
  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/api/alert-director/events/route.ts
// Server-Sent Events für Real-time Updates

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return new Response('Missing userId', { status: 400 });
  }
  
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Initial state senden
      const initialQueue = await getQueueState(userId);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'init', queue: initialQueue })}\n\n`)
      );
      
      // Polling für Updates (in Production: Redis Pub/Sub)
      const interval = setInterval(async () => {
        const nextAlert = await getNextAlert(userId);
        if (nextAlert) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'alert', alert: nextAlert })}\n\n`)
          );
        }
      }, 1000);
      
      // Cleanup bei Disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 3.3 Service Layer

```typescript
// src/lib/services/alert-director.service.ts
import { prisma } from '@/lib/prisma';
import type { TwitchEvent, Alert, AlertConfig } from '@/types';

export class AlertDirectorService {
  /**
   * Verarbeitet ein eingehendes Twitch Event
   */
  async processEvent(userId: string, event: TwitchEvent): Promise<Alert | null> {
    // 1. Config laden
    const config = await prisma.alertDirectorConfig.findUnique({
      where: { userId }
    });
    
    if (!config?.enabled) return null;
    
    // 2. Alert erstellen
    const alert = this.createAlertFromEvent(event);
    if (!alert) return null;
    
    // 3. Filter prüfen
    if (this.shouldSuppress(alert, config)) {
      await this.logSuppressed(config.id, alert);
      return null;
    }
    
    // 4. Priorität berechnen
    alert.priority = this.calculatePriority(alert, config);
    
    // 5. Merge prüfen
    const mergeTarget = await this.findMergeTarget(config.id, alert);
    if (mergeTarget) {
      await this.mergeInto(alert, mergeTarget);
      return null;
    }
    
    // 6. In Queue einfügen
    await this.enqueue(config.id, alert);
    
    return alert;
  }
  
  /**
   * Gibt den nächsten Alert zurück und markiert ihn als "playing"
   */
  async getNextAlert(userId: string): Promise<Alert | null> {
    const config = await prisma.alertDirectorConfig.findUnique({
      where: { userId }
    });
    
    if (!config?.enabled) return null;
    
    // Prüfen ob aktuell ein Alert läuft
    const playing = await prisma.alertQueue.findFirst({
      where: { configId: config.id, status: 'playing' }
    });
    
    if (playing) {
      // Prüfen ob abgelaufen
      const elapsed = Date.now() - (playing.playedAt?.getTime() || 0);
      if (elapsed < config.alertDuration) {
        return null; // Noch nicht fertig
      }
      
      // Abschließen
      await prisma.alertQueue.update({
        where: { id: playing.id },
        data: { status: 'completed' }
      });
    }
    
    // Cooldown prüfen
    const lastCompleted = await prisma.alertQueue.findFirst({
      where: { configId: config.id, status: 'completed' },
      orderBy: { playedAt: 'desc' }
    });
    
    if (lastCompleted?.playedAt) {
      const cooldownRemaining = config.cooldown - (Date.now() - lastCompleted.playedAt.getTime());
      if (cooldownRemaining > 0) return null;
    }
    
    // Nächsten Alert holen
    const next = await prisma.alertQueue.findFirst({
      where: { configId: config.id, status: 'queued' },
      orderBy: { priority: 'desc' }
    });
    
    if (!next) return null;
    
    // Als playing markieren
    await prisma.alertQueue.update({
      where: { id: next.id },
      data: { status: 'playing', playedAt: new Date() }
    });
    
    return {
      id: next.id,
      type: next.type,
      ...next.data as object,
      priority: next.priority
    } as Alert;
  }
  
  private createAlertFromEvent(event: TwitchEvent): Alert | null {
    switch (event.type) {
      case 'channel.follow':
        return {
          type: 'follow',
          user: {
            id: event.data.user_id,
            name: event.data.user_name,
            displayName: event.data.user_name
          },
          createdAt: new Date()
        };
      
      case 'channel.subscribe':
        return {
          type: `sub_tier${event.data.tier / 1000}`,
          user: {
            id: event.data.user_id,
            name: event.data.user_name,
            displayName: event.data.user_name
          },
          message: event.data.message?.text,
          tier: event.data.tier,
          isGift: event.data.is_gift,
          createdAt: new Date()
        };
      
      case 'channel.cheer':
        return {
          type: 'cheer',
          user: {
            id: event.data.user_id,
            name: event.data.user_name,
            displayName: event.data.user_name
          },
          bits: event.data.bits,
          message: event.data.message,
          createdAt: new Date()
        };
      
      case 'channel.raid':
        return {
          type: 'raid',
          user: {
            id: event.data.from_broadcaster_user_id,
            name: event.data.from_broadcaster_user_name,
            displayName: event.data.from_broadcaster_user_name
          },
          viewers: event.data.viewers,
          createdAt: new Date()
        };
      
      default:
        return null;
    }
  }
  
  private calculatePriority(alert: Alert, config: any): number {
    const weights = config.weights || {};
    let base = weights[alert.type] || 10;
    
    // Wertbasierte Modifikatoren
    if (alert.bits) base += alert.bits / 10;
    if (alert.viewers) base += alert.viewers / 10;
    if (alert.tier) base += (alert.tier / 1000) * 20;
    
    return Math.round(Math.min(base, 100));
  }
  
  private shouldSuppress(alert: Alert, config: any): boolean {
    const quietHours = config.quietHours || {};
    
    if (!quietHours.enabled) return false;
    
    return quietHours.suppressTypes?.includes(alert.type) || false;
  }
  
  private async enqueue(configId: string, alert: Alert): Promise<void> {
    await prisma.alertQueue.create({
      data: {
        configId,
        type: alert.type,
        data: alert as object,
        priority: alert.priority || 10,
        status: 'queued'
      }
    });
  }
  
  private async findMergeTarget(configId: string, alert: Alert): Promise<string | null> {
    // Implementierung der Merge-Logik
    return null;
  }
  
  private async mergeInto(alert: Alert, targetId: string): Promise<void> {
    // Implementierung der Merge-Logik
  }
  
  private async logSuppressed(configId: string, alert: Alert): Promise<void> {
    await prisma.alertHistory.create({
      data: {
        configId,
        type: alert.type,
        data: alert as object,
        priority: alert.priority || 0,
        outcome: 'suppressed'
      }
    });
  }
}

export const alertDirectorService = new AlertDirectorService();
```

---

## 4. Frontend

### 4.1 Dashboard-Seite

```typescript
// src/app/(dashboard)/dashboard/alerts/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { AlertConfigForm } from '@/components/alerts/AlertConfigForm';
import { AlertQueuePreview } from '@/components/alerts/AlertQueuePreview';
import { AlertStats } from '@/components/alerts/AlertStats';
import { OverlayUrlCard } from '@/components/overlays/OverlayUrlCard';

export default async function AlertDirectorPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }
  
  const config = await prisma.alertDirectorConfig.findUnique({
    where: { userId: session.user.id },
    include: {
      queue: {
        where: { status: { in: ['queued', 'pending', 'playing'] } },
        orderBy: { priority: 'desc' },
        take: 10
      },
      _count: {
        select: { history: true }
      }
    }
  });
  
  return (
    <PageWrapper
      title="Smart Alert Director"
      description="Intelligentes Alert-Management für professionelle Streams"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Konfiguration */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Einstellungen</h2>
            <AlertConfigForm initialConfig={config} />
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Prioritäts-Matrix</h2>
            <PriorityMatrixEditor weights={config?.weights} />
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Queue */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Aktuelle Queue</h2>
            <Suspense fallback={<QueueSkeleton />}>
              <AlertQueuePreview userId={session.user.id} initialQueue={config?.queue || []} />
            </Suspense>
          </Card>
          
          {/* Statistiken */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiken</h2>
            <AlertStats userId={session.user.id} />
          </Card>
          
          {/* Overlay URL */}
          <OverlayUrlCard
            type="alert-director"
            userId={session.user.id}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
```

### 4.2 Konfigurationsformular

```typescript
// src/components/alerts/AlertConfigForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import { updateAlertConfig } from '@/actions/alerts';
import { AlertConfigSchema, type AlertConfig } from '@/types/alert-director';

interface Props {
  initialConfig?: AlertConfig | null;
}

export function AlertConfigForm({ initialConfig }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<AlertConfig>({
    resolver: zodResolver(AlertConfigSchema),
    defaultValues: {
      enabled: initialConfig?.enabled ?? true,
      alertDuration: initialConfig?.alertDuration ?? 5000,
      cooldown: initialConfig?.cooldown ?? 2000,
      theme: initialConfig?.theme ?? 'default',
      position: initialConfig?.position ?? 'top-right',
      animation: initialConfig?.animation ?? 'slide',
      soundEnabled: initialConfig?.soundEnabled ?? true,
      soundVolume: initialConfig?.soundVolume ?? 50,
    }
  });
  
  const onSubmit = (data: AlertConfig) => {
    startTransition(async () => {
      const result = await updateAlertConfig(data);
      
      if (result.success) {
        toast.success('Einstellungen gespeichert');
      } else {
        toast.error(result.error || 'Fehler beim Speichern');
      }
    });
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Aktivierung */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
        <div>
          <label className="text-sm font-medium">Alert Director aktiviert</label>
          <p className="text-xs text-zinc-400">Alerts werden verarbeitet und angezeigt</p>
        </div>
        <Toggle
          checked={form.watch('enabled')}
          onChange={(checked) => form.setValue('enabled', checked)}
        />
      </div>
      
      {/* Timing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Timing</h3>
        
        <div>
          <label className="text-sm font-medium">Alert-Dauer</label>
          <Slider
            min={1000}
            max={30000}
            step={500}
            value={form.watch('alertDuration')}
            onChange={(value) => form.setValue('alertDuration', value)}
          />
          <p className="text-xs text-zinc-400 mt-1">
            {(form.watch('alertDuration') / 1000).toFixed(1)} Sekunden
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium">Cooldown zwischen Alerts</label>
          <Slider
            min={0}
            max={10000}
            step={500}
            value={form.watch('cooldown')}
            onChange={(value) => form.setValue('cooldown', value)}
          />
          <p className="text-xs text-zinc-400 mt-1">
            {(form.watch('cooldown') / 1000).toFixed(1)} Sekunden
          </p>
        </div>
      </div>
      
      {/* Styling */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Darstellung</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Theme</label>
            <Select
              value={form.watch('theme')}
              onChange={(value) => form.setValue('theme', value)}
              options={[
                { value: 'default', label: 'Standard' },
                { value: 'minimal', label: 'Minimal' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Position</label>
            <Select
              value={form.watch('position')}
              onChange={(value) => form.setValue('position', value)}
              options={[
                { value: 'top-left', label: 'Oben Links' },
                { value: 'top-right', label: 'Oben Rechts' },
                { value: 'bottom-left', label: 'Unten Links' },
                { value: 'bottom-right', label: 'Unten Rechts' },
                { value: 'center', label: 'Mitte' },
              ]}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Animation</label>
          <Select
            value={form.watch('animation')}
            onChange={(value) => form.setValue('animation', value)}
            options={[
              { value: 'slide', label: 'Slide' },
              { value: 'pop', label: 'Pop' },
              { value: 'fade', label: 'Fade' },
              { value: 'bounce', label: 'Bounce' },
            ]}
          />
        </div>
      </div>
      
      {/* Sound */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sound</h3>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Sound aktiviert</label>
          <Toggle
            checked={form.watch('soundEnabled')}
            onChange={(checked) => form.setValue('soundEnabled', checked)}
          />
        </div>
        
        {form.watch('soundEnabled') && (
          <div>
            <label className="text-sm font-medium">Lautstärke</label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={form.watch('soundVolume')}
              onChange={(value) => form.setValue('soundVolume', value)}
            />
            <p className="text-xs text-zinc-400 mt-1">{form.watch('soundVolume')}%</p>
          </div>
        )}
      </div>
      
      {/* Speichern */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Speichern...' : 'Einstellungen speichern'}
      </Button>
    </form>
  );
}
```

### 4.3 Overlay-Komponente

```typescript
// src/components/overlays/alerts/AlertDirectorOverlay.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCard } from './AlertCard';
import type { Alert, AlertConfig } from '@/types/alert-director';

interface Props {
  userId: string;
  config: AlertConfig;
  initialAlert?: Alert | null;
}

const POSITION_CLASSES = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const ANIMATION_VARIANTS = {
  slide: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  pop: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  bounce: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.5 } },
    exit: { y: 100, opacity: 0 },
  },
};

export function AlertDirectorOverlay({ userId, config, initialAlert }: Props) {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(initialAlert || null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // SSE Connection für Real-time Alerts
  useEffect(() => {
    const eventSource = new EventSource(`/api/alert-director/events?userId=${userId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'alert') {
        setCurrentAlert(data.alert);
        setIsPlaying(true);
        
        // Sound abspielen
        if (config.soundEnabled) {
          playAlertSound(data.alert.type, config.soundVolume);
        }
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect nach 5 Sekunden
      setTimeout(() => {
        // Reconnect-Logik
      }, 5000);
    };
    
    return () => eventSource.close();
  }, [userId, config.soundEnabled, config.soundVolume]);
  
  // Alert-Dauer Timer
  useEffect(() => {
    if (!isPlaying || !currentAlert) return;
    
    const timer = setTimeout(() => {
      setIsPlaying(false);
      setCurrentAlert(null);
    }, config.alertDuration);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentAlert, config.alertDuration]);
  
  const positionClass = POSITION_CLASSES[config.position] || POSITION_CLASSES['top-right'];
  const animation = ANIMATION_VARIANTS[config.animation] || ANIMATION_VARIANTS.slide;
  
  return (
    <div className={`fixed ${positionClass} z-50`}>
      <AnimatePresence mode="wait">
        {currentAlert && isPlaying && (
          <motion.div
            key={currentAlert.id}
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={{ duration: 0.3 }}
          >
            <AlertCard
              alert={currentAlert}
              theme={config.theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function playAlertSound(type: string, volume: number) {
  const soundMap: Record<string, string> = {
    follow: '/sounds/follow.mp3',
    sub_tier1: '/sounds/sub.mp3',
    sub_tier2: '/sounds/sub.mp3',
    sub_tier3: '/sounds/sub.mp3',
    cheer: '/sounds/cheer.mp3',
    raid: '/sounds/raid.mp3',
  };
  
  const soundUrl = soundMap[type] || soundMap.follow;
  const audio = new Audio(soundUrl);
  audio.volume = volume / 100;
  audio.play().catch(() => {}); // Ignore autoplay errors
}
```

### 4.4 Alert Card Komponente

```typescript
// src/components/overlays/alerts/AlertCard.tsx
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Alert } from '@/types/alert-director';

interface Props {
  alert: Alert;
  theme: string;
}

const THEME_CLASSES = {
  default: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
  minimal: 'bg-zinc-900/90 text-white border border-zinc-700',
  gaming: 'bg-gradient-to-r from-green-500 to-cyan-500 text-black',
  custom: '', // Custom CSS überschreibt
};

const ALERT_ICONS = {
  follow: '💜',
  sub_tier1: '⭐',
  sub_tier2: '⭐⭐',
  sub_tier3: '⭐⭐⭐',
  cheer: '💎',
  raid: '🚀',
  merged: '🎉',
};

const ALERT_LABELS = {
  follow: 'Neuer Follower',
  sub_tier1: 'Neuer Sub',
  sub_tier2: 'Tier 2 Sub',
  sub_tier3: 'Tier 3 Sub',
  cheer: 'Cheer',
  raid: 'Raid',
  merged: 'Zusammenfassung',
};

export function AlertCard({ alert, theme }: Props) {
  const themeClass = THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.default;
  const icon = ALERT_ICONS[alert.type as keyof typeof ALERT_ICONS] || '🎉';
  const label = ALERT_LABELS[alert.type as keyof typeof ALERT_LABELS] || 'Alert';
  
  return (
    <motion.div
      className={`
        rounded-xl p-4 shadow-2xl min-w-[300px] max-w-[400px]
        backdrop-blur-sm
        ${themeClass}
      `}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium opacity-80">{label}</span>
      </div>
      
      {/* User Info */}
      <div className="flex items-center gap-3">
        {alert.user?.profileImageUrl && (
          <Image
            src={alert.user.profileImageUrl}
            alt={alert.user.displayName}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div>
          <div className="font-bold text-lg">
            {alert.user?.displayName || 'Anonymous'}
          </div>
          {alert.message && (
            <div className="text-sm opacity-90 line-clamp-2">
              {alert.message}
            </div>
          )}
        </div>
      </div>
      
      {/* Value Display (Bits, Viewers, etc.) */}
      {(alert.bits || alert.viewers) && (
        <div className="mt-3 text-right">
          <span className="text-2xl font-bold">
            {alert.bits && `${alert.bits} Bits`}
            {alert.viewers && `${alert.viewers} Viewers`}
          </span>
        </div>
      )}
      
      {/* Merged Count */}
      {alert.type === 'merged' && alert.count && (
        <div className="mt-2 text-center">
          <span className="text-xl font-bold">{alert.count}x</span>
        </div>
      )}
    </motion.div>
  );
}
```

### 4.5 Overlay-Seite

```typescript
// src/app/overlay/alert-director/[userId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AlertDirectorOverlay } from '@/components/overlays/alerts/AlertDirectorOverlay';

interface Props {
  params: { userId: string };
  searchParams: { theme?: string };
}

export default async function AlertDirectorOverlayPage({ params, searchParams }: Props) {
  const config = await prisma.alertDirectorConfig.findFirst({
    where: {
      user: { id: params.userId },
      enabled: true
    }
  });
  
  if (!config) {
    notFound();
  }
  
  // Theme Override via URL
  const theme = searchParams.theme || config.theme;
  
  return (
    <html lang="de">
      <body className="bg-transparent min-h-screen overflow-hidden">
        <AlertDirectorOverlay
          userId={params.userId}
          config={{
            ...config,
            theme,
            weights: config.weights as Record<string, number>,
            mergeWindow: config.mergeWindow as object,
            quietHours: config.quietHours as object,
          }}
        />
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Alert Director Overlay',
};
```

---

## 5. Twitch Integration

### 5.1 Benötigte Scopes

| Scope | Zweck | Erforderlich |
|-------|-------|--------------|
| `channel:read:subscriptions` | Sub-Events lesen | Ja |
| `bits:read` | Cheer-Events lesen | Ja |
| `moderator:read:followers` | Follow-Events lesen | Ja |

### 5.2 EventSub Subscriptions

```typescript
const ALERT_DIRECTOR_SUBSCRIPTIONS = [
  'channel.follow',
  'channel.subscribe',
  'channel.subscription.gift',
  'channel.subscription.message',
  'channel.cheer',
  'channel.raid',
];
```

### 5.3 Event Processing

```typescript
// In EventSub Webhook Handler
switch (event.subscription.type) {
  case 'channel.follow':
  case 'channel.subscribe':
  case 'channel.subscription.gift':
  case 'channel.subscription.message':
  case 'channel.cheer':
  case 'channel.raid':
    await alertDirectorService.processEvent(
      event.subscription.condition.broadcaster_user_id,
      {
        type: event.subscription.type,
        data: event.event,
        timestamp: new Date()
      }
    );
    break;
}
```

---

## 6. Sicherheit & Datenschutz

### 6.1 Datenminimierung

- Nur notwendige User-Daten (ID, Name, Avatar-URL)
- Keine Chat-Nachrichten speichern (nur für Anzeige)
- Alert-History nach 30 Tagen automatisch löschen

### 6.2 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/alert-director` | 60 | 1 min |
| `/api/alert-director/queue` | 120 | 1 min |
| `/api/alert-director/events` (SSE) | 1 | connection |

### 6.3 Abuse Prevention

- Event-Deduplizierung via `twitchEventId`
- Max 100 Alerts in Queue pro User
- Automatische Bereinigung alter Queue-Einträge

---

## 7. Erfolgsmetriken

| Metrik | Ziel | Messung |
|--------|------|---------|
| Adoption | 50% aktive User nutzen Alert Director | Config enabled / Total users |
| Alert Completion Rate | >90% Alerts werden angezeigt | Completed / Total queued |
| Merge Rate | 10-20% der Alerts werden gemerged | Merged / Total |
| User Satisfaction | <5% deaktivieren nach 7 Tagen | Disabled after 7d |

---

## 8. Edge Cases

| Fall | Handling |
|------|----------|
| Alert-Flood (100+ Events/min) | Automatisches Merging aktivieren |
| Twitch API Down | Queue behält Alerts bis zu 1 Stunde |
| Browser Source Disconnect | Reconnect mit Backoff, Queue bleibt erhalten |
| Doppelte Events | Deduplizierung via Event-ID |
| Leere Queue | Overlay zeigt nichts an |

---

## 9. Roadmap

### MVP (v1.0)
- [x] Basis-Queue-System
- [x] Prioritäts-Gewichte
- [x] 4 Alert-Typen (Follow, Sub, Cheer, Raid)
- [x] Standard-Animationen
- [x] Sound-Support

### v1.1
- [ ] Merge-Window-Konfiguration
- [ ] Quiet Hours
- [ ] Recap Cards
- [ ] Custom Sounds pro Alert-Typ

### v2.0
- [ ] KI-basierte Prioritäts-Vorschläge
- [ ] Szenen-Erkennung (OBS Integration)
- [ ] Chat-Aktivitäts-basierte Verzögerung
- [ ] A/B-Testing für Animationen

---

---

## T-OVL-002 — Dynamic Lower Thirds (Context Bar)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-OVL-002 |
| **Kategorie** | Overlays |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |
| **Zielgruppe** | Streamer, Viewer |

### Problem & Lösung

**Problem:**  
Viewer, die mid-stream einschalten, haben keinen Kontext: Was ist das Thema? Was ist das Ziel? Wann ist die nächste Pause?

**Lösung:**  
Eine rotierende "Context Bar" am unteren Bildschirmrand zeigt automatisch relevante Informationen: Stream-Titel, aktives Goal, nächstes Segment, Socials, aktive Commands.

---

## 1. Aufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Context Bar Overlay                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Topic     │  │   Goal      │  │  Schedule   │  │   Socials   │ │
│  │   Card      │  │   Progress  │  │   Next Up   │  │   Links     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                           ▲                                          │
│                           │ Rotation (10s default)                   │
│                     ┌─────┴─────┐                                   │
│                     │ Controller│                                   │
│                     └───────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Komponenten

```
ContextBar/
├── Dashboard/
│   ├── ContextBarPage.tsx
│   ├── CardEditor.tsx
│   └── components/
│       ├── TopicCardConfig.tsx
│       ├── GoalCardConfig.tsx
│       ├── ScheduleCardConfig.tsx
│       ├── SocialsCardConfig.tsx
│       └── CustomCardConfig.tsx
│
├── Overlay/
│   ├── ContextBarOverlay.tsx
│   ├── cards/
│   │   ├── TopicCard.tsx
│   │   ├── GoalCard.tsx
│   │   ├── ScheduleCard.tsx
│   │   ├── SocialsCard.tsx
│   │   └── CustomCard.tsx
│   └── RotationController.tsx
│
└── API/
    └── route.ts
```

---

## 2. Logik

### Card-Typen

```typescript
type ContextCardType = 
  | 'topic'      // Stream-Titel + Kategorie
  | 'goal'       // Aktives Goal mit Progress
  | 'schedule'   // Nächstes Segment / Break
  | 'socials'    // Social Media Links
  | 'command'    // Wichtige Chat-Commands
  | 'sponsor'    // Sponsor-Info
  | 'custom';    // Freier Text

interface ContextCard {
  id: string;
  type: ContextCardType;
  enabled: boolean;
  priority: number;
  content: CardContent;
  style: CardStyle;
}
```

### Rotation-Logik

```typescript
class RotationController {
  private cards: ContextCard[];
  private currentIndex: number = 0;
  private interval: number = 10000; // 10 Sekunden
  
  getNextCard(): ContextCard {
    // Nur aktivierte Cards berücksichtigen
    const activeCards = this.cards
      .filter(c => c.enabled)
      .sort((a, b) => b.priority - a.priority);
    
    if (activeCards.length === 0) return null;
    
    this.currentIndex = (this.currentIndex + 1) % activeCards.length;
    return activeCards[this.currentIndex];
  }
  
  // Event-basierte Unterbrechung
  onHighPriorityEvent(event: TwitchEvent): void {
    // Bei wichtigen Events: Rotation pausieren
    if (event.type === 'raid' || event.type === 'sub_bomb') {
      this.pauseRotation(30000); // 30 Sekunden pausieren
    }
  }
}
```

---

## 3. Backend

### Prisma Schema

```prisma
model ContextBarConfig {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled       Boolean  @default(true)
  
  /// Rotations-Intervall (ms)
  rotationInterval Int   @default(10000)
  
  /// Position: bottom, top
  position      String   @default("bottom")
  
  /// Styling
  theme         String   @default("default")
  customCss     String?
  
  /// Cards (JSON Array)
  cards         Json     @default("[]")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
}
```

### API Route

```typescript
// src/app/api/context-bar/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const config = await prisma.contextBarConfig.findUnique({
    where: { userId: session.user.id }
  });
  
  // Twitch Stream-Daten für Topic-Card
  const streamData = await getTwitchStreamData(session.user.id);
  
  return NextResponse.json({
    success: true,
    data: {
      config,
      streamData
    }
  });
}
```

---

## 4. Frontend

### Overlay

```typescript
// src/components/overlays/context-bar/ContextBarOverlay.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopicCard, GoalCard, ScheduleCard, SocialsCard } from './cards';

interface Props {
  userId: string;
  config: ContextBarConfig;
}

export function ContextBarOverlay({ userId, config }: Props) {
  const [currentCard, setCurrentCard] = useState<ContextCard | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  
  const activeCards = (config.cards as ContextCard[]).filter(c => c.enabled);
  
  useEffect(() => {
    if (activeCards.length === 0) return;
    
    const interval = setInterval(() => {
      setCardIndex((prev) => (prev + 1) % activeCards.length);
    }, config.rotationInterval);
    
    return () => clearInterval(interval);
  }, [activeCards.length, config.rotationInterval]);
  
  useEffect(() => {
    if (activeCards[cardIndex]) {
      setCurrentCard(activeCards[cardIndex]);
    }
  }, [cardIndex, activeCards]);
  
  if (!currentCard) return null;
  
  const positionClass = config.position === 'bottom' 
    ? 'bottom-4 left-1/2 -translate-x-1/2' 
    : 'top-4 left-1/2 -translate-x-1/2';
  
  return (
    <div className={`fixed ${positionClass} z-40`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-xl"
        >
          <CardRenderer card={currentCard} />
        </motion.div>
      </AnimatePresence>
      
      {/* Rotation-Indikator */}
      <div className="flex justify-center mt-2 gap-1">
        {activeCards.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === cardIndex ? 'bg-purple-500' : 'bg-zinc-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CardRenderer({ card }: { card: ContextCard }) {
  switch (card.type) {
    case 'topic': return <TopicCard content={card.content} />;
    case 'goal': return <GoalCard content={card.content} />;
    case 'schedule': return <ScheduleCard content={card.content} />;
    case 'socials': return <SocialsCard content={card.content} />;
    default: return <div>{card.content.text}</div>;
  }
}
```

---

## 5. Twitch Integration

### EventSub

```typescript
const CONTEXT_BAR_SUBSCRIPTIONS = [
  'channel.update',      // Titel/Kategorie-Änderung
  'stream.online',       // Stream-Start
  'stream.offline',      // Stream-Ende
];
```

### Helix API

```typescript
// Stream-Titel und Kategorie abrufen
const getStreamInfo = async (userId: string) => {
  const stream = await twitchClient.helix.streams.getStreamByUserId(userId);
  const channel = await twitchClient.helix.channels.getChannelInfoById(userId);
  
  return {
    title: channel.title,
    category: channel.gameName,
    isLive: !!stream,
    viewerCount: stream?.viewers || 0
  };
};
```

---

## 6. Roadmap

### MVP
- [x] Topic Card (Titel + Kategorie)
- [x] Goal Card (Progress Bar)
- [x] Rotation mit Intervall
- [x] 2 Themes (Default, Minimal)

### v1.1
- [ ] Schedule Card mit Countdown
- [ ] Socials Card mit Icons
- [ ] Custom Cards
- [ ] Event-basierte Pause

### v2.0
- [ ] Chat-Aktivitäts-Sensor (Hide bei Peak)
- [ ] Multi-Language Support
- [ ] A/B-Testing

---

---

## T-OVL-003 — Instant Replay Marker

*(Kurzform - gleiches detailliertes Schema)*

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

**Problem:** Wichtige Momente gehen verloren, weil der Streamer keine Zeit hat, Clips zu erstellen.

**Lösung:** Hotkey/Command erstellt Marker mit Timestamp. Nach dem Stream: Liste aller Marker für Clip-Erstellung.

### Kernfunktionen
- Hotkey `Ctrl+M` / Command `!mark`
- Optional: Auto-Mark bei Chat-Spikes
- Marker-Liste im Dashboard
- Export als Twitch Clip Timestamps

---

## T-OVL-004 — Adaptive Goal Bar (Multi-Goal)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-004 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

**Problem:** Streamer haben oft mehrere Goals (Subs, Bits, Follower), aber nur Platz für eines im Overlay.

**Lösung:** Stackbare, priorisierte Goal-Anzeige mit Milestone-Animationen und automatischem Wechsel.

### Kernfunktionen
- Bis zu 5 gleichzeitige Goals
- Prioritäts-basierte Rotation
- Milestone-Celebrations (25%, 50%, 75%, 100%)
- Twitch-native Goals synchronisieren

### Prisma Schema
```prisma
model MultiGoal {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title         String
  type          String   // subs, followers, bits, donations, custom
  targetValue   Int
  currentValue  Int      @default(0)
  priority      Int      @default(1)
  
  /// Styling
  color         String   @default("#8b5cf6")
  showPercentage Boolean @default(true)
  
  /// Status
  isActive      Boolean  @default(true)
  completedAt   DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId])
}
```

---

## T-OVL-005 — Polls & Predictions Showcase

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-005 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

**Problem:** Twitch Polls/Predictions sind nur im Chat sichtbar, Viewer verpassen sie.

**Lösung:** Auffällige On-Stream-Anzeige mit Timer, Live-Ergebnissen und Reveal-Animation.

### EventSub Subscriptions
```typescript
const POLL_PREDICTION_SUBSCRIPTIONS = [
  'channel.poll.begin',
  'channel.poll.progress',
  'channel.poll.end',
  'channel.prediction.begin',
  'channel.prediction.progress',
  'channel.prediction.lock',
  'channel.prediction.end',
];
```

### Overlay-Komponente
```typescript
export function PollOverlay({ poll, config }: Props) {
  const totalVotes = poll.choices.reduce((sum, c) => sum + c.votes, 0);
  
  return (
    <div className="bg-zinc-900/95 rounded-xl p-6 min-w-[350px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-purple-400 font-medium">UMFRAGE</span>
        <CountdownTimer endTime={poll.endsAt} />
      </div>
      
      <h3 className="text-xl font-bold mb-4">{poll.title}</h3>
      
      <div className="space-y-3">
        {poll.choices.map((choice) => {
          const percentage = totalVotes > 0 
            ? Math.round((choice.votes / totalVotes) * 100) 
            : 0;
          
          return (
            <div key={choice.id} className="relative">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{choice.title}</span>
                <span className="text-sm text-zinc-400">{percentage}%</span>
              </div>
              <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center text-sm text-zinc-400">
        {totalVotes} Stimmen
      </div>
    </div>
  );
}
```

---

## T-OVL-006 — Chat Highlight Lane

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-006 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

**Problem:** Tolle Chat-Nachrichten verschwinden im Scroll. Fragen bleiben unbeantwortet.

**Lösung:** Kuratierte "Best of Chat" Lane auf dem Stream. Mods können Nachrichten pinnen.

### Features
- Mod-Command `!highlight` pinnt aktuelle Nachricht
- Auto-Highlight: First-Time-Chatter, Fragen (?)
- Keyword-Filter (Spam-Schutz)
- PII-Redaktion (Telefonnummern, E-Mails)

---

## T-OVL-007 — Sponsor Segment Overlay Kit

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-007 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

**Problem:** Sponsor-Segmente brauchen korrekte Disclosure, Timer und CTA - manuell fehleranfällig.

**Lösung:** Vorgefertigte Sponsor-Overlay-Komponenten mit FTC-konformer Disclosure.

### Features
- "Sponsored" Badge (FTC-konform)
- Segment-Timer
- CTA-Card mit QR-Code
- Optional: Link-Tracking (Datenschutz-konform)

---

## T-OVL-008 — On-Stream Task List (Run-of-Show)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-008 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

**Problem:** Streamer vergessen geplante Segmente oder Talking Points.

**Lösung:** Checkliste als Overlay (privat für Streamer oder öffentlich).

---

## T-OVL-009 — Now Playing (Multi-Source)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-009 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

**Problem:** Viewer fragen "What song is this?" - manuelle Antworten sind nervig.

**Lösung:** Automatische Erkennung von Spotify/YouTube/Local und Anzeige als Overlay.

### Integrationen
- Spotify Web API
- Last.fm Scrobbling
- Lokale Musik-Player (via Desktop App)
- YouTube Music (begrenzt)

---

## T-OVL-010 — Stream Health HUD

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-010 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

**Problem:** Viewer merken Qualitätsprobleme, der Streamer nicht.

**Lösung:** Transparente Health-Indikatoren (Bitrate, Dropped Frames, Latenz).

### Datenquellen
- OBS WebSocket (Bitrate, FPS, Dropped Frames)
- Twitch Ingest Server Status
- Client-Side Performance Metrics

---

## T-OVL-011 — Reactive Scene Frame (Theme Engine)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-011 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

**Problem:** Overlays sind statisch und langweilig.

**Lösung:** Event-reaktive Frames mit Mikro-Animationen bei Subs, Raids, etc.

### Features
- CSS Custom Properties (Theme Tokens)
- Event-Trigger (Glow bei Sub, Shake bei Raid)
- Mood-basierte Farbänderungen
- Strenge CSP (keine externen Assets)

---

## T-OVL-012 — Multi-Language Overlay Layer

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-012 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

**Problem:** Internationale Viewer verstehen englische Labels nicht.

**Lösung:** Overlay-Texte dynamisch übersetzbar via URL-Parameter.

### Implementation
```typescript
// Overlay-URL: /overlay/goal/user123?lang=de
const translations = {
  en: { goal: 'Goal', progress: 'Progress' },
  de: { goal: 'Ziel', progress: 'Fortschritt' },
  fr: { goal: 'Objectif', progress: 'Progression' },
  es: { goal: 'Meta', progress: 'Progreso' },
};
```

---

## T-OVL-013 — Countdown Timer (Multi-Purpose)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-013 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | S |

**Problem:** Streams brauchen Timer für: Starting Soon, BRB, Subathon, Giveaways.

**Lösung:** Flexibler Countdown mit verschiedenen Modi und Styling-Optionen.

### Modi
- **Countdown**: Zählt zu 0
- **Countup**: Zählt von 0 hoch
- **Subathon**: +Zeit pro Sub/Cheer
- **Target Time**: Zu einem Datum/Uhrzeit

---

## T-OVL-014 — Viewer Counter (Animated)

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-014 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

**Problem:** Standard-Viewer-Counter ist langweilig.

**Lösung:** Animierter Counter mit Celebrationen bei Milestones.

### Features
- Flip-Animation bei Änderungen
- Konfetti bei runden Zahlen (100, 500, 1000)
- Trend-Indikator (📈📉)
- Peak-Anzeige

---

## T-OVL-015 — Emote Wall / Emote Explosion

### Übersicht
| Feld | Wert |
|------|------|
| **ID** | T-OVL-015 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

**Problem:** Emote-Spam im Chat ist nicht sichtbar auf dem Stream.

**Lösung:** Emotes "explodieren" auf dem Screen bei hoher Emote-Dichte.

### Trigger
- X gleiche Emotes in Y Sekunden
- Channel Point Redemption
- Manueller Trigger

### Animation
```typescript
function EmoteExplosion({ emotes, config }: Props) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {emotes.map((emote, idx) => (
        <motion.img
          key={idx}
          src={emote.url}
          className="absolute w-12 h-12"
          initial={{
            x: window.innerWidth / 2,
            y: window.innerHeight,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: -100,
            scale: [0, 1.5, 1],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: idx * 0.05
          }}
        />
      ))}
    </div>
  );
}
```

---

## Zusammenfassung Overlays

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-OVL-001 | Smart Alert Director | 🔴 | L |
| T-OVL-002 | Dynamic Lower Thirds | 🔴 | M |
| T-OVL-003 | Instant Replay Marker | 🟡 | S |
| T-OVL-004 | Adaptive Goal Bar | 🔴 | M |
| T-OVL-005 | Polls & Predictions Showcase | 🔴 | M |
| T-OVL-006 | Chat Highlight Lane | 🟡 | M |
| T-OVL-007 | Sponsor Segment Overlay | 🟡 | S |
| T-OVL-008 | On-Stream Task List | 🟢 | S |
| T-OVL-009 | Now Playing (Multi-Source) | 🟡 | M |
| T-OVL-010 | Stream Health HUD | 🟢 | M |
| T-OVL-011 | Reactive Scene Frame | 🟢 | L |
| T-OVL-012 | Multi-Language Overlay | 🟢 | M |
| T-OVL-013 | Countdown Timer | 🔴 | S |
| T-OVL-014 | Viewer Counter (Animated) | 🟢 | S |
| T-OVL-015 | Emote Wall / Explosion | 🟡 | M |

---

*Weiter zu [02-chat-experience.md](./02-chat-experience.md)*
