# 💬 Chat Experience (12 Tools)

> Tools für ein besseres Chat-Erlebnis für Streamer, Mods und Viewer

---

## T-CHAT-001 — Smart Chat Filter (AI-Powered)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-001 |
| **Kategorie** | Chat Experience |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | XL |
| **Zielgruppe** | Streamer, Moderatoren |

### Problem & Lösung

**Problem:**  
Standard-Moderation ist zu binär: Nachricht wird geblockt oder nicht. Nuancierte Inhalte (Sarkasmus, Kontext) werden falsch behandelt.

**Lösung:**  
KI-gestützter Filter mit Kontext-Verständnis, der Nachrichten in Kategorien einteilt und Mods bei Grenzfällen unterstützt.

---

## 1. Aufbau (Architektur)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Twitch IRC/Chat                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Chat Filter Pipeline                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Ingest    │──│   Rules     │──│   AI        │──│   Action    │ │
│  │   Layer     │  │   Engine    │  │   Classifier│  │   Engine    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────┬──────┘ │
└─────────────────────────────────────────────────────────────┼───────┘
                                                              │
              ┌───────────────────────────────────────────────┴────────┐
              ▼                      ▼                      ▼          │
        ┌──────────┐          ┌──────────┐          ┌──────────┐      │
        │  Allow   │          │  Queue   │          │  Block   │      │
        │          │          │ (Mod Rev)│          │          │      │
        └──────────┘          └──────────┘          └──────────┘      │
                                    │                                  │
                                    ▼                                  │
                           ┌───────────────┐                          │
                           │  Mod Dashboard │◀─────────────────────────┘
                           └───────────────┘
```

### Komponenten-Hierarchie

```
ChatFilter/
├── Dashboard/
│   ├── ChatFilterPage.tsx
│   ├── RulesEditor.tsx
│   ├── ModQueue.tsx
│   └── components/
│       ├── RuleBuilder.tsx
│       ├── PatternList.tsx
│       ├── UserExemptions.tsx
│       ├── ActionConfig.tsx
│       └── FilterStats.tsx
│
├── Services/
│   ├── ChatFilterService.ts
│   ├── AIClassifier.ts
│   ├── RulesEngine.ts
│   └── ActionExecutor.ts
│
└── API/
    ├── route.ts
    ├── rules/route.ts
    ├── queue/route.ts
    └── stats/route.ts
```

---

## 2. Logik (Business Logic)

### Klassifizierungs-Kategorien

```typescript
enum MessageCategory {
  SAFE = 'safe',
  SPAM = 'spam',
  SELF_PROMO = 'self_promo',
  MILD_TOXICITY = 'mild_toxicity',
  SEVERE_TOXICITY = 'severe_toxicity',
  HATE_SPEECH = 'hate_speech',
  HARASSMENT = 'harassment',
  SEXUAL = 'sexual',
  VIOLENCE = 'violence',
  PHISHING = 'phishing',
  SPOILER = 'spoiler',
  QUESTION = 'question',
  PRAISE = 'praise',
  UNKNOWN = 'unknown'
}

interface ClassificationResult {
  category: MessageCategory;
  confidence: number;  // 0-1
  subcategories: string[];
  suggestedAction: FilterAction;
  reasoning?: string;
}
```

### Aktions-Typen

```typescript
enum FilterAction {
  ALLOW = 'allow',           // Nachricht durchlassen
  QUEUE = 'queue',           // Zur Mod-Review
  TIMEOUT = 'timeout',       // User temporär muten
  DELETE = 'delete',         // Nachricht löschen
  BAN = 'ban',               // User bannen
  WARN = 'warn',             // Warnung an User
  FLAG = 'flag',             // Markieren für später
}

interface ActionConfig {
  category: MessageCategory;
  action: FilterAction;
  duration?: number;         // Timeout-Dauer in Sekunden
  notifyMods: boolean;
  logReason: boolean;
}
```

### Filter-Pipeline

```typescript
class ChatFilterPipeline {
  async processMessage(message: ChatMessage): Promise<FilterResult> {
    // 1. Schnelle Regel-Checks (Regex, Blocklists)
    const ruleResult = await this.rulesEngine.check(message);
    if (ruleResult.action !== FilterAction.ALLOW) {
      return this.executeAction(ruleResult);
    }
    
    // 2. User-Exemptions prüfen
    if (await this.isExempt(message.user)) {
      return { action: FilterAction.ALLOW };
    }
    
    // 3. AI-Klassifizierung (nur wenn nötig)
    const aiResult = await this.aiClassifier.classify(message);
    
    // 4. Confidence-basierte Entscheidung
    if (aiResult.confidence > 0.9) {
      return this.executeAction(aiResult.suggestedAction);
    } else if (aiResult.confidence > 0.6) {
      return this.queueForReview(message, aiResult);
    }
    
    return { action: FilterAction.ALLOW };
  }
}
```

### Validierung

```typescript
import { z } from 'zod';

export const FilterRuleSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  
  // Trigger
  trigger: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('regex'),
      pattern: z.string().max(500),
      flags: z.string().default('i'),
    }),
    z.object({
      type: z.literal('keyword'),
      keywords: z.array(z.string()).max(100),
      matchType: z.enum(['exact', 'contains', 'startsWith']),
    }),
    z.object({
      type: z.literal('ai'),
      categories: z.array(z.nativeEnum(MessageCategory)),
      minConfidence: z.number().min(0).max(1).default(0.8),
    }),
  ]),
  
  // Action
  action: z.nativeEnum(FilterAction),
  actionConfig: z.object({
    duration: z.number().min(1).max(2592000).optional(), // Max 30 Tage
    reason: z.string().max(500).optional(),
    notifyMods: z.boolean().default(true),
  }).optional(),
  
  // Exemptions
  exemptRoles: z.array(z.enum(['vip', 'moderator', 'subscriber', 'founder'])).default([]),
  exemptUsers: z.array(z.string()).max(100).default([]),
  
  // Zeitfenster
  activeHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().default('UTC'),
  }).optional(),
});

export type FilterRule = z.infer<typeof FilterRuleSchema>;
```

---

## 3. Backend

### Prisma Schema

```prisma
/// Chat Filter Konfiguration
model ChatFilterConfig {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled       Boolean  @default(true)
  aiEnabled     Boolean  @default(false)
  
  /// Default-Aktionen pro Kategorie (JSON)
  defaultActions Json    @default("{}")
  
  /// Exemptions
  exemptVIPs    Boolean  @default(true)
  exemptMods    Boolean  @default(true)
  exemptSubs    Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  rules         FilterRule[]
  queue         ModQueue[]
  logs          FilterLog[]
  
  @@index([userId])
}

/// Filter-Regeln
model FilterRule {
  id            String   @id @default(cuid())
  configId      String
  config        ChatFilterConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  name          String
  enabled       Boolean  @default(true)
  priority      Int      @default(0)
  
  /// Trigger-Konfiguration (JSON)
  trigger       Json
  
  /// Aktion
  action        String
  actionConfig  Json     @default("{}")
  
  /// Exemptions
  exemptRoles   Json     @default("[]")
  exemptUsers   Json     @default("[]")
  
  /// Statistiken
  triggerCount  Int      @default(0)
  lastTriggered DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([configId])
  @@index([enabled])
}

/// Mod-Review-Queue
model ModQueue {
  id            String   @id @default(cuid())
  configId      String
  config        ChatFilterConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  /// Original-Nachricht
  messageId     String
  userId        String
  userName      String
  message       String
  
  /// Klassifizierung
  category      String
  confidence    Float
  reasoning     String?
  
  /// Review-Status
  status        String   @default("pending") // pending, approved, rejected
  reviewedBy    String?
  reviewedAt    DateTime?
  actionTaken   String?
  
  createdAt     DateTime @default(now())
  
  @@index([configId])
  @@index([status])
  @@index([createdAt])
}

/// Filter-Logs
model FilterLog {
  id            String   @id @default(cuid())
  configId      String
  config        ChatFilterConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  messageId     String
  userId        String
  userName      String
  message       String
  
  ruleId        String?
  category      String?
  action        String
  
  createdAt     DateTime @default(now())
  
  @@index([configId])
  @@index([createdAt])
  @@index([userId])
}
```

### Service Layer

```typescript
// src/lib/services/chat-filter.service.ts
import { prisma } from '@/lib/prisma';
import { AIClassifier } from './ai-classifier';

export class ChatFilterService {
  private aiClassifier: AIClassifier;
  
  constructor() {
    this.aiClassifier = new AIClassifier();
  }
  
  async processMessage(channelId: string, message: ChatMessage): Promise<FilterResult> {
    const config = await this.getConfig(channelId);
    if (!config?.enabled) {
      return { action: 'allow' };
    }
    
    // 1. User-Exemptions
    if (this.isExempt(message.user, config)) {
      return { action: 'allow' };
    }
    
    // 2. Regel-Engine
    const rules = await this.getActiveRules(config.id);
    for (const rule of rules) {
      const match = await this.matchRule(message, rule);
      if (match) {
        await this.logAction(config.id, message, rule.action, rule.id);
        return { action: rule.action, rule };
      }
    }
    
    // 3. AI-Klassifizierung
    if (config.aiEnabled) {
      const classification = await this.aiClassifier.classify(message.text);
      
      if (classification.confidence > 0.9) {
        const action = config.defaultActions[classification.category] || 'allow';
        await this.logAction(config.id, message, action, null, classification);
        return { action, classification };
      } else if (classification.confidence > 0.6 && classification.category !== 'safe') {
        await this.addToQueue(config.id, message, classification);
        return { action: 'queue', classification };
      }
    }
    
    return { action: 'allow' };
  }
  
  private isExempt(user: ChatUser, config: ChatFilterConfig): boolean {
    if (config.exemptMods && user.isMod) return true;
    if (config.exemptVIPs && user.isVIP) return true;
    if (config.exemptSubs && user.isSub) return true;
    return false;
  }
  
  private async matchRule(message: ChatMessage, rule: FilterRule): Promise<boolean> {
    const trigger = rule.trigger as TriggerConfig;
    
    switch (trigger.type) {
      case 'regex':
        const regex = new RegExp(trigger.pattern, trigger.flags);
        return regex.test(message.text);
      
      case 'keyword':
        const text = message.text.toLowerCase();
        return trigger.keywords.some(keyword => {
          const kw = keyword.toLowerCase();
          switch (trigger.matchType) {
            case 'exact': return text === kw;
            case 'contains': return text.includes(kw);
            case 'startsWith': return text.startsWith(kw);
          }
        });
      
      case 'ai':
        const classification = await this.aiClassifier.classify(message.text);
        return trigger.categories.includes(classification.category) &&
               classification.confidence >= trigger.minConfidence;
    }
  }
  
  async reviewQueueItem(itemId: string, modId: string, action: 'approve' | 'reject', actionTaken?: string) {
    await prisma.modQueue.update({
      where: { id: itemId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: modId,
        reviewedAt: new Date(),
        actionTaken
      }
    });
  }
}
```

### AI Classifier (Beispiel mit OpenAI)

```typescript
// src/lib/services/ai-classifier.ts
import OpenAI from 'openai';

export class AIClassifier {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async classify(text: string): Promise<ClassificationResult> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist ein Content-Moderations-Assistent für Twitch-Chat. 
Klassifiziere die folgende Nachricht in eine Kategorie:
- safe: Normale, unbedenkliche Nachricht
- spam: Wiederholte oder werbende Inhalte
- mild_toxicity: Leicht unhöflich oder provokant
- severe_toxicity: Stark beleidigend oder bedrohend
- hate_speech: Hassrede gegen Gruppen
- harassment: Gezielte Belästigung
- sexual: Sexuelle Inhalte
- phishing: Betrügerische Links
- question: Eine Frage an den Streamer
- praise: Positives Feedback

Antworte im JSON-Format: { "category": "...", "confidence": 0.0-1.0, "reasoning": "..." }`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 100
    });
    
    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        category: result.category || 'unknown',
        confidence: result.confidence || 0,
        reasoning: result.reasoning,
        suggestedAction: this.getDefaultAction(result.category)
      };
    } catch {
      return {
        category: 'unknown',
        confidence: 0,
        suggestedAction: 'allow'
      };
    }
  }
  
  private getDefaultAction(category: string): FilterAction {
    const actions: Record<string, FilterAction> = {
      safe: 'allow',
      spam: 'delete',
      mild_toxicity: 'warn',
      severe_toxicity: 'timeout',
      hate_speech: 'ban',
      harassment: 'timeout',
      sexual: 'delete',
      phishing: 'ban',
      question: 'allow',
      praise: 'allow',
    };
    return actions[category] || 'allow';
  }
}
```

---

## 4. Frontend

### Dashboard

```typescript
// src/app/(dashboard)/dashboard/chat-filter/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { FilterConfigForm } from '@/components/chat-filter/FilterConfigForm';
import { RulesEditor } from '@/components/chat-filter/RulesEditor';
import { ModQueue } from '@/components/chat-filter/ModQueue';
import { FilterStats } from '@/components/chat-filter/FilterStats';

export default async function ChatFilterPage() {
  const session = await getServerSession(authOptions);
  
  const config = await prisma.chatFilterConfig.findUnique({
    where: { userId: session!.user!.id },
    include: {
      rules: { orderBy: { priority: 'desc' } },
      queue: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: { select: { logs: true } }
    }
  });
  
  return (
    <PageWrapper
      title="Smart Chat Filter"
      description="KI-gestützte Moderation für deinen Chat"
    >
      <Tabs defaultValue="config" className="w-full">
        <TabsList>
          <TabsTrigger value="config">Einstellungen</TabsTrigger>
          <TabsTrigger value="rules">Regeln</TabsTrigger>
          <TabsTrigger value="queue">
            Mod-Queue
            {config?.queue.length ? (
              <span className="ml-2 px-2 py-0.5 bg-red-500 rounded-full text-xs">
                {config.queue.length}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="stats">Statistiken</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card className="p-6">
            <FilterConfigForm config={config} />
          </Card>
        </TabsContent>
        
        <TabsContent value="rules">
          <RulesEditor rules={config?.rules || []} />
        </TabsContent>
        
        <TabsContent value="queue">
          <ModQueue items={config?.queue || []} />
        </TabsContent>
        
        <TabsContent value="stats">
          <FilterStats configId={config?.id} />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
```

### Mod-Queue Komponente

```typescript
// src/components/chat-filter/ModQueue.tsx
'use client';

import { useState, useTransition } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { reviewQueueItem } from '@/actions/chat-filter';
import type { ModQueue } from '@prisma/client';

interface Props {
  items: ModQueue[];
}

export function ModQueue({ items }: Props) {
  const [isPending, startTransition] = useTransition();
  
  const handleReview = (id: string, action: 'approve' | 'reject', actionTaken?: string) => {
    startTransition(async () => {
      await reviewQueueItem(id, action, actionTaken);
    });
  };
  
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center text-zinc-400">
        <p>Keine Nachrichten zur Überprüfung</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold">{item.userName}</span>
              <span className="text-zinc-400 text-sm ml-2">
                {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: de })}
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant={getCategoryVariant(item.category)}>
                {item.category}
              </Badge>
              <Badge variant="outline">
                {Math.round(item.confidence * 100)}%
              </Badge>
            </div>
          </div>
          
          <p className="bg-zinc-800 rounded p-3 mb-3 font-mono text-sm">
            {item.message}
          </p>
          
          {item.reasoning && (
            <p className="text-sm text-zinc-400 mb-3">
              <strong>AI-Begründung:</strong> {item.reasoning}
            </p>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => handleReview(item.id, 'approve')}
              disabled={isPending}
            >
              ✓ Erlauben
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleReview(item.id, 'reject', 'delete')}
              disabled={isPending}
            >
              🗑️ Löschen
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview(item.id, 'reject', 'timeout')}
              disabled={isPending}
            >
              ⏱️ Timeout
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function getCategoryVariant(category: string) {
  switch (category) {
    case 'severe_toxicity':
    case 'hate_speech':
    case 'harassment':
      return 'destructive';
    case 'mild_toxicity':
    case 'spam':
      return 'warning';
    case 'question':
    case 'praise':
      return 'success';
    default:
      return 'default';
  }
}
```

---

## 5. Twitch Integration

### Chat-Verbindung

```typescript
// IRC/TMI.js für Chat-Nachrichten
import tmi from 'tmi.js';

const client = new tmi.Client({
  connection: { reconnect: true },
  channels: ['channelname']
});

client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  
  const chatMessage = {
    id: tags.id!,
    text: message,
    user: {
      id: tags['user-id']!,
      name: tags.username!,
      displayName: tags['display-name']!,
      isMod: tags.mod || false,
      isVIP: tags.badges?.vip === '1',
      isSub: tags.subscriber || false,
    },
    channel: channel.replace('#', ''),
    timestamp: new Date(),
  };
  
  const result = await chatFilterService.processMessage(channel, chatMessage);
  
  if (result.action === 'delete') {
    await client.deletemessage(channel, tags.id!);
  } else if (result.action === 'timeout') {
    await client.timeout(channel, tags.username!, result.duration || 600, result.reason);
  } else if (result.action === 'ban') {
    await client.ban(channel, tags.username!, result.reason);
  }
});
```

### Benötigte Scopes

| Scope | Zweck |
|-------|-------|
| `chat:read` | Chat-Nachrichten lesen |
| `chat:edit` | Nachrichten senden/löschen |
| `moderator:manage:chat_messages` | Nachrichten löschen |
| `moderator:manage:banned_users` | Timeouts/Bans |

---

## 6. Sicherheit & Datenschutz

- Chat-Nachrichten werden nur temporär für Analyse gespeichert (max 24h)
- AI-Klassifizierung erfolgt lokal oder via datenschutzkonformer API
- Logs werden nach 30 Tagen gelöscht
- Keine Speicherung von User-IPs

---

## 7. Roadmap

### MVP
- [x] Regex-basierte Regeln
- [x] Keyword-Filter
- [x] Mod-Queue
- [x] Basis-Logging

### v1.1
- [ ] AI-Klassifizierung
- [ ] Confidence-basierte Aktionen
- [ ] Regel-Prioritäten

### v2.0
- [ ] Kontext-Analyse (vorherige Nachrichten)
- [ ] User-Reputation-Score
- [ ] Automatisches Lernen

---

---

## T-CHAT-002 — First-Time Chatter Highlighter

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Neue Viewer werden übersehen, fühlen sich nicht willkommen.

**Lösung:** Automatische Hervorhebung von First-Time-Chattern mit optionaler Begrüßung.

### Features
- Overlay-Highlight für First-Timer
- Auto-Begrüßung via Bot
- Statistiken: Wie viele neue Chatter pro Stream
- Optional: First-Timer Queue für persönliche Begrüßung

### Prisma Schema

```prisma
model FirstTimerConfig {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled       Boolean  @default(true)
  
  /// Overlay
  showOverlay   Boolean  @default(true)
  overlayDuration Int    @default(10000)
  
  /// Auto-Greeting
  autoGreet     Boolean  @default(false)
  greetMessage  String?  @default("Willkommen im Chat, {user}! 👋")
  
  /// Sound
  playSound     Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model FirstTimerLog {
  id            String   @id @default(cuid())
  channelId     String
  
  twitchUserId  String
  userName      String
  firstMessage  String
  
  greeted       Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  
  @@index([channelId])
  @@index([createdAt])
}
```

### EventSub

```typescript
// Nutzt das first-message Tag aus IRC
client.on('message', (channel, tags, message) => {
  if (tags['first-msg']) {
    firstTimerService.handleFirstTimer({
      userId: tags['user-id'],
      userName: tags.username,
      message,
      channel
    });
  }
});
```

---

## T-CHAT-003 — Question Detector & Queue

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Fragen gehen im Chat unter, Viewer fühlen sich ignoriert.

**Lösung:** Automatische Erkennung von Fragen und Queue für den Streamer.

### Features
- Erkennung via `?` am Ende oder Frageworte
- Queue im Dashboard
- Overlay mit "Aktuelle Frage"
- Markierung als "beantwortet"

### Logik

```typescript
function isQuestion(message: string): boolean {
  // Einfache Heuristik
  if (message.trim().endsWith('?')) return true;
  
  const questionWords = [
    'wer', 'was', 'wann', 'wo', 'warum', 'wie', 'wieso', 'weshalb',
    'who', 'what', 'when', 'where', 'why', 'how', 'which',
    'kannst du', 'könntest du', 'can you', 'could you'
  ];
  
  const lower = message.toLowerCase();
  return questionWords.some(word => lower.startsWith(word + ' '));
}
```

---

## T-CHAT-004 — Chat Command Builder

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-004 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Standard-Commands sind statisch, keine Variablen/Logik möglich.

**Lösung:** Visueller Builder für dynamische Commands mit Variablen.

### Features
- Drag & Drop Command Builder
- Variablen: `{user}`, `{count}`, `{uptime}`, `{game}`, `{title}`
- Cooldowns (global/per-user)
- Berechtigungsstufen
- Aliase

### Prisma Schema

```prisma
model ChatCommand {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Command-Name (ohne !)
  name          String
  
  /// Aliase (JSON Array)
  aliases       Json     @default("[]")
  
  /// Antwort-Template
  response      String
  
  /// Cooldowns (Sekunden)
  globalCooldown Int     @default(5)
  userCooldown   Int     @default(30)
  
  /// Berechtigung
  permission    String   @default("everyone") // everyone, subscriber, vip, moderator, broadcaster
  
  /// Statistiken
  useCount      Int      @default(0)
  lastUsedAt    DateTime?
  
  enabled       Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([userId, name])
  @@index([userId])
}
```

### Variable-System

```typescript
interface CommandVariable {
  name: string;
  description: string;
  resolver: (context: CommandContext) => Promise<string>;
}

const variables: CommandVariable[] = [
  {
    name: 'user',
    description: 'Name des aufrufenden Users',
    resolver: async (ctx) => ctx.user.displayName
  },
  {
    name: 'count',
    description: 'Anzahl der Aufrufe',
    resolver: async (ctx) => String(ctx.command.useCount + 1)
  },
  {
    name: 'uptime',
    description: 'Stream-Laufzeit',
    resolver: async (ctx) => {
      const stream = await getTwitchStream(ctx.channelId);
      if (!stream) return 'offline';
      return formatDuration(Date.now() - stream.startedAt.getTime());
    }
  },
  {
    name: 'game',
    description: 'Aktuelle Kategorie',
    resolver: async (ctx) => {
      const channel = await getTwitchChannel(ctx.channelId);
      return channel.gameName || 'Keine Kategorie';
    }
  },
  {
    name: 'title',
    description: 'Stream-Titel',
    resolver: async (ctx) => {
      const channel = await getTwitchChannel(ctx.channelId);
      return channel.title;
    }
  },
  {
    name: 'random',
    description: 'Zufällige Zahl (1-100)',
    resolver: async () => String(Math.floor(Math.random() * 100) + 1)
  },
  {
    name: 'target',
    description: 'Erstes Argument oder User',
    resolver: async (ctx) => ctx.args[0] || ctx.user.displayName
  }
];

async function parseTemplate(template: string, context: CommandContext): Promise<string> {
  let result = template;
  
  for (const variable of variables) {
    const pattern = new RegExp(`\\{${variable.name}\\}`, 'gi');
    if (pattern.test(result)) {
      const value = await variable.resolver(context);
      result = result.replace(pattern, value);
    }
  }
  
  return result;
}
```

---

## T-CHAT-005 — Timed Messages (Auto-Posts)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-005 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Regelmäßige Infos (Socials, Regeln, Discord) müssen manuell gepostet werden.

**Lösung:** Automatische, zeitgesteuerte Nachrichten mit Chat-Aktivitäts-Check.

### Features
- Intervall-basierte Nachrichten
- Mindest-Chat-Aktivität (X Nachrichten seit letztem Post)
- Rotation mehrerer Nachrichten
- Stream-Stunden-Filter

---

## T-CHAT-006 — Shoutout Manager

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-006 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Shoutouts für Raider/VIPs sind manuell und uneinheitlich.

**Lösung:** Automatische Shoutouts mit Channel-Preview und Twitch `/shoutout`.

### Features
- Auto-Shoutout bei Raids (ab X Viewer)
- Shoutout-Queue für Mods
- Channel-Preview (Kategorie, letzter Stream)
- Twitch Native Shoutout + Chat-Nachricht

### Twitch API

```typescript
// Shoutout via Helix
async function sendShoutout(fromId: string, toId: string) {
  await fetch('https://api.twitch.tv/helix/chat/shoutouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from_broadcaster_id: fromId,
      to_broadcaster_id: toId,
      moderator_id: fromId
    })
  });
}
```

---

## T-CHAT-007 — Emote-Only Mode Timer

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-007 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Manuelles Ein-/Ausschalten von Emote-Only bei Cutscenes/Spoilern.

**Lösung:** Ein-Klick Emote-Only mit Timer und Auto-Deaktivierung.

### Features
- Schnell-Buttons: 1min, 5min, 10min
- Hotkey-Integration
- Overlay-Indikator
- Auto-Announce im Chat

---

## T-CHAT-008 — Chat Sentiment Meter

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-008 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Streamer merken toxische Chat-Stimmung zu spät.

**Lösung:** Echtzeit-Sentiment-Analyse mit Warn-Overlay.

### Features
- Positiv/Neutral/Negativ Score
- Rolling Window (letzte 50 Nachrichten)
- Alert bei rapidem Stimmungsabfall
- Historischer Graph

### Sentiment-Analyse

```typescript
interface SentimentResult {
  score: number;      // -1 bis +1
  positive: number;   // Anzahl positiver Nachrichten
  neutral: number;
  negative: number;
  trend: 'rising' | 'falling' | 'stable';
}

function analyzeSentiment(messages: ChatMessage[]): SentimentResult {
  const positiveEmotes = ['PogChamp', 'LUL', 'Kappa', '❤️', '👍'];
  const negativeEmotes = ['BabyRage', 'NotLikeThis', 'FailFish', '👎'];
  
  let positive = 0, negative = 0, neutral = 0;
  
  for (const msg of messages) {
    const hasPositive = positiveEmotes.some(e => msg.text.includes(e));
    const hasNegative = negativeEmotes.some(e => msg.text.includes(e));
    
    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    else neutral++;
  }
  
  const total = messages.length;
  const score = total > 0 ? (positive - negative) / total : 0;
  
  return { score, positive, negative, neutral, trend: 'stable' };
}
```

---

## T-CHAT-009 — VIP/Sub Recognition Badges

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-009 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Lange Subs/VIPs werden nicht besonders anerkannt.

**Lösung:** Custom Badges für Loyalitäts-Meilensteine im Overlay.

---

## T-CHAT-010 — Quote System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-010 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Lustige Streamer-Zitate gehen verloren.

**Lösung:** Quote-Datenbank mit Commands `!addquote`, `!quote`, `!quote 42`.

---

## T-CHAT-011 — Chat Replay (Clip-Sync)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-011 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Chat-Reaktionen sind nicht in Clips/VODs sichtbar.

**Lösung:** Chat-Nachrichten mit Timestamps speichern für Replay.

---

## T-CHAT-012 — Multi-Language Chat Bridge

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-CHAT-012 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Internationale Viewer verstehen sich nicht.

**Lösung:** Automatische Übersetzung von Chat-Nachrichten.

### Features
- Sprach-Erkennung
- Übersetzung in Zielsprache(n)
- Opt-in per User
- Translations als Whisper oder Inline

---

## Zusammenfassung Chat Experience

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-CHAT-001 | Smart Chat Filter (AI) | 🔴 | XL |
| T-CHAT-002 | First-Time Chatter Highlighter | 🔴 | S |
| T-CHAT-003 | Question Detector & Queue | 🟡 | M |
| T-CHAT-004 | Chat Command Builder | 🔴 | M |
| T-CHAT-005 | Timed Messages | 🟡 | S |
| T-CHAT-006 | Shoutout Manager | 🟡 | S |
| T-CHAT-007 | Emote-Only Mode Timer | 🟢 | S |
| T-CHAT-008 | Chat Sentiment Meter | 🟢 | L |
| T-CHAT-009 | VIP/Sub Recognition Badges | 🟢 | S |
| T-CHAT-010 | Quote System | 🟢 | S |
| T-CHAT-011 | Chat Replay (Clip-Sync) | 🟡 | L |
| T-CHAT-012 | Multi-Language Chat Bridge | 🟢 | L |

---

*Weiter zu [03-moderation-safety.md](./03-moderation-safety.md)*
