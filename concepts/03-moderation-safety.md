# 🛡️ Moderation & Safety (10 Tools)

> Werkzeuge für sichere und kontrollierte Stream-Umgebungen

---

## T-MOD-001 — Mod Dashboard (Command Center)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-001 |
| **Kategorie** | Moderation & Safety |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Moderatoren |

### Problem & Lösung

**Problem:**  
Mods nutzen nur den Chat und haben keinen Überblick über Stream-Status, Queue, Alerts.

**Lösung:**  
Dediziertes Mod-Dashboard mit allen relevanten Informationen und Schnellaktionen.

---

## 1. Aufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Mod Dashboard                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Stream    │  │   Chat      │  │   Queue     │  │   Actions   │ │
│  │   Status    │  │   Monitor   │  │   Manager   │  │   Panel     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   User      │  │   Mod       │  │   Alert     │                  │
│  │   Lookup    │  │   Log       │  │   History   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Features

- **Stream Status**: Live/Offline, Viewer, Uptime, Kategorie
- **Chat Monitor**: Echtzeit-Chat mit Filteroptionen
- **User Lookup**: Schnelle User-Infos (Account-Alter, Follow-Datum, Chat-History)
- **Quick Actions**: Timeout, Ban, Clear, Slow Mode, Sub-Only
- **Mod Queue**: Ausstehende Reviews
- **Alert Control**: Alerts pausieren/skippen/testen
- **Mod Log**: Chronik aller Mod-Aktionen

### Dashboard-Seite

```typescript
// src/app/(mod)/mod/[channelId]/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { StreamStatusCard } from '@/components/mod/StreamStatusCard';
import { ChatMonitor } from '@/components/mod/ChatMonitor';
import { QuickActions } from '@/components/mod/QuickActions';
import { UserLookup } from '@/components/mod/UserLookup';
import { ModQueue } from '@/components/mod/ModQueue';
import { ModLog } from '@/components/mod/ModLog';

interface Props {
  params: { channelId: string };
}

export default async function ModDashboard({ params }: Props) {
  const session = await getServerSession(authOptions);
  
  // Prüfen ob User Mod für diesen Channel ist
  const isMod = await checkModStatus(session?.user?.id, params.channelId);
  if (!isMod) {
    redirect('/unauthorized');
  }
  
  const channelInfo = await getChannelInfo(params.channelId);
  
  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          Mod Dashboard: {channelInfo.displayName}
        </h1>
      </header>
      
      <div className="grid grid-cols-12 gap-4">
        {/* Stream Status */}
        <div className="col-span-3">
          <StreamStatusCard channelId={params.channelId} />
        </div>
        
        {/* Quick Actions */}
        <div className="col-span-3">
          <QuickActions channelId={params.channelId} />
        </div>
        
        {/* User Lookup */}
        <div className="col-span-6">
          <UserLookup channelId={params.channelId} />
        </div>
        
        {/* Chat Monitor - Full Width */}
        <div className="col-span-8">
          <ChatMonitor channelId={params.channelId} />
        </div>
        
        {/* Mod Queue + Log */}
        <div className="col-span-4 space-y-4">
          <ModQueue channelId={params.channelId} />
          <ModLog channelId={params.channelId} />
        </div>
      </div>
    </div>
  );
}
```

### Quick Actions Komponente

```typescript
// src/components/mod/QuickActions.tsx
'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  executeTimeout, 
  executeBan, 
  clearChat, 
  setSlowMode,
  setSubOnlyMode,
  setEmoteOnlyMode 
} from '@/actions/moderation';

interface Props {
  channelId: string;
}

export function QuickActions({ channelId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [targetUser, setTargetUser] = useState('');
  
  const handleTimeout = (duration: number) => {
    if (!targetUser) return;
    startTransition(async () => {
      await executeTimeout(channelId, targetUser, duration);
      setTargetUser('');
    });
  };
  
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      
      {/* User Target */}
      <div className="mb-4">
        <Input
          placeholder="Username"
          value={targetUser}
          onChange={(e) => setTargetUser(e.target.value)}
        />
      </div>
      
      {/* Timeout Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Button size="sm" onClick={() => handleTimeout(60)} disabled={isPending}>
          1min
        </Button>
        <Button size="sm" onClick={() => handleTimeout(600)} disabled={isPending}>
          10min
        </Button>
        <Button size="sm" onClick={() => handleTimeout(3600)} disabled={isPending}>
          1h
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending}>
          Ban
        </Button>
      </div>
      
      {/* Chat Controls */}
      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={() => clearChat(channelId)}>
          🧹 Clear Chat
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setSlowMode(channelId, 30)}>
            🐢 Slow Mode
          </Button>
          <Button variant="outline" onClick={() => setSubOnlyMode(channelId, true)}>
            ⭐ Sub Only
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## T-MOD-002 — User Reputation System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-002 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Neue User werden gleich behandelt wie Stammzuschauer, obwohl Risiko unterschiedlich.

**Lösung:** Reputation-Score basierend auf Account-Alter, Verhalten, Aktivität.

### Faktoren

```typescript
interface ReputationFactors {
  accountAge: number;        // Tage seit Erstellung
  followAge: number;         // Tage seit Follow
  totalMessages: number;     // Gesamt-Nachrichten im Channel
  warningsCount: number;     // Warnungen
  timeoutsCount: number;     // Timeouts
  bansCount: number;         // Bans (in anderen Channels, wenn verfügbar)
  isSubscriber: boolean;
  isVIP: boolean;
  positiveInteractions: number; // Positive Mod-Interaktionen
}

function calculateReputation(factors: ReputationFactors): number {
  let score = 50; // Basis-Score
  
  // Positive Faktoren
  score += Math.min(factors.accountAge / 30, 20);       // Max +20 für Account-Alter
  score += Math.min(factors.followAge / 7, 10);         // Max +10 für Follow-Dauer
  score += Math.min(factors.totalMessages / 100, 10);   // Max +10 für Aktivität
  score += factors.isSubscriber ? 10 : 0;
  score += factors.isVIP ? 5 : 0;
  score += Math.min(factors.positiveInteractions * 2, 10);
  
  // Negative Faktoren
  score -= factors.warningsCount * 5;
  score -= factors.timeoutsCount * 10;
  score -= factors.bansCount * 25;
  
  return Math.max(0, Math.min(100, score));
}
```

### Prisma Schema

```prisma
model UserReputation {
  id            String   @id @default(cuid())
  channelId     String
  twitchUserId  String
  
  /// Reputation Score (0-100)
  score         Int      @default(50)
  
  /// Faktoren
  totalMessages Int      @default(0)
  warnings      Int      @default(0)
  timeouts      Int      @default(0)
  positiveNotes Int      @default(0)
  
  /// Timestamps
  firstSeen     DateTime @default(now())
  lastSeen      DateTime @default(now())
  
  updatedAt     DateTime @updatedAt
  
  @@unique([channelId, twitchUserId])
  @@index([channelId])
  @@index([score])
}
```

---

## T-MOD-003 — Raid Protection System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-003 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Hate-Raids können den Chat überfluten, bevor Mods reagieren können.

**Lösung:** Automatische Erkennung ungewöhnlicher Chat-Patterns mit Auto-Defense.

### Detection-Logik

```typescript
interface RaidPattern {
  type: 'message_flood' | 'new_account_flood' | 'similar_messages' | 'emote_spam';
  threshold: number;
  window: number; // Sekunden
  action: 'slow' | 'sub_only' | 'emote_only' | 'follower_only' | 'clear';
}

const DEFAULT_PATTERNS: RaidPattern[] = [
  {
    type: 'message_flood',
    threshold: 50,      // 50 Nachrichten
    window: 10,         // in 10 Sekunden
    action: 'slow'
  },
  {
    type: 'new_account_flood',
    threshold: 10,      // 10 neue Accounts
    window: 60,         // in 60 Sekunden
    action: 'follower_only'
  },
  {
    type: 'similar_messages',
    threshold: 5,       // 5 ähnliche Nachrichten
    window: 30,
    action: 'clear'
  }
];

class RaidDetector {
  private messageBuffer: ChatMessage[] = [];
  
  analyze(message: ChatMessage): RaidAlert | null {
    this.messageBuffer.push(message);
    this.cleanOldMessages();
    
    for (const pattern of this.patterns) {
      if (this.matchesPattern(pattern)) {
        return {
          pattern,
          triggeredAt: new Date(),
          sampleMessages: this.messageBuffer.slice(-10)
        };
      }
    }
    
    return null;
  }
  
  private matchesPattern(pattern: RaidPattern): boolean {
    const windowStart = Date.now() - pattern.window * 1000;
    const recentMessages = this.messageBuffer.filter(m => m.timestamp > windowStart);
    
    switch (pattern.type) {
      case 'message_flood':
        return recentMessages.length >= pattern.threshold;
      
      case 'new_account_flood':
        const newAccounts = recentMessages.filter(m => 
          m.user.accountAge < 7 // Tage
        );
        return newAccounts.length >= pattern.threshold;
      
      case 'similar_messages':
        return this.hasSimilarMessages(recentMessages, pattern.threshold);
      
      default:
        return false;
    }
  }
  
  private hasSimilarMessages(messages: ChatMessage[], threshold: number): boolean {
    const normalized = messages.map(m => m.text.toLowerCase().trim());
    const counts = new Map<string, number>();
    
    for (const msg of normalized) {
      counts.set(msg, (counts.get(msg) || 0) + 1);
    }
    
    return [...counts.values()].some(count => count >= threshold);
  }
}
```

### Auto-Defense Actions

```typescript
async function executeDefense(channelId: string, action: string, duration: number = 300) {
  switch (action) {
    case 'slow':
      await twitchApi.updateChatSettings(channelId, { slow_mode: true, slow_mode_wait_time: 30 });
      break;
    
    case 'sub_only':
      await twitchApi.updateChatSettings(channelId, { subscriber_mode: true });
      break;
    
    case 'emote_only':
      await twitchApi.updateChatSettings(channelId, { emote_mode: true });
      break;
    
    case 'follower_only':
      await twitchApi.updateChatSettings(channelId, { follower_mode: true, follower_mode_duration: 10 });
      break;
    
    case 'clear':
      // Löscht alle Nachrichten der letzten Sekunden
      await twitchApi.deleteChatMessages(channelId);
      break;
  }
  
  // Auto-Revert nach Duration
  setTimeout(async () => {
    await revertDefense(channelId, action);
  }, duration * 1000);
}
```

---

## T-MOD-004 — Ban Reason Tracker

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Mods wissen nicht, warum jemand gebannt wurde (vor allem bei alten Bans).

**Lösung:** Strukturierte Ban-Dokumentation mit Kontext und Evidence.

### Prisma Schema

```prisma
model BanRecord {
  id            String   @id @default(cuid())
  channelId     String
  
  /// Gebannter User
  targetUserId  String
  targetUserName String
  
  /// Ausführender Mod
  modUserId     String
  modUserName   String
  
  /// Details
  reason        String
  evidence      Json?    // Screenshots, Message-IDs, etc.
  
  /// Ban-Typ
  banType       String   // permanent, timeout
  duration      Int?     // Sekunden (bei Timeout)
  
  /// Status
  isActive      Boolean  @default(true)
  unbannedAt    DateTime?
  unbannedBy    String?
  unbanReason   String?
  
  createdAt     DateTime @default(now())
  
  @@index([channelId])
  @@index([targetUserId])
  @@index([isActive])
}
```

---

## T-MOD-005 — Suspicious Account Detector

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-005 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Bot-Accounts und Evade-Accounts sind schwer zu erkennen.

**Lösung:** Heuristik-basierte Erkennung verdächtiger Accounts.

### Indikatoren

```typescript
interface SuspicionIndicators {
  // Account
  accountAgeHours: number;
  hasDefaultAvatar: boolean;
  hasGenericName: boolean;  // z.B. "user12345678"
  
  // Verhalten
  firstMessageIsLink: boolean;
  messageSimilarityToKnownSpam: number;
  typingSpeed: number;  // Zeichen pro Sekunde
  
  // Netzwerk
  sameIpAsRecentBan: boolean;
  followedManyChannelsRecently: boolean;
}

function calculateSuspicionScore(indicators: SuspicionIndicators): number {
  let score = 0;
  
  if (indicators.accountAgeHours < 24) score += 30;
  else if (indicators.accountAgeHours < 168) score += 15; // < 1 Woche
  
  if (indicators.hasDefaultAvatar) score += 10;
  if (indicators.hasGenericName) score += 20;
  if (indicators.firstMessageIsLink) score += 40;
  
  score += indicators.messageSimilarityToKnownSpam * 50;
  
  if (indicators.typingSpeed > 20) score += 15; // Zu schnelles Tippen
  
  return Math.min(100, score);
}
```

---

## T-MOD-006 — Mod Action Templates

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-006 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Mods tippen die gleichen Warnungen/Gründe immer wieder.

**Lösung:** Vordefinierte Aktions-Templates mit Schnellauswahl.

### Features

- Template-Library (Warn-Texte, Ban-Gründe)
- Variablen: `{user}`, `{rule}`, `{count}`
- Hotkey-Zuweisung
- Team-Sharing

---

## T-MOD-007 — Cross-Channel Ban Sync

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-007 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** User, die in einem Channel gebannt sind, können in befreundeten Channels weiter stören.

**Lösung:** Opt-in Ban-Sharing zwischen vertrauenswürdigen Channels.

### Features

- Ban-Listen teilen (nur mit Zustimmung beider Seiten)
- Kategorisierte Bans (Spam, Harassment, etc.)
- Review vor Auto-Ban
- Privacy: Nur Hashes, keine Usernames

---

## T-MOD-008 — Mod Shift Scheduler

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-008 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Mod-Abdeckung ist unklar, manchmal ist niemand da.

**Lösung:** Schichtplan für Mods mit Verfügbarkeits-Tracking.

### Features

- Kalender-Integration
- Verfügbarkeits-Eingabe
- Benachrichtigungen bei fehlender Abdeckung
- Backup-Mod-System

---

## T-MOD-009 — Clip Evidence System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-009 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Bei Streitigkeiten gibt es kein Video-Beweismaterial.

**Lösung:** Automatische Clip-Erstellung bei Mod-Aktionen.

### Features

- Auto-Clip bei Bans (letzte 30 Sekunden)
- Secure Storage (nur Mods können zugreifen)
- Automatische Löschung nach 30 Tagen
- Export für Twitch-Reports

---

## T-MOD-010 — DMCA Audio Detector

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MOD-010 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | XL |

### Problem & Lösung

**Problem:** Streamer spielen versehentlich urheberrechtlich geschützte Musik.

**Lösung:** Echtzeit-Audio-Fingerprinting mit Warnungen.

### Features

- Audio-Stream-Analyse
- Bekannte DMCA-Tracks erkennen
- Overlay-Warnung
- Automatische Stummschaltung (optional)
- VOD-Mute-Marker

---

## Zusammenfassung Moderation & Safety

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-MOD-001 | Mod Dashboard | 🔴 | L |
| T-MOD-002 | User Reputation System | 🟡 | L |
| T-MOD-003 | Raid Protection System | 🔴 | M |
| T-MOD-004 | Ban Reason Tracker | 🟡 | S |
| T-MOD-005 | Suspicious Account Detector | 🔴 | M |
| T-MOD-006 | Mod Action Templates | 🟢 | S |
| T-MOD-007 | Cross-Channel Ban Sync | 🟡 | L |
| T-MOD-008 | Mod Shift Scheduler | 🟢 | M |
| T-MOD-009 | Clip Evidence System | 🟢 | M |
| T-MOD-010 | DMCA Audio Detector | 🔴 | XL |

---

*Weiter zu [04-viewer-games-engagement.md](./04-viewer-games-engagement.md)*
