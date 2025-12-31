# 📈 Analytics & Insights (10 Tools)

> Datengetriebene Einblicke für Stream-Optimierung

---

## T-ANA-001 — Stream Performance Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-001 |
| **Kategorie** | Analytics |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Streamer |

### Problem & Lösung

**Problem:**  
Twitch Analytics sind limitiert und nicht actionable.

**Lösung:**  
Erweitertes Dashboard mit tieferen Insights und Handlungsempfehlungen.

### Metriken

```typescript
interface StreamMetrics {
  // Viewer
  peakViewers: number;
  averageViewers: number;
  uniqueViewers: number;
  viewerRetention: number;  // % die >10 min bleiben
  
  // Chat
  totalMessages: number;
  uniqueChatters: number;
  messagesPerMinute: number;
  emoteUsage: EmoteStats[];
  
  // Engagement
  followsGained: number;
  subsGained: number;
  bitsReceived: number;
  raidsSent: number;
  raidsReceived: number;
  
  // Content
  streamDuration: number;
  categoriesPlayed: CategoryStats[];
  clipsMade: number;
  
  // Technical
  averageBitrate: number;
  droppedFrames: number;
  qualityScore: number;
}
```

### Features

- Echtzeit-Metriken während des Streams
- Post-Stream Summary
- Historischer Vergleich (vs. letzte Woche, Durchschnitt)
- Heatmaps für Viewer-Verlauf
- Segment-Analyse (welche Kategorie performt am besten)

### Datenfluss

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Collection                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Twitch API     │  EventSub       │  Chat (IRC)    │  OBS Stats    │
│  (Polling)      │  (Realtime)     │  (Realtime)    │  (WebSocket)  │
└────────┬────────┴────────┬────────┴────────┬───────┴───────┬───────┘
         │                 │                 │               │
         ▼                 ▼                 ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Processing Pipeline                        │
├─────────────────────────────────────────────────────────────────────┤
│  Aggregation    │  Normalization  │  Enrichment   │  Storage       │
└────────┬────────┴────────┬────────┴────────┬──────┴───────┬────────┘
         │                 │                 │              │
         ▼                 ▼                 ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Analytics Dashboard                             │
├─────────────────────────────────────────────────────────────────────┤
│  Real-time     │  Historical     │  Comparisons  │  Insights       │
│  Widgets       │  Charts         │  Benchmarks   │  Recommendations│
└─────────────────────────────────────────────────────────────────────┘
```

### Prisma Schema

```prisma
model StreamSession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Twitch Stream ID
  twitchStreamId  String?  @unique
  
  /// Timing
  startedAt       DateTime
  endedAt         DateTime?
  duration        Int?     // Sekunden
  
  /// Viewer-Metriken
  peakViewers     Int      @default(0)
  averageViewers  Float    @default(0)
  uniqueViewers   Int      @default(0)
  
  /// Chat-Metriken
  totalMessages   Int      @default(0)
  uniqueChatters  Int      @default(0)
  
  /// Engagement
  newFollowers    Int      @default(0)
  newSubs         Int      @default(0)
  bitsReceived    Int      @default(0)
  raidsReceived   Int      @default(0)
  
  /// Content
  categories      Json     @default("[]")
  title           String?
  
  /// Technical
  averageBitrate  Float?
  droppedFrames   Int      @default(0)
  
  createdAt       DateTime @default(now())
  
  snapshots       StreamSnapshot[]
  
  @@index([userId])
  @@index([startedAt])
}

model StreamSnapshot {
  id              String   @id @default(cuid())
  sessionId       String
  session         StreamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  /// Snapshot-Zeitpunkt
  timestamp       DateTime
  
  /// Metriken zum Zeitpunkt
  viewers         Int
  chatters        Int
  messagesLast5m  Int
  
  category        String?
  
  @@index([sessionId])
  @@index([timestamp])
}
```

---

## T-ANA-002 — Viewer Journey Tracker

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-002 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Unbekannt, wie Viewer zu Followern/Subs werden.

**Lösung:** Funnel-Analyse: View → Chat → Follow → Sub.

### Metriken

```typescript
interface ViewerJourney {
  // Stufen
  totalViewers: number;
  chatters: number;        // % der Viewer die chatten
  followers: number;       // % der Chatter die followen
  subscribers: number;     // % der Follower die subben
  
  // Zeit bis Conversion
  avgTimeToChat: number;   // Minuten
  avgTimeToFollow: number;
  avgTimeToSub: number;
  
  // Drop-off Punkte
  dropOffAfterMinutes: number[];  // Wann verlassen die meisten
}
```

---

## T-ANA-003 — Chat Analytics

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-003 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Chat-Aktivität wird nicht analysiert.

**Lösung:** Tiefe Chat-Analytics mit Trends und Insights.

### Features

- Messages per Minute Graph
- Top Chatters Leaderboard
- Emote-Nutzung Rankings
- Sentiment-Verlauf
- Keyword-Trends
- Peak-Chat-Zeiten identifizieren

---

## T-ANA-004 — A/B Testing Framework

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Entscheidungen basieren auf Gefühl, nicht Daten.

**Lösung:** Strukturiertes A/B Testing für Stream-Elemente.

### Testbare Elemente

- Stream-Titel
- Thumbnail
- Start-Zeit
- Overlay-Layouts
- Alert-Styles
- Kategorie

### Framework

```typescript
interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  
  variants: Variant[];
  
  metric: 'viewers' | 'retention' | 'chat_activity' | 'follows' | 'subs';
  
  status: 'draft' | 'running' | 'completed';
  startDate: Date;
  endDate?: Date;
  
  results?: TestResults;
}

interface Variant {
  id: string;
  name: string;
  config: Record<string, unknown>;
  streams: number;
  metricValue: number;
}

interface TestResults {
  winner: string;
  confidence: number;  // 0-100%
  improvement: number; // %
  significant: boolean;
}
```

---

## T-ANA-005 — Competitor Benchmarking

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-005 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Ahnung, wie man vs. ähnliche Streamer performt.

**Lösung:** Anonymisiertes Benchmarking in der Kategorie.

### Features

- Durchschnitt der Kategorie
- Percentile-Ranking
- Trend-Vergleich
- Best Practices der Top-Performer

---

## T-ANA-006 — Optimal Schedule Finder

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-006 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Unbekannt, wann die beste Zeit zum Streamen ist.

**Lösung:** Datenbasierte Empfehlungen für optimale Stream-Zeiten.

### Analyse

```typescript
interface ScheduleAnalysis {
  // Beste Zeiten basierend auf historischen Daten
  bestDays: DayOfWeek[];
  bestStartTimes: TimeSlot[];
  
  // Kategorie-spezifisch
  categoryPeakTimes: Record<string, TimeSlot[]>;
  
  // Konkurrenz-Analyse
  lowCompetitionSlots: TimeSlot[];
  
  // Viewer-Availability
  audienceOnlineTimes: TimeSlot[];
  
  // Empfehlung
  recommendedSchedule: WeeklySchedule;
}
```

---

## T-ANA-007 — Growth Insights

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-007 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Wachstum ist unklar, keine klaren Hebel.

**Lösung:** Wachstums-Dashboard mit actionable Insights.

### Features

- Follower-Wachstum Graph
- Sub-Wachstum + Churn
- Viewer-Trend
- "Was hat funktioniert" Analyse
- Wachstums-Prognose

---

## T-ANA-008 — Content Performance Analysis

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Unbekannt, welche Inhalte am besten performen.

**Lösung:** Kategorie- und Segment-basierte Analyse.

### Features

- Performance pro Kategorie
- Segment-Analyse (Intro, Main, Outro)
- Clip-Performance
- VOD-Watch-Time Analyse

---

## T-ANA-009 — Real-time Alerts

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-009 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Wichtige Metriken-Änderungen werden nicht bemerkt.

**Lösung:** Push-Benachrichtigungen bei Anomalien.

### Alert-Typen

- Viewer-Spike/Drop (>20%)
- Raid eingehend
- Chat-Sentiment-Abfall
- Neue Follower-Milestone
- Stream-Quality-Problem

---

## T-ANA-010 — Post-Stream Report Generator

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-ANA-010 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Zeit für manuelle Post-Stream-Analyse.

**Lösung:** Automatisch generierter Report nach jedem Stream.

### Report-Inhalte

```typescript
interface PostStreamReport {
  // Summary
  duration: string;
  peakViewers: number;
  averageViewers: number;
  
  // Highlights
  bestMoments: Moment[];    // Basierend auf Chat-Spikes
  topClips: Clip[];
  
  // Achievements
  milestonesReached: Milestone[];
  
  // Comparisons
  vsAverage: ComparisonStats;
  vsLastStream: ComparisonStats;
  
  // Insights
  whatWorked: Insight[];
  whatToImprove: Insight[];
  
  // Recommendations
  recommendations: Recommendation[];
}

function generateReport(session: StreamSession): PostStreamReport {
  return {
    duration: formatDuration(session.duration),
    peakViewers: session.peakViewers,
    averageViewers: session.averageViewers,
    
    bestMoments: findChatSpikes(session),
    topClips: getTopClips(session),
    
    milestonesReached: checkMilestones(session),
    
    vsAverage: compareToAverage(session),
    vsLastStream: compareToLast(session),
    
    whatWorked: analyzeSuccess(session),
    whatToImprove: analyzeWeaknesses(session),
    
    recommendations: generateRecommendations(session)
  };
}
```

---

## Zusammenfassung Analytics

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-ANA-001 | Stream Performance Dashboard | 🔴 | L |
| T-ANA-002 | Viewer Journey Tracker | 🟡 | L |
| T-ANA-003 | Chat Analytics | 🔴 | M |
| T-ANA-004 | A/B Testing Framework | 🟡 | L |
| T-ANA-005 | Competitor Benchmarking | 🟢 | M |
| T-ANA-006 | Optimal Schedule Finder | 🔴 | M |
| T-ANA-007 | Growth Insights | 🔴 | M |
| T-ANA-008 | Content Performance Analysis | 🟡 | M |
| T-ANA-009 | Real-time Alerts | 🟡 | S |
| T-ANA-010 | Post-Stream Report Generator | 🔴 | M |

---

*Weiter zu [08-automation-workflows.md](./08-automation-workflows.md)*

