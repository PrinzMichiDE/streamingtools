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

---

*Weiter zu [05-community-loyalty.md](./05-community-loyalty.md)*
