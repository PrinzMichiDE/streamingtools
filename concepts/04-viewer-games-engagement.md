# 🎮 Viewer Games & Engagement (18 Tools)

> Interaktive Spiele und Engagement-Mechaniken für Viewer-Beteiligung

---

## T-GAME-001 — Channel Points Raffle

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-001 |
| **Kategorie** | Viewer Games |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |
| **Zielgruppe** | Viewer, Streamer |

### Problem & Lösung

**Problem:**  
Giveaways sind langweilig und unfair (wer zuerst kommt, gewinnt).

**Lösung:**  
Channel-Point-basiertes Raffle-System mit fairen Gewinnchancen.

---

## 1. Aufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Raffle System                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Create    │  │   Entry     │  │   Draw      │  │   Winner    │ │
│  │   Raffle    │  │   Manager   │  │   Engine    │  │   Display   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Features

- Einstieg via Channel Point Redemption oder Chat-Command
- Gewichtete Chancen (mehr Punkte = höhere Chance, optional)
- Subscriber/VIP Bonus-Entries
- Gewinner-Animation im Overlay
- Automatische Twitch-Whisper an Gewinner
- Historie aller Raffles

### Prisma Schema

```prisma
model Raffle {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Raffle-Details
  title         String
  description   String?
  prize         String
  
  /// Einstiegs-Kosten
  entryType     String   @default("command") // command, channel_points
  entryCost     Int      @default(0)
  
  /// Regeln
  maxEntries    Int      @default(1)
  subBonus      Int      @default(0)    // Extra-Entries für Subs
  vipBonus      Int      @default(0)
  weighted      Boolean  @default(false) // Mehr Punkte = höhere Chance
  
  /// Status
  status        String   @default("draft") // draft, open, drawing, completed
  
  /// Timing
  openedAt      DateTime?
  closedAt      DateTime?
  drawnAt       DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  entries       RaffleEntry[]
  winners       RaffleWinner[]
  
  @@index([userId])
  @@index([status])
}

model RaffleEntry {
  id            String   @id @default(cuid())
  raffleId      String
  raffle        Raffle   @relation(fields: [raffleId], references: [id], onDelete: Cascade)
  
  twitchUserId  String
  userName      String
  
  entries       Int      @default(1)
  pointsSpent   Int      @default(0)
  
  createdAt     DateTime @default(now())
  
  @@unique([raffleId, twitchUserId])
  @@index([raffleId])
}

model RaffleWinner {
  id            String   @id @default(cuid())
  raffleId      String
  raffle        Raffle   @relation(fields: [raffleId], references: [id], onDelete: Cascade)
  
  twitchUserId  String
  userName      String
  
  /// Wurde der Preis abgeholt?
  claimed       Boolean  @default(false)
  claimedAt     DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([raffleId])
}
```

### Draw-Algorithmus

```typescript
function drawWinner(entries: RaffleEntry[], weighted: boolean): RaffleEntry {
  if (!weighted) {
    // Einfache Zufallsauswahl (1 Entry = 1 Los)
    const flatEntries: RaffleEntry[] = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.entries; i++) {
        flatEntries.push(entry);
      }
    }
    return flatEntries[Math.floor(Math.random() * flatEntries.length)];
  } else {
    // Gewichtete Auswahl (mehr Punkte = höhere Chance)
    const totalWeight = entries.reduce((sum, e) => sum + e.pointsSpent, 0);
    let random = Math.random() * totalWeight;
    
    for (const entry of entries) {
      random -= entry.pointsSpent;
      if (random <= 0) {
        return entry;
      }
    }
    
    return entries[entries.length - 1];
  }
}
```

### Overlay

```typescript
// src/components/overlays/raffle/RaffleOverlay.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Props {
  raffle: Raffle;
  entries: RaffleEntry[];
  winner: RaffleWinner | null;
}

export function RaffleOverlay({ raffle, entries, winner }: Props) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayedWinner, setDisplayedWinner] = useState<string | null>(null);
  
  useEffect(() => {
    if (winner && !displayedWinner) {
      // Drum-Roll Animation
      setIsDrawing(true);
      
      const shuffleInterval = setInterval(() => {
        const randomEntry = entries[Math.floor(Math.random() * entries.length)];
        setDisplayedWinner(randomEntry.userName);
      }, 100);
      
      setTimeout(() => {
        clearInterval(shuffleInterval);
        setDisplayedWinner(winner.userName);
        setIsDrawing(false);
        
        // Confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 3000);
    }
  }, [winner]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <motion.div
        className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-center shadow-2xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-2xl font-bold mb-2">🎉 {raffle.title}</h2>
        <p className="text-zinc-200 mb-6">{raffle.prize}</p>
        
        <div className="bg-black/30 rounded-xl p-6 min-w-[300px]">
          {!winner ? (
            <>
              <p className="text-4xl font-bold mb-2">{entries.length}</p>
              <p className="text-zinc-300">Teilnehmer</p>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-300 mb-2">
                {isDrawing ? 'Ziehe Gewinner...' : 'Gewinner:'}
              </p>
              <motion.p
                className="text-4xl font-bold"
                animate={{ scale: isDrawing ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: isDrawing ? Infinity : 0, duration: 0.2 }}
              >
                {displayedWinner}
              </motion.p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
```

---

## T-GAME-002 — Chat Betting (Virtual Currency)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Twitch Predictions sind auf 2 Optionen limitiert und erfordern echte Channel Points.

**Lösung:** Eigenes Wettsystem mit virtueller Währung und flexiblen Optionen.

### Features

- Eigene virtuelle Währung (z.B. "Coins", "Gems")
- Beliebig viele Wett-Optionen
- Dynamische Quoten
- Leaderboard
- Wettverlauf

### Wett-Logik

```typescript
interface Bet {
  id: string;
  title: string;
  options: BetOption[];
  status: 'open' | 'locked' | 'resolved' | 'cancelled';
  totalPool: number;
  createdAt: Date;
  lockedAt?: Date;
  resolvedAt?: Date;
  winningOptionId?: string;
}

interface BetOption {
  id: string;
  title: string;
  totalWagered: number;
  bettorCount: number;
}

function calculateOdds(option: BetOption, totalPool: number): number {
  if (option.totalWagered === 0) return 0;
  return totalPool / option.totalWagered;
}

function calculatePayout(wager: number, odds: number): number {
  return Math.floor(wager * odds);
}

async function resolveBet(betId: string, winningOptionId: string) {
  const bet = await getBet(betId);
  const winningOption = bet.options.find(o => o.id === winningOptionId);
  const odds = calculateOdds(winningOption, bet.totalPool);
  
  // Gewinner auszahlen
  const winners = await getWagers(betId, winningOptionId);
  for (const wager of winners) {
    const payout = calculatePayout(wager.amount, odds);
    await addCurrency(wager.userId, payout);
  }
}
```

---

## T-GAME-003 — Viewer Duels

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Viewer können nicht gegeneinander antreten.

**Lösung:** 1v1 Duelle mit virtueller Währung als Einsatz.

### Features

- `!duel @user 100` startet ein Duell
- Annahme mit `!accept`
- Zufälliger Gewinner oder Mini-Game
- Cooldowns gegen Spam

---

## T-GAME-004 — Trivia Quiz System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-004 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Chat-Interaktion ist oft einseitig.

**Lösung:** Live-Trivia mit Fragen zur Kategorie, zum Spiel oder allgemein.

### Features

- Fragen-Datenbank (allgemein + custom)
- Kategorie-basierte Fragen (Gaming, Filme, etc.)
- Multiple Choice oder Freitext
- Punktesystem mit Leaderboard
- Streak-Bonus für richtige Antworten

### Prisma Schema

```prisma
model TriviaQuestion {
  id            String   @id @default(cuid())
  
  /// Frage
  question      String
  
  /// Antwort-Typ
  type          String   @default("multiple") // multiple, text, number
  
  /// Antworten (JSON Array)
  options       Json?    // ["A", "B", "C", "D"]
  correctAnswer String
  
  /// Kategorien
  category      String?
  difficulty    String   @default("medium") // easy, medium, hard
  
  /// Statistiken
  timesAsked    Int      @default(0)
  correctRate   Float    @default(0)
  
  /// Quelle
  isCustom      Boolean  @default(false)
  createdBy     String?
  
  createdAt     DateTime @default(now())
  
  @@index([category])
  @@index([difficulty])
}

model TriviaSession {
  id            String   @id @default(cuid())
  channelId     String
  
  status        String   @default("active")
  questionCount Int      @default(10)
  
  currentQuestion Int    @default(0)
  
  startedAt     DateTime @default(now())
  endedAt       DateTime?
  
  scores        TriviaScore[]
  
  @@index([channelId])
}

model TriviaScore {
  id            String   @id @default(cuid())
  sessionId     String
  session       TriviaSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  twitchUserId  String
  userName      String
  
  correctAnswers Int     @default(0)
  streak        Int      @default(0)
  totalPoints   Int      @default(0)
  
  @@unique([sessionId, twitchUserId])
}
```

---

## T-GAME-005 — Chat Plays (Crowd Control)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-005 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | XL |

### Problem & Lösung

**Problem:** Viewer können das Spiel nur passiv beobachten.

**Lösung:** Chat-Abstimmungen steuern Spieleraktionen (wie "Twitch Plays Pokemon").

### Features

- Input-Abstimmung (up, down, left, right, a, b)
- Voting-Fenster (z.B. 10 Sekunden)
- Mehrheits-Entscheidung
- Integration mit Crowd Control / Game-APIs

---

## T-GAME-006 — Marble Race

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-006 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Interaktive Overlay-Spiele fehlen.

**Lösung:** Physik-basiertes Marble-Rennen mit Viewer-Murmeln.

### Features

- Jeder Chatter bekommt eine Murmel
- Physik-Simulation (Matter.js / Rapier)
- Verschiedene Tracks
- Einsätze auf eigene Murmel

---

## T-GAME-007 — Word Chain Game

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-007 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Einfache Wortspiele fehlen.

**Lösung:** Wortkette - nächstes Wort muss mit letztem Buchstaben beginnen.

---

## T-GAME-008 — Chat vs Streamer

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-008 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Es gibt keine direkten Herausforderungen zwischen Chat und Streamer.

**Lösung:** Strukturierte Challenges mit Punktestand.

### Features

- Challenge-Typen: Boss-Kill, Speedrun, No-Death
- Chat kann Hindernisse kaufen
- Streamer verdient Punkte bei Erfolg
- Chat verdient Punkte bei Streamer-Fails
- Saisonales Leaderboard

---

## T-GAME-009 — Bingo Card Generator

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-009 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Stream-Bingos werden manuell erstellt und sind nicht interaktiv.

**Lösung:** Automatische Bingo-Karten mit Klick-zum-Markieren.

### Features

- Template-Vorlagen (Gaming, IRL, etc.)
- Custom Felder
- Jeder Viewer bekommt eigene Karte
- Automatische Bingo-Erkennung
- Winner-Announcement

---

## T-GAME-010 — Viewer Lottery (Daily Spin)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-010 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Keine täglichen Engagement-Anreize.

**Lösung:** Tägliches Glücksrad mit Belohnungen.

### Features

- 1x pro Tag kostenlos
- Preise: Virtuelle Währung, VIP für 1 Stunde, Emote Unlock
- Jackpot für Streak-Teilnahme

---

## T-GAME-011 — Boss Battle (Cooperative)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-011 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Kooperative Elemente fehlen.

**Lösung:** Chat kämpft gemeinsam gegen einen Boss (HP-Bar).

### Features

- Boss hat HP-Pool
- Chat-Nachrichten / Cheers / Subs machen Schaden
- Special Attacks bei Milestones
- Boss-Angriffe (z.B. Slow Mode für 1 Minute)
- Loot bei Sieg

---

## T-GAME-012 — Emote Guessing Game

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-012 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Emote-basierte Spiele fehlen.

**Lösung:** Rate das verpixelte Emote.

### Features

- Emote wird verpixelt angezeigt
- Wird über Zeit klarer
- Schnellste richtige Antwort gewinnt

---

## T-GAME-013 — Viewer Teams

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-013 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Team-Dynamik im Chat.

**Lösung:** Viewer wählen Teams, die gegeneinander punkten.

### Features

- 2-4 Teams zur Auswahl
- Punkte durch Aktivität, Subs, Cheers
- Team-Badges
- Stream-weite Challenges

---

## T-GAME-014 — Death Counter Bet

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-014 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Death Counter ist passiv.

**Lösung:** Viewer wetten auf Anzahl der Deaths.

---

## T-GAME-015 — Stream Stock Market

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-015 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Komplexere Wirtschafts-Spiele fehlen.

**Lösung:** Virtueller Aktienmarkt basierend auf Stream-Metriken.

### Features

- "Aktien" für: Viewer Count, Chat Activity, Sub Count
- Kauf/Verkauf mit virtueller Währung
- Preise ändern sich in Echtzeit
- Dividenden bei Peak-Performance

---

## T-GAME-016 — Hot Take Polls

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-016 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Umfragen sind oft langweilig.

**Lösung:** Kontroverse "Hot Takes" mit Enthüllung.

### Features

- Anonyme Abstimmung
- Dramatische Enthüllung der Ergebnisse
- "Wie viel Prozent stimmten mit dir?"

---

## T-GAME-017 — Viewer Battle Royale

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-017 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Große, langandauernde Spiele fehlen.

**Lösung:** Simuliertes Battle Royale mit allen aktiven Chattern.

### Features

- Alle Chatter starten auf einer "Insel"
- Zufällige Events eliminieren Spieler
- Allianzen durch Commands
- Aktive Teilnahme erhöht Überlebenschance
- Gewinner bekommt Preis

---

## T-GAME-018 — Channel Point Auction

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-018 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Channel Point Rewards sind First-Come-First-Served.

**Lösung:** Auktions-System für besondere Rewards.

### Features

- Timer-basierte Auktion
- Höchstgebot gewinnt
- Mindestgebot / Erhöhungsschritte
- Outbid-Benachrichtigung
- Beliebige Rewards (Song Request, Game Choice, etc.)

---

## T-GAME-019 — Stream Together (Watch Party)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-GAME-019 |
| **Kategorie** | Viewer Games & Engagement |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | XL |
| **Zielgruppe** | Viewer, Freundesgruppen |

### Problem & Lösung

**Problem:**  
Viewer schauen Streams alleine, obwohl sie mit Freunden zusammen schauen möchten. Die Twitch Watch Party Funktion wurde eingestellt und es gibt keine gute Mobile-Lösung.

**Lösung:**  
Synchronisierte Watch-Party-Räume mit Chat, Reactions und voller Mobile-Unterstützung.

**Wertversprechen:**
- Für Viewer: Gemeinsames Erlebnis mit Freunden
- Für Streamer: Höheres Engagement, mehr Viewer durch Gruppen
- Für Mobile-User: Vollwertige Teilnahme von unterwegs

---

## 1. Aufbau (Architektur)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Stream Together Platform                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐        │
│  │   Web Client     │   │   Mobile App     │   │   Overlay        │        │
│  │   (React)        │   │   (React Native) │   │   (Browser Src)  │        │
│  └────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘        │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    WebSocket Gateway                              │      │
│  │                    (Real-time Sync)                               │      │
│  └───────────────────────────────┬──────────────────────────────────┘      │
│                                  │                                          │
│           ┌──────────────────────┼──────────────────────┐                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│  │   Room Service  │   │   Sync Service  │   │   Chat Service  │          │
│  │   (Räume)       │   │   (Playback)    │   │   (Nachrichten) │          │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Komponenten-Hierarchie

```
StreamTogether/
├── Web/
│   ├── pages/
│   │   ├── WatchPartyPage.tsx        # Hauptseite
│   │   ├── CreateRoomPage.tsx        # Raum erstellen
│   │   └── JoinRoomPage.tsx          # Raum beitreten
│   ├── components/
│   │   ├── VideoPlayer.tsx           # Embedded Twitch Player
│   │   ├── PartyChat.tsx             # Gruppen-Chat
│   │   ├── ParticipantsList.tsx      # Teilnehmer-Liste
│   │   ├── ReactionBar.tsx           # Emoji-Reactions
│   │   ├── SyncIndicator.tsx         # Sync-Status
│   │   └── InviteModal.tsx           # Einladungs-Dialog
│   └── hooks/
│       ├── useRoom.ts                # Raum-State
│       ├── useSync.ts                # Synchronisation
│       └── usePartyChat.ts           # Party-Chat
│
├── Mobile/ (React Native)
│   ├── screens/
│   │   ├── WatchPartyScreen.tsx
│   │   ├── CreateRoomScreen.tsx
│   │   └── JoinRoomScreen.tsx
│   ├── components/
│   │   ├── MobileVideoPlayer.tsx
│   │   ├── MobileChat.tsx
│   │   ├── MobileReactions.tsx
│   │   └── PictureInPicture.tsx
│   └── services/
│       ├── BackgroundPlayback.ts
│       └── PushNotifications.ts
│
├── API/
│   ├── rooms/route.ts
│   ├── rooms/[roomId]/route.ts
│   ├── rooms/[roomId]/join/route.ts
│   ├── rooms/[roomId]/sync/route.ts
│   └── rooms/[roomId]/chat/route.ts
│
└── WebSocket/
    ├── RoomGateway.ts
    ├── SyncHandler.ts
    └── ChatHandler.ts
```

---

## 2. Logik (Business Logic)

### Raum-Typen

```typescript
enum RoomType {
  PUBLIC = 'public',       // Jeder kann beitreten
  PRIVATE = 'private',     // Nur mit Invite-Link
  FRIENDS = 'friends',     // Nur Twitch-Freunde
  SUBS = 'subs',           // Nur Subscriber
}

enum RoomStatus {
  WAITING = 'waiting',     // Wartet auf Start
  LIVE = 'live',           // Stream läuft
  PAUSED = 'paused',       // Pause (nur Host)
  ENDED = 'ended',         // Session beendet
}

interface WatchPartyRoom {
  id: string;
  code: string;            // 6-stelliger Join-Code
  hostId: string;
  hostName: string;
  
  channelId: string;       // Twitch Channel
  channelName: string;
  
  type: RoomType;
  status: RoomStatus;
  
  maxParticipants: number; // Default: 10
  participants: Participant[];
  
  settings: RoomSettings;
  
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

interface Participant {
  id: string;
  twitchUserId: string;
  displayName: string;
  avatar: string;
  
  isHost: boolean;
  isModerator: boolean;
  
  syncStatus: 'synced' | 'buffering' | 'behind' | 'ahead';
  currentTimestamp: number;
  
  joinedAt: Date;
  lastActiveAt: Date;
}

interface RoomSettings {
  allowReactions: boolean;
  allowChat: boolean;
  syncTolerance: number;   // Sekunden Toleranz
  showTwitchChat: boolean;
  showParticipants: boolean;
  allowGuestInvites: boolean;
}
```

### Synchronisations-Logik

```typescript
class SyncService {
  private readonly SYNC_INTERVAL = 5000;  // 5 Sekunden
  private readonly MAX_DRIFT = 3;          // 3 Sekunden Toleranz
  
  /**
   * Berechnet den Sync-Status eines Teilnehmers
   */
  calculateSyncStatus(
    participantTimestamp: number,
    hostTimestamp: number
  ): SyncStatus {
    const drift = Math.abs(participantTimestamp - hostTimestamp);
    
    if (drift <= 0.5) return 'synced';
    if (drift <= this.MAX_DRIFT) return 'buffering';
    if (participantTimestamp < hostTimestamp) return 'behind';
    return 'ahead';
  }
  
  /**
   * Sendet Sync-Command an alle Teilnehmer
   */
  async broadcastSync(room: WatchPartyRoom, hostTimestamp: number) {
    const syncCommand: SyncCommand = {
      type: 'sync',
      timestamp: hostTimestamp,
      roomId: room.id,
      sentAt: Date.now()
    };
    
    await this.websocket.broadcast(room.id, syncCommand);
  }
  
  /**
   * Korrigiert Drift bei einzelnem Teilnehmer
   */
  async correctDrift(participant: Participant, targetTimestamp: number) {
    const drift = targetTimestamp - participant.currentTimestamp;
    
    if (Math.abs(drift) > this.MAX_DRIFT) {
      // Hartes Seek
      await this.websocket.send(participant.id, {
        type: 'seek',
        timestamp: targetTimestamp
      });
    } else if (drift > 0.5) {
      // Leicht beschleunigen
      await this.websocket.send(participant.id, {
        type: 'speedup',
        factor: 1.05,
        duration: drift * 1000
      });
    } else if (drift < -0.5) {
      // Leicht verlangsamen
      await this.websocket.send(participant.id, {
        type: 'slowdown',
        factor: 0.95,
        duration: Math.abs(drift) * 1000
      });
    }
  }
}
```

### Reactions-System

```typescript
interface Reaction {
  id: string;
  participantId: string;
  participantName: string;
  emoji: string;
  timestamp: number;      // Stream-Zeitpunkt
  createdAt: Date;
}

const AVAILABLE_REACTIONS = [
  '😂', '😮', '😢', '😡', '👏', '🎉', '❤️', '🔥', '💀', '🤔'
];

class ReactionService {
  private readonly REACTION_COOLDOWN = 2000; // 2 Sekunden
  private readonly REACTION_DISPLAY_TIME = 3000; // 3 Sekunden
  
  async sendReaction(
    roomId: string,
    participantId: string,
    emoji: string,
    timestamp: number
  ): Promise<void> {
    // Cooldown prüfen
    const lastReaction = await this.getLastReaction(participantId);
    if (lastReaction && Date.now() - lastReaction.createdAt.getTime() < this.REACTION_COOLDOWN) {
      throw new Error('Reaction cooldown active');
    }
    
    const reaction: Reaction = {
      id: generateId(),
      participantId,
      participantName: await this.getParticipantName(participantId),
      emoji,
      timestamp,
      createdAt: new Date()
    };
    
    // An alle Teilnehmer senden
    await this.websocket.broadcast(roomId, {
      type: 'reaction',
      data: reaction
    });
  }
}
```

---

## 3. Backend

### Prisma Schema

```prisma
/// Watch Party Raum
model WatchPartyRoom {
  id              String   @id @default(cuid())
  code            String   @unique @db.VarChar(6)
  
  /// Host
  hostId          String
  host            User     @relation(fields: [hostId], references: [id], onDelete: Cascade)
  
  /// Twitch Channel
  channelId       String
  channelName     String
  
  /// Einstellungen
  type            String   @default("private")
  status          String   @default("waiting")
  maxParticipants Int      @default(10)
  
  /// Settings (JSON)
  settings        Json     @default("{}")
  
  /// Timestamps
  createdAt       DateTime @default(now())
  startedAt       DateTime?
  endedAt         DateTime?
  
  /// Beziehungen
  participants    WatchPartyParticipant[]
  messages        WatchPartyChatMessage[]
  reactions       WatchPartyReaction[]
  
  @@index([hostId])
  @@index([code])
  @@index([status])
}

/// Watch Party Teilnehmer
model WatchPartyParticipant {
  id              String   @id @default(cuid())
  roomId          String
  room            WatchPartyRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  /// User
  twitchUserId    String
  displayName     String
  avatar          String?
  
  /// Rolle
  isHost          Boolean  @default(false)
  isModerator     Boolean  @default(false)
  
  /// Status
  isActive        Boolean  @default(true)
  lastSyncTime    Float?
  
  /// Device
  deviceType      String?  // web, mobile, tablet
  
  joinedAt        DateTime @default(now())
  leftAt          DateTime?
  
  @@unique([roomId, twitchUserId])
  @@index([roomId])
}

/// Watch Party Chat (separater Chat vom Twitch-Chat)
model WatchPartyChatMessage {
  id              String   @id @default(cuid())
  roomId          String
  room            WatchPartyRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  senderId        String
  senderName      String
  message         String   @db.VarChar(500)
  
  /// Stream-Zeitpunkt (für Replay)
  streamTimestamp Float?
  
  createdAt       DateTime @default(now())
  
  @@index([roomId])
  @@index([createdAt])
}

/// Reactions
model WatchPartyReaction {
  id              String   @id @default(cuid())
  roomId          String
  room            WatchPartyRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  participantId   String
  emoji           String   @db.VarChar(10)
  streamTimestamp Float
  
  createdAt       DateTime @default(now())
  
  @@index([roomId])
}
```

### API Routes

```typescript
// src/app/api/watch-party/rooms/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// GET: Aktive Räume des Users
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  const rooms = await prisma.watchPartyRoom.findMany({
    where: {
      OR: [
        { hostId: session.user.id },
        { participants: { some: { twitchUserId: session.user.twitchId } } }
      ],
      status: { not: 'ended' }
    },
    include: {
      _count: { select: { participants: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({ success: true, data: rooms });
}

// POST: Neuen Raum erstellen
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { channelId, channelName, type, maxParticipants, settings } = body;
  
  // Generiere 6-stelligen Code
  const code = nanoid(6).toUpperCase();
  
  const room = await prisma.watchPartyRoom.create({
    data: {
      code,
      hostId: session.user.id,
      channelId,
      channelName,
      type: type || 'private',
      maxParticipants: maxParticipants || 10,
      settings: settings || {},
      participants: {
        create: {
          twitchUserId: session.user.twitchId,
          displayName: session.user.name,
          avatar: session.user.image,
          isHost: true
        }
      }
    },
    include: {
      participants: true
    }
  });
  
  return NextResponse.json(
    { success: true, data: room },
    { status: 201 }
  );
}
```

```typescript
// src/app/api/watch-party/rooms/[roomId]/join/route.ts

// POST: Raum beitreten
export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { message: 'Unauthorized' } },
      { status: 401 }
    );
  }
  
  const room = await prisma.watchPartyRoom.findUnique({
    where: { id: params.roomId },
    include: { _count: { select: { participants: true } } }
  });
  
  if (!room) {
    return NextResponse.json(
      { success: false, error: { message: 'Room not found' } },
      { status: 404 }
    );
  }
  
  if (room.status === 'ended') {
    return NextResponse.json(
      { success: false, error: { message: 'Room has ended' } },
      { status: 400 }
    );
  }
  
  if (room._count.participants >= room.maxParticipants) {
    return NextResponse.json(
      { success: false, error: { message: 'Room is full' } },
      { status: 400 }
    );
  }
  
  // Teilnehmer hinzufügen oder reaktivieren
  const participant = await prisma.watchPartyParticipant.upsert({
    where: {
      roomId_twitchUserId: {
        roomId: room.id,
        twitchUserId: session.user.twitchId
      }
    },
    create: {
      roomId: room.id,
      twitchUserId: session.user.twitchId,
      displayName: session.user.name,
      avatar: session.user.image,
      deviceType: request.headers.get('x-device-type') || 'web'
    },
    update: {
      isActive: true,
      leftAt: null,
      deviceType: request.headers.get('x-device-type') || 'web'
    }
  });
  
  return NextResponse.json({ success: true, data: { room, participant } });
}
```

### WebSocket Gateway

```typescript
// src/lib/websocket/watch-party.gateway.ts
import { WebSocketServer, WebSocket } from 'ws';

interface Connection {
  ws: WebSocket;
  roomId: string;
  participantId: string;
  userId: string;
}

class WatchPartyGateway {
  private connections: Map<string, Connection> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> connectionIds
  
  handleConnection(ws: WebSocket, roomId: string, participantId: string, userId: string) {
    const connectionId = `${roomId}:${participantId}`;
    
    this.connections.set(connectionId, { ws, roomId, participantId, userId });
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(connectionId);
    
    // Anderen Teilnehmern mitteilen
    this.broadcast(roomId, {
      type: 'participant_joined',
      participantId,
      timestamp: Date.now()
    }, connectionId);
    
    ws.on('message', (data) => this.handleMessage(connectionId, data.toString()));
    ws.on('close', () => this.handleDisconnect(connectionId));
  }
  
  handleMessage(connectionId: string, data: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'sync_update':
        // Teilnehmer meldet seinen aktuellen Zeitstempel
        this.handleSyncUpdate(connection, message.timestamp);
        break;
        
      case 'reaction':
        // Reaction an alle senden
        this.broadcast(connection.roomId, {
          type: 'reaction',
          participantId: connection.participantId,
          emoji: message.emoji,
          timestamp: message.streamTimestamp
        });
        break;
        
      case 'chat_message':
        // Chat-Nachricht an alle senden
        this.broadcast(connection.roomId, {
          type: 'chat_message',
          participantId: connection.participantId,
          message: message.text,
          timestamp: Date.now()
        });
        break;
        
      case 'host_sync':
        // Host sendet Sync-Command
        if (this.isHost(connection)) {
          this.broadcast(connection.roomId, {
            type: 'sync_command',
            timestamp: message.timestamp,
            action: message.action // play, pause, seek
          });
        }
        break;
    }
  }
  
  broadcast(roomId: string, message: object, excludeConnection?: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const data = JSON.stringify(message);
    
    for (const connectionId of room) {
      if (connectionId === excludeConnection) continue;
      
      const connection = this.connections.get(connectionId);
      if (connection?.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(data);
      }
    }
  }
  
  private handleDisconnect(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    
    const room = this.rooms.get(connection.roomId);
    if (room) {
      room.delete(connectionId);
      
      // Anderen mitteilen
      this.broadcast(connection.roomId, {
        type: 'participant_left',
        participantId: connection.participantId
      });
      
      // Raum aufräumen wenn leer
      if (room.size === 0) {
        this.rooms.delete(connection.roomId);
      }
    }
    
    this.connections.delete(connectionId);
  }
}

export const watchPartyGateway = new WatchPartyGateway();
```

---

## 4. Frontend

### Web-Komponente

```typescript
// src/app/(dashboard)/watch-party/[roomId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TwitchPlayer } from '@/components/watch-party/TwitchPlayer';
import { PartyChat } from '@/components/watch-party/PartyChat';
import { ParticipantsList } from '@/components/watch-party/ParticipantsList';
import { ReactionBar } from '@/components/watch-party/ReactionBar';
import { SyncIndicator } from '@/components/watch-party/SyncIndicator';
import { useWatchParty } from '@/hooks/useWatchParty';

export default function WatchPartyPage() {
  const { roomId } = useParams();
  const { data: session } = useSession();
  const {
    room,
    participants,
    isHost,
    syncStatus,
    currentTimestamp,
    sendReaction,
    sendMessage,
    updateSync
  } = useWatchParty(roomId as string);
  
  if (!room) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-zinc-900 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">{room.channelName}</span>
            <span className="px-2 py-1 bg-purple-600 rounded text-xs">
              Code: {room.code}
            </span>
          </div>
          <SyncIndicator status={syncStatus} />
        </header>
        
        {/* Video Player */}
        <div className="flex-1 relative">
          <TwitchPlayer
            channel={room.channelName}
            isHost={isHost}
            onTimeUpdate={updateSync}
          />
          
          {/* Floating Reactions */}
          <FloatingReactions roomId={room.id} />
        </div>
        
        {/* Reaction Bar */}
        <ReactionBar
          onReaction={(emoji) => sendReaction(emoji, currentTimestamp)}
        />
      </div>
      
      {/* Sidebar */}
      <aside className="w-80 bg-zinc-900 flex flex-col">
        {/* Participants */}
        <div className="h-48 border-b border-zinc-800 p-4">
          <h3 className="font-semibold mb-3">
            Teilnehmer ({participants.length}/{room.maxParticipants})
          </h3>
          <ParticipantsList participants={participants} />
        </div>
        
        {/* Party Chat */}
        <div className="flex-1">
          <PartyChat
            roomId={room.id}
            onSendMessage={sendMessage}
          />
        </div>
      </aside>
    </div>
  );
}
```

### Mobile App (React Native)

```typescript
// src/mobile/screens/WatchPartyScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { TwitchWebView } from '../components/TwitchWebView';
import { MobilePartyChat } from '../components/MobilePartyChat';
import { MobileReactionBar } from '../components/MobileReactionBar';
import { ParticipantsDrawer } from '../components/ParticipantsDrawer';
import { useWatchParty } from '../hooks/useWatchParty';
import { usePictureInPicture } from '../hooks/usePictureInPicture';

const { width, height } = Dimensions.get('window');

export function WatchPartyScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { roomId } = route.params;
  
  const {
    room,
    participants,
    isHost,
    syncStatus,
    sendReaction,
    sendMessage
  } = useWatchParty(roomId);
  
  const { enablePiP, isPiPActive } = usePictureInPicture();
  
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // Landscape-orientiertes Layout
  const isLandscape = width > height;
  
  if (!room) {
    return <LoadingScreen />;
  }
  
  return (
    <View style={styles.container}>
      <StatusBar hidden={isLandscape} />
      
      {/* Video Player */}
      <View style={[
        styles.playerContainer,
        isLandscape ? styles.playerLandscape : styles.playerPortrait
      ]}>
        <TwitchWebView
          channel={room.channelName}
          style={styles.player}
        />
        
        {/* Sync Indicator */}
        <View style={styles.syncBadge}>
          <SyncBadge status={syncStatus} />
        </View>
        
        {/* PiP Button */}
        <TouchableOpacity
          style={styles.pipButton}
          onPress={enablePiP}
        >
          <PiPIcon />
        </TouchableOpacity>
      </View>
      
      {/* Bottom Section */}
      {!isLandscape && (
        <View style={styles.bottomSection}>
          {/* Reaction Bar */}
          <MobileReactionBar onReaction={sendReaction} />
          
          {/* Chat */}
          {showChat && (
            <MobilePartyChat
              roomId={room.id}
              onSendMessage={sendMessage}
              style={styles.chat}
            />
          )}
        </View>
      )}
      
      {/* Participants Drawer */}
      <ParticipantsDrawer
        visible={showParticipants}
        participants={participants}
        onClose={() => setShowParticipants(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  playerContainer: {
    position: 'relative',
  },
  playerPortrait: {
    height: width * (9 / 16), // 16:9 Aspect Ratio
  },
  playerLandscape: {
    flex: 1,
  },
  player: {
    flex: 1,
  },
  syncBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pipButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  bottomSection: {
    flex: 1,
  },
  chat: {
    flex: 1,
  },
});
```

### Hook für Watch Party

```typescript
// src/hooks/useWatchParty.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface UseWatchPartyReturn {
  room: WatchPartyRoom | null;
  participants: Participant[];
  isHost: boolean;
  syncStatus: SyncStatus;
  currentTimestamp: number;
  sendReaction: (emoji: string, timestamp: number) => void;
  sendMessage: (text: string) => void;
  updateSync: (timestamp: number) => void;
  leave: () => void;
}

export function useWatchParty(roomId: string): UseWatchPartyReturn {
  const { data: session } = useSession();
  const [room, setRoom] = useState<WatchPartyRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  
  // WebSocket-Verbindung
  useEffect(() => {
    if (!roomId || !session?.user) return;
    
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/watch-party/${roomId}?token=${session.accessToken}`
    );
    
    ws.onopen = () => {
      console.log('Connected to watch party');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'room_state':
          setRoom(message.room);
          setParticipants(message.participants);
          break;
          
        case 'participant_joined':
          setParticipants(prev => [...prev, message.participant]);
          break;
          
        case 'participant_left':
          setParticipants(prev => 
            prev.filter(p => p.id !== message.participantId)
          );
          break;
          
        case 'sync_command':
          handleSyncCommand(message);
          break;
          
        case 'reaction':
          // Reaction anzeigen (handled by FloatingReactions component)
          break;
      }
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, [roomId, session]);
  
  const sendReaction = useCallback((emoji: string, timestamp: number) => {
    wsRef.current?.send(JSON.stringify({
      type: 'reaction',
      emoji,
      streamTimestamp: timestamp
    }));
  }, []);
  
  const sendMessage = useCallback((text: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'chat_message',
      text
    }));
  }, []);
  
  const updateSync = useCallback((timestamp: number) => {
    setCurrentTimestamp(timestamp);
    wsRef.current?.send(JSON.stringify({
      type: 'sync_update',
      timestamp
    }));
  }, []);
  
  const leave = useCallback(() => {
    wsRef.current?.close();
  }, []);
  
  const isHost = room?.hostId === session?.user?.id;
  
  return {
    room,
    participants,
    isHost,
    syncStatus,
    currentTimestamp,
    sendReaction,
    sendMessage,
    updateSync,
    leave
  };
}
```

---

## 5. Twitch Integration

### Embedded Player

```typescript
// src/components/watch-party/TwitchPlayer.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Props {
  channel: string;
  isHost: boolean;
  onTimeUpdate: (timestamp: number) => void;
}

export function TwitchPlayer({ channel, isHost, onTimeUpdate }: Props) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Twitch Embed API laden
    const script = document.createElement('script');
    script.src = 'https://player.twitch.tv/js/embed/v1.js';
    script.async = true;
    script.onload = initPlayer;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const initPlayer = useCallback(() => {
    if (!containerRef.current) return;
    
    playerRef.current = new (window as any).Twitch.Player(containerRef.current, {
      channel,
      parent: [window.location.hostname],
      width: '100%',
      height: '100%',
      autoplay: true,
      muted: false
    });
    
    // Sync-Updates nur für Host
    if (isHost) {
      setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime?.() || 0;
        onTimeUpdate(currentTime);
      }, 1000);
    }
  }, [channel, isHost, onTimeUpdate]);
  
  // Externe Steuerung für Sync
  const seek = useCallback((timestamp: number) => {
    playerRef.current?.seek?.(timestamp);
  }, []);
  
  const play = useCallback(() => {
    playerRef.current?.play?.();
  }, []);
  
  const pause = useCallback(() => {
    playerRef.current?.pause?.();
  }, []);
  
  return (
    <div ref={containerRef} className="w-full h-full bg-black" />
  );
}
```

### Benötigte Scopes

| Scope | Zweck |
|-------|-------|
| `user:read:follows` | Prüfen ob Freunde (für FRIENDS-Räume) |
| `channel:read:subscriptions` | Prüfen ob Sub (für SUBS-Räume) |

---

## 6. Mobile-Spezifische Features

### Picture-in-Picture

```typescript
// src/mobile/hooks/usePictureInPicture.ts
import { useCallback, useState } from 'react';
import PIPAndroid from 'react-native-pip-android';
import { Platform } from 'react-native';

export function usePictureInPicture() {
  const [isPiPActive, setIsPiPActive] = useState(false);
  
  const enablePiP = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await PIPAndroid.enterPictureInPictureMode();
        setIsPiPActive(true);
      } catch (error) {
        console.error('PiP not supported:', error);
      }
    }
    // iOS: WebView unterstützt natives PiP
  }, []);
  
  return { enablePiP, isPiPActive };
}
```

### Push-Benachrichtigungen

```typescript
// src/mobile/services/PushNotifications.ts
import messaging from '@react-native-firebase/messaging';

export class WatchPartyNotifications {
  static async requestPermission() {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  }
  
  static async subscribeToRoom(roomId: string) {
    await messaging().subscribeToTopic(`watch-party-${roomId}`);
  }
  
  static async unsubscribeFromRoom(roomId: string) {
    await messaging().unsubscribeFromTopic(`watch-party-${roomId}`);
  }
}

// Server-seitig: Push senden
async function sendPushToRoom(roomId: string, title: string, body: string) {
  await admin.messaging().sendToTopic(`watch-party-${roomId}`, {
    notification: { title, body },
    data: { roomId, type: 'watch_party' }
  });
}
```

### QR-Code zum Beitreten

```typescript
// src/components/watch-party/InviteModal.tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';

interface Props {
  roomCode: string;
  roomId: string;
}

export function InviteModal({ roomCode, roomId }: Props) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/watch-party/join/${roomCode}`;
  
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Freunde einladen</h2>
      
      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg inline-block mb-4">
        <QRCodeSVG value={joinUrl} size={200} />
      </div>
      
      {/* Code */}
      <p className="text-3xl font-mono font-bold tracking-widest mb-4">
        {roomCode}
      </p>
      
      {/* Link */}
      <div className="flex gap-2">
        <input
          type="text"
          value={joinUrl}
          readOnly
          className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={() => navigator.clipboard.writeText(joinUrl)}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Kopieren
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Sicherheit & Datenschutz

### Datenaufbewahrung

- Raum-Daten: 24 Stunden nach Ende
- Chat-Nachrichten: Mit Raum gelöscht
- Reactions: Mit Raum gelöscht
- Keine Aufzeichnung des Streams

### Rate Limits

| Aktion | Limit |
|--------|-------|
| Raum erstellen | 5 pro Stunde |
| Nachrichten | 20 pro Minute |
| Reactions | 30 pro Minute |

---

## 8. Roadmap

### MVP (v1.0)
- [x] Private Räume erstellen
- [x] Join via Code
- [x] Basis-Sync
- [x] Party-Chat
- [x] Reactions

### v1.1
- [ ] Mobile App (React Native)
- [ ] QR-Code Einladungen
- [ ] Push-Benachrichtigungen
- [ ] Picture-in-Picture

### v2.0
- [ ] Öffentliche Räume
- [ ] Subscriber-Only Räume
- [ ] VOD Watch Parties
- [ ] Multi-Stream (mehrere Channels)

---

## Zusammenfassung Viewer Games

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-GAME-001 | Channel Points Raffle | 🔴 | M |
| T-GAME-002 | Chat Betting | 🔴 | L |
| T-GAME-003 | Viewer Duels | 🟡 | M |
| T-GAME-004 | Trivia Quiz System | 🔴 | M |
| T-GAME-005 | Chat Plays | 🟡 | XL |
| T-GAME-006 | Marble Race | 🟡 | L |
| T-GAME-007 | Word Chain Game | 🟢 | S |
| T-GAME-008 | Chat vs Streamer | 🔴 | M |
| T-GAME-009 | Bingo Card Generator | 🟡 | M |
| T-GAME-010 | Viewer Lottery | 🟡 | S |
| T-GAME-011 | Boss Battle | 🟡 | L |
| T-GAME-012 | Emote Guessing Game | 🟢 | S |
| T-GAME-013 | Viewer Teams | 🟡 | M |
| T-GAME-014 | Death Counter Bet | 🟢 | S |
| T-GAME-015 | Stream Stock Market | 🟢 | L |
| T-GAME-016 | Hot Take Polls | 🟢 | S |
| T-GAME-017 | Viewer Battle Royale | 🟡 | L |
| T-GAME-018 | Channel Point Auction | 🔴 | M |
| T-GAME-019 | Stream Together (Watch Party) | 🔴 | XL |

---

*Weiter zu [05-community-loyalty.md](./05-community-loyalty.md)*
