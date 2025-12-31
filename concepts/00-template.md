# Tool Card Template

Verwende diese Vorlage für alle neuen Tool-Konzepte.

---

## T-XXX-000 — Tool Name

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-XXX-000 |
| **Kategorie** | Overlays / Chat / Moderation / Games / Community / Monetization / Analytics / Automation / Production / A11Y / Developer / IRL |
| **Priorität** | 🔴 Hoch / 🟡 Mittel / 🟢 Niedrig |
| **Komplexität** | S / M / L / XL |
| **Zielgruppe** | Streamer, Moderatoren, Viewer |

### Problem & Lösung

**Problem:**  
Beschreibung des Problems, das dieses Tool löst.

**Lösung:**  
Wie dieses Tool das Problem adressiert.

**Wertversprechen:**  
- Für Streamer: ...
- Für Moderatoren: ...
- Für Viewer: ...

---

## 1. Aufbau (Architektur)

### 1.1 Systemübersicht

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│  Dashboard UI          │  Overlay UI         │  Chat Bot    │
│  (src/app/dashboard)   │  (src/app/overlay)  │  (IRC/WS)    │
└────────────┬───────────┴──────────┬──────────┴──────┬───────┘
             │                      │                 │
             ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Route Handlers        │  Server Actions    │  Webhooks     │
│  (src/app/api/*)       │  (actions/*.ts)    │  (EventSub)   │
└────────────┬───────────┴──────────┬─────────┴───────┬───────┘
             │                      │                 │
             ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Business Logic        │  Twitch Client     │  Cache        │
│  (lib/services/*.ts)   │  (lib/twitch.ts)   │  (Redis/mem)  │
└────────────┬───────────┴──────────┬─────────┴───────┬───────┘
             │                      │                 │
             ▼                      ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM            │  PostgreSQL        │  File Storage │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Komponenten-Hierarchie

```
Tool/
├── Dashboard/
│   ├── ToolPage.tsx              # Hauptseite
│   ├── ToolSettings.tsx          # Einstellungen
│   ├── ToolPreview.tsx           # Live-Vorschau
│   └── components/
│       ├── ToolConfigForm.tsx    # Konfigurationsformular
│       ├── ToolStatusCard.tsx    # Status-Anzeige
│       └── ToolHistoryList.tsx   # Verlauf/Logs
│
├── Overlay/
│   ├── ToolOverlay.tsx           # Haupt-Overlay-Komponente
│   ├── ToolAnimation.tsx         # Animationen
│   └── hooks/
│       ├── useToolState.ts       # Zustandsverwaltung
│       └── useToolEvents.ts      # Event-Listener
│
└── API/
    ├── route.ts                  # GET, POST, PUT, DELETE
    ├── [id]/route.ts             # Einzelne Ressource
    └── webhook/route.ts          # EventSub Handler
```

### 1.3 Datenfluss

```
1. User Interaction (Dashboard)
   └─▶ Form Submit
       └─▶ Server Action / API Call
           └─▶ Validation (Zod)
               └─▶ Business Logic (Service)
                   └─▶ Database (Prisma)
                       └─▶ Response
                           └─▶ UI Update (React Query / SWR)

2. Twitch Event (EventSub)
   └─▶ Webhook Endpoint
       └─▶ Signature Verification
           └─▶ Event Processing (Service)
               └─▶ Database Update
                   └─▶ Real-time Push (SSE/WebSocket)
                       └─▶ Overlay Update

3. Overlay Rendering
   └─▶ Browser Source (OBS)
       └─▶ Next.js Page
           └─▶ Server Component (initial data)
               └─▶ Client Component (real-time updates)
                   └─▶ Animation Frame
```

---

## 2. Logik (Business Logic)

### 2.1 Kernfunktionen

| Funktion | Beschreibung | Eingabe | Ausgabe |
|----------|--------------|---------|---------|
| `createTool()` | Erstellt neue Instanz | Config-Objekt | Tool-Instanz |
| `updateTool()` | Aktualisiert Einstellungen | ID + Partial Config | Updated Tool |
| `deleteTool()` | Entfernt Tool | ID | Success/Error |
| `processEvent()` | Verarbeitet Twitch-Event | Event-Payload | Action/null |
| `getOverlayState()` | Gibt aktuellen Zustand für Overlay | UserID + Type | State Object |

### 2.2 Zustandsmaschine

```
┌──────────┐    create     ┌──────────┐    activate    ┌──────────┐
│  DRAFT   │──────────────▶│  READY   │───────────────▶│  ACTIVE  │
└──────────┘               └──────────┘                └────┬─────┘
                                ▲                          │
                                │         pause            │
                                └──────────────────────────┘
                                │                          │
                           resume                      deactivate
                                │                          │
                                ▼                          ▼
                           ┌──────────┐              ┌──────────┐
                           │  PAUSED  │              │ INACTIVE │
                           └──────────┘              └──────────┘
```

### 2.3 Validierungsregeln

```typescript
import { z } from 'zod';

export const ToolConfigSchema = z.object({
  // Basis-Konfiguration
  name: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  
  // Tool-spezifische Felder
  // ...
  
  // Styling
  theme: z.enum(['light', 'dark', 'custom']).default('dark'),
  customCss: z.string().max(10000).optional(),
  
  // Timing
  duration: z.number().min(1000).max(60000).default(5000),
  cooldown: z.number().min(0).max(3600000).default(0),
});

export type ToolConfig = z.infer<typeof ToolConfigSchema>;
```

### 2.4 Event-Verarbeitung

```typescript
interface EventProcessor {
  // Prüft, ob Event relevant ist
  shouldProcess(event: TwitchEvent): boolean;
  
  // Transformiert Event in interne Aktion
  transform(event: TwitchEvent): ToolAction | null;
  
  // Führt Aktion aus
  execute(action: ToolAction): Promise<void>;
  
  // Cleanup nach Ausführung
  cleanup(action: ToolAction): Promise<void>;
}
```

### 2.5 Caching-Strategie

| Daten | Cache-Typ | TTL | Invalidierung |
|-------|-----------|-----|---------------|
| Config | Memory | ∞ | Bei Änderung |
| State | Redis | 5min | Bei Event |
| Stats | Redis | 1min | Periodisch |
| User-Daten | Memory | 10min | Bei Session-Ende |

---

## 3. Backend

### 3.1 Datenbankschema (Prisma)

```prisma
/// Tool-Konfiguration
model ToolConfig {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Tool-Typ (z.B. "alert-director", "goal-bar")
  type        String
  
  /// Anzeigename
  name        String
  
  /// Aktivierungsstatus
  enabled     Boolean  @default(true)
  
  /// JSON-Konfiguration (tool-spezifisch)
  config      Json     @default("{}")
  
  /// Styling-Overrides
  customCss   String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  /// Beziehungen
  events      ToolEvent[]
  stats       ToolStats?
  
  @@unique([userId, type])
  @@index([userId])
  @@index([type])
}

/// Tool-Events (Logs)
model ToolEvent {
  id          String      @id @default(cuid())
  toolId      String
  tool        ToolConfig  @relation(fields: [toolId], references: [id], onDelete: Cascade)
  
  /// Event-Typ (z.B. "triggered", "skipped", "error")
  eventType   String
  
  /// Event-Daten
  payload     Json        @default("{}")
  
  /// Quell-Event (z.B. Twitch EventSub ID)
  sourceId    String?
  
  createdAt   DateTime    @default(now())
  
  @@index([toolId])
  @@index([createdAt])
}

/// Tool-Statistiken (aggregiert)
model ToolStats {
  id              String      @id @default(cuid())
  toolId          String      @unique
  tool            ToolConfig  @relation(fields: [toolId], references: [id], onDelete: Cascade)
  
  /// Zähler
  totalTriggers   Int         @default(0)
  todayTriggers   Int         @default(0)
  
  /// Zeitstempel
  lastTriggeredAt DateTime?
  lastResetAt     DateTime    @default(now())
  
  updatedAt       DateTime    @updatedAt
}
```

### 3.2 API Routes

#### GET `/api/tools`
```typescript
// src/app/api/tools/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const tools = await prisma.toolConfig.findMany({
    where: { userId: session.user.id },
    include: {
      stats: true,
      _count: { select: { events: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({
    success: true,
    data: tools,
    meta: { timestamp: new Date().toISOString() }
  });
}
```

#### POST `/api/tools`
```typescript
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const validated = ToolConfigSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: { message: 'Validation failed', details: validated.error.flatten() } },
      { status: 400 }
    );
  }
  
  const tool = await prisma.toolConfig.create({
    data: {
      userId: session.user.id,
      type: validated.data.type,
      name: validated.data.name,
      enabled: validated.data.enabled,
      config: validated.data.config,
      customCss: validated.data.customCss,
      stats: { create: {} }
    },
    include: { stats: true }
  });
  
  return NextResponse.json(
    { success: true, data: tool },
    { status: 201 }
  );
}
```

#### PUT `/api/tools/[id]`
```typescript
// src/app/api/tools/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const validated = ToolConfigSchema.partial().safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: { message: 'Validation failed', details: validated.error.flatten() } },
      { status: 400 }
    );
  }
  
  const tool = await prisma.toolConfig.update({
    where: {
      id: params.id,
      userId: session.user.id // Ensure ownership
    },
    data: validated.data
  });
  
  return NextResponse.json({ success: true, data: tool });
}
```

### 3.3 Service Layer

```typescript
// src/lib/services/tool.service.ts
import { prisma } from '@/lib/prisma';
import { ToolConfig, ToolConfigSchema } from '@/types/tool';
import { TwitchEvent } from '@/types/twitch';

export class ToolService {
  /**
   * Erstellt oder aktualisiert eine Tool-Konfiguration
   */
  async upsertConfig(userId: string, type: string, config: Partial<ToolConfig>) {
    return prisma.toolConfig.upsert({
      where: { userId_type: { userId, type } },
      create: {
        userId,
        type,
        name: config.name || type,
        enabled: config.enabled ?? true,
        config: config as object,
        stats: { create: {} }
      },
      update: {
        ...config,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * Verarbeitet ein eingehendes Twitch-Event
   */
  async processEvent(userId: string, event: TwitchEvent): Promise<void> {
    // 1. Relevante Tools für diesen Event-Typ finden
    const tools = await this.getActiveToolsForEvent(userId, event.type);
    
    // 2. Für jedes Tool prüfen und ausführen
    for (const tool of tools) {
      const processor = this.getProcessor(tool.type);
      
      if (processor.shouldProcess(event, tool.config)) {
        const action = processor.transform(event, tool.config);
        
        if (action) {
          await processor.execute(action);
          await this.logEvent(tool.id, 'triggered', { event, action });
          await this.updateStats(tool.id);
        }
      }
    }
  }
  
  /**
   * Gibt den aktuellen Overlay-Zustand zurück
   */
  async getOverlayState(userId: string, type: string) {
    const tool = await prisma.toolConfig.findUnique({
      where: { userId_type: { userId, type } },
      include: { stats: true }
    });
    
    if (!tool || !tool.enabled) {
      return null;
    }
    
    // Tool-spezifischen State berechnen
    const state = await this.computeState(tool);
    
    return {
      config: tool.config,
      state,
      stats: tool.stats,
      updatedAt: tool.updatedAt
    };
  }
  
  private async logEvent(toolId: string, eventType: string, payload: object) {
    await prisma.toolEvent.create({
      data: { toolId, eventType, payload }
    });
  }
  
  private async updateStats(toolId: string) {
    await prisma.toolStats.update({
      where: { toolId },
      data: {
        totalTriggers: { increment: 1 },
        todayTriggers: { increment: 1 },
        lastTriggeredAt: new Date()
      }
    });
  }
}

export const toolService = new ToolService();
```

### 3.4 EventSub Webhook Handler

```typescript
// src/app/api/webhooks/twitch/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyTwitchSignature } from '@/lib/twitch';
import { toolService } from '@/lib/services/tool.service';

export async function POST(request: Request) {
  const headersList = headers();
  const body = await request.text();
  
  // 1. Signatur verifizieren
  const signature = headersList.get('twitch-eventsub-message-signature');
  const messageId = headersList.get('twitch-eventsub-message-id');
  const timestamp = headersList.get('twitch-eventsub-message-timestamp');
  
  if (!verifyTwitchSignature(signature, messageId, timestamp, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  
  const payload = JSON.parse(body);
  const messageType = headersList.get('twitch-eventsub-message-type');
  
  // 2. Challenge-Response für Subscription-Verifizierung
  if (messageType === 'webhook_callback_verification') {
    return new Response(payload.challenge, { status: 200 });
  }
  
  // 3. Event verarbeiten
  if (messageType === 'notification') {
    const { subscription, event } = payload;
    const userId = subscription.condition.broadcaster_user_id;
    
    // Async verarbeiten (nicht blockieren)
    toolService.processEvent(userId, {
      type: subscription.type,
      data: event,
      timestamp: new Date(timestamp!)
    }).catch(console.error);
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 4. Frontend

### 4.1 Dashboard-Seite

```typescript
// src/app/(dashboard)/dashboard/tools/[type]/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ToolConfigForm } from '@/components/tools/ToolConfigForm';
import { ToolPreview } from '@/components/tools/ToolPreview';
import { ToolStats } from '@/components/tools/ToolStats';
import { Card } from '@/components/ui/Card';
import { PageWrapper } from '@/components/layout/PageWrapper';

interface Props {
  params: { type: string };
}

export default async function ToolPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }
  
  const tool = await prisma.toolConfig.findUnique({
    where: { userId_type: { userId: session.user.id, type: params.type } },
    include: { stats: true }
  });
  
  return (
    <PageWrapper
      title={getToolTitle(params.type)}
      description={getToolDescription(params.type)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Konfiguration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Einstellungen</h2>
          <ToolConfigForm
            type={params.type}
            initialConfig={tool?.config}
            enabled={tool?.enabled ?? true}
          />
        </Card>
        
        {/* Live-Vorschau */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vorschau</h2>
          <Suspense fallback={<div className="animate-pulse h-48 bg-zinc-800 rounded" />}>
            <ToolPreview type={params.type} userId={session.user.id} />
          </Suspense>
        </Card>
        
        {/* Statistiken */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Statistiken</h2>
          <ToolStats stats={tool?.stats} />
        </Card>
      </div>
      
      {/* Overlay-URL */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Overlay-URL</h2>
        <OverlayUrlSection type={params.type} userId={session.user.id} />
      </Card>
    </PageWrapper>
  );
}
```

### 4.2 Konfigurationsformular

```typescript
// src/components/tools/ToolConfigForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import { updateToolConfig } from '@/actions/tools';
import { ToolConfigSchema, type ToolConfig } from '@/types/tool';

interface Props {
  type: string;
  initialConfig?: Partial<ToolConfig>;
  enabled: boolean;
}

export function ToolConfigForm({ type, initialConfig, enabled }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<ToolConfig>({
    resolver: zodResolver(ToolConfigSchema),
    defaultValues: {
      type,
      enabled,
      ...initialConfig
    }
  });
  
  const onSubmit = (data: ToolConfig) => {
    startTransition(async () => {
      const result = await updateToolConfig(type, data);
      
      if (result.success) {
        toast.success('Einstellungen gespeichert');
      } else {
        toast.error(result.error || 'Fehler beim Speichern');
      }
    });
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Aktivierung */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Aktiviert</label>
        <Toggle
          checked={form.watch('enabled')}
          onChange={(checked) => form.setValue('enabled', checked)}
        />
      </div>
      
      {/* Tool-spezifische Felder hier */}
      {/* ... */}
      
      {/* Speichern */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Speichern...' : 'Speichern'}
      </Button>
    </form>
  );
}
```

### 4.3 Overlay-Komponente

```typescript
// src/components/overlays/ToolOverlay.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolState } from '@/hooks/useToolState';
import { useToolEvents } from '@/hooks/useToolEvents';
import type { ToolState } from '@/types/tool';

interface Props {
  userId: string;
  type: string;
  initialState: ToolState | null;
}

export function ToolOverlay({ userId, type, initialState }: Props) {
  const [state, setState] = useState<ToolState | null>(initialState);
  
  // Real-time Updates via SSE
  useToolEvents(userId, type, (event) => {
    setState((prev) => ({
      ...prev,
      ...event.data
    }));
  });
  
  if (!state) {
    return null;
  }
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {/* Overlay-Inhalt hier */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### 4.4 Hooks

```typescript
// src/hooks/useToolState.ts
import useSWR from 'swr';
import type { ToolState } from '@/types/tool';

export function useToolState(userId: string, type: string) {
  const { data, error, mutate } = useSWR<ToolState>(
    `/api/tools/${type}/state?userId=${userId}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false
    }
  );
  
  return {
    state: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}

// src/hooks/useToolEvents.ts
import { useEffect, useRef } from 'react';

export function useToolEvents(
  userId: string,
  type: string,
  onEvent: (event: MessageEvent) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    const url = `/api/tools/${type}/events?userId=${userId}`;
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = onEvent;
    
    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect nach 5 Sekunden
      setTimeout(() => {
        eventSourceRef.current = new EventSource(url);
      }, 5000);
    };
    
    eventSourceRef.current = eventSource;
    
    return () => {
      eventSource.close();
    };
  }, [userId, type, onEvent]);
}
```

### 4.5 Overlay-Seite

```typescript
// src/app/overlay/[type]/[userId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ToolOverlay } from '@/components/overlays/ToolOverlay';
import { toolService } from '@/lib/services/tool.service';

interface Props {
  params: { type: string; userId: string };
  searchParams: { theme?: string; lang?: string };
}

export default async function OverlayPage({ params, searchParams }: Props) {
  const { type, userId } = params;
  
  // Konfiguration und State laden
  const overlayState = await toolService.getOverlayState(userId, type);
  
  if (!overlayState) {
    notFound();
  }
  
  // Theme und Sprache aus Query-Params
  const theme = searchParams.theme || overlayState.config.theme || 'dark';
  const lang = searchParams.lang || 'de';
  
  return (
    <html lang={lang} className={theme}>
      <body className="bg-transparent min-h-screen">
        <ToolOverlay
          userId={userId}
          type={type}
          initialState={overlayState.state}
        />
      </body>
    </html>
  );
}

// Metadata für OBS Browser Source
export const metadata = {
  title: 'Overlay',
  other: {
    'color-scheme': 'dark light'
  }
};
```

---

## 5. Twitch Integration

### 5.1 Benötigte Scopes

| Scope | Zweck | Optional |
|-------|-------|----------|
| `channel:read:subscriptions` | Sub-Events lesen | Nein |
| `bits:read` | Cheer-Events lesen | Ja |
| `channel:read:redemptions` | Channel Points | Ja |
| `moderator:read:chatters` | Chatter-Liste | Ja |
| `chat:read` | Chat-Nachrichten lesen | Ja |
| `chat:edit` | Chat-Nachrichten senden | Ja |

### 5.2 EventSub Subscriptions

```typescript
const REQUIRED_SUBSCRIPTIONS = [
  'channel.follow',
  'channel.subscribe',
  'channel.subscription.gift',
  'channel.subscription.message',
  'channel.cheer',
  'channel.raid',
  'channel.poll.begin',
  'channel.poll.end',
  'channel.prediction.begin',
  'channel.prediction.end',
  'stream.online',
  'stream.offline'
];
```

### 5.3 Helix API Calls

```typescript
// Beispiel: User-Info abrufen
async function getUserInfo(userId: string): Promise<TwitchUser> {
  const response = await twitchClient.helix.users.getUserById(userId);
  return {
    id: response.id,
    displayName: response.displayName,
    profileImageUrl: response.profilePictureUrl,
    broadcasterType: response.broadcasterType
  };
}
```

---

## 6. Sicherheit & Datenschutz

### 6.1 Authentifizierung

- Session-basiert (NextAuth) für Dashboard
- API-Key für programmatischen Zugriff
- Overlay-URLs: Public, aber obfuskiert (cuid-basierte IDs)

### 6.2 Autorisierung

```typescript
// Middleware für Tool-Zugriff
async function checkToolAccess(userId: string, toolId: string) {
  const tool = await prisma.toolConfig.findUnique({
    where: { id: toolId },
    select: { userId: true }
  });
  
  if (!tool || tool.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }
}
```

### 6.3 Datenminimierung

- Nur notwendige Twitch-Daten speichern
- Event-Logs nach 30 Tagen automatisch löschen
- Keine IP-Adressen oder Gerätefingerabdrücke

### 6.4 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| API (authenticated) | 100 | 1 min |
| Webhooks | 1000 | 1 min |
| Overlay (public) | 60 | 1 min |

---

## 7. Erfolgsmetriken

| Metrik | Ziel | Messung |
|--------|------|---------|
| Adoption | 30% aktive User | Tools enabled / Total users |
| Engagement | 5 Triggers/Stream | Events / Streams |
| Retention | 80% nach 7 Tagen | Tool still enabled after 7d |
| Performance | < 100ms Latenz | Event to Overlay update |

---

## 8. Edge Cases

| Fall | Handling |
|------|----------|
| Twitch API Down | Graceful degradation, Cache verwenden |
| User löscht Account | Cascade delete aller Tool-Daten |
| Concurrent Updates | Optimistic locking mit `updatedAt` |
| Overlay ohne Config | 404 oder Default-Ansicht |
| Event-Flood | Queue + Rate limiting |

---

## 9. Roadmap

### MVP (v1.0)
- [ ] Basis-Konfiguration
- [ ] Overlay-Rendering
- [ ] EventSub-Integration
- [ ] Dashboard-UI

### v1.1
- [ ] Custom CSS Support
- [ ] Event-Historie
- [ ] Statistiken

### v2.0
- [ ] Erweiterte Animationen
- [ ] A/B-Testing
- [ ] Multi-Language Support

