# 👥 Community & Loyalty (12 Tools)

> Werkzeuge für Community-Aufbau, Retention und Loyalitäts-Programme

---

## T-COM-001 — Loyalty Points System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-001 |
| **Kategorie** | Community & Loyalty |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Viewer, Streamer |

### Problem & Lösung

**Problem:**  
Twitch Channel Points sind limitiert und bieten keine echte Wirtschaft.

**Lösung:**  
Eigenes Punkte-System mit mehr Flexibilität, Rewards und Cross-Stream-Persistenz.

---

## 1. Aufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Loyalty Points System                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Earning   │  │   Balance   │  │   Rewards   │  │   Store     │ │
│  │   Engine    │  │   Manager   │  │   System    │  │   Front     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Features

- **Earning Mechanics**:
  - Watch Time (X Punkte / Minute)
  - Chat-Aktivität (Bonus für Nachrichten)
  - Follows, Subs, Cheers, Raids
  - Achievements
  
- **Spending Options**:
  - Custom Rewards (wie Channel Points)
  - Raffle-Entries
  - Wetten
  - Store-Artikel

### Prisma Schema

```prisma
model LoyaltyConfig {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled         Boolean  @default(true)
  
  /// Währungs-Name
  currencyName    String   @default("Coins")
  currencyEmoji   String   @default("🪙")
  
  /// Earning Rates
  watchTimeRate   Int      @default(10)    // Punkte pro 5 Minuten
  chatMessageRate Int      @default(5)     // Punkte pro Nachricht
  chatCooldown    Int      @default(60)    // Sekunden zwischen Nachrichten-Bonus
  
  /// Multiplier
  subMultiplier   Float    @default(1.5)
  vipMultiplier   Float    @default(1.25)
  
  /// Bonuses
  followBonus     Int      @default(100)
  subBonus        Int      @default(500)
  raidBonus       Int      @default(50)    // Pro Viewer
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  balances        LoyaltyBalance[]
  rewards         LoyaltyReward[]
  transactions    LoyaltyTransaction[]
  
  @@index([userId])
}

model LoyaltyBalance {
  id              String   @id @default(cuid())
  configId        String
  config          LoyaltyConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  twitchUserId    String
  userName        String
  
  balance         Int      @default(0)
  totalEarned     Int      @default(0)
  totalSpent      Int      @default(0)
  
  /// Statistiken
  watchTimeMinutes Int     @default(0)
  messageCount    Int      @default(0)
  lastActive      DateTime @default(now())
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([configId, twitchUserId])
  @@index([configId])
  @@index([balance])
}

model LoyaltyReward {
  id              String   @id @default(cuid())
  configId        String
  config          LoyaltyConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  name            String
  description     String?
  cost            Int
  
  /// Reward-Typ
  type            String   // sound, message, action, custom
  action          Json?    // Typ-spezifische Config
  
  /// Limits
  maxPerStream    Int?
  maxPerUser      Int?
  cooldown        Int?     // Sekunden
  
  /// Verfügbarkeit
  enabled         Boolean  @default(true)
  requiresSub     Boolean  @default(false)
  
  /// Statistiken
  redemptionCount Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([configId])
}

model LoyaltyTransaction {
  id              String   @id @default(cuid())
  configId        String
  config          LoyaltyConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  twitchUserId    String
  userName        String
  
  /// Transaktion
  type            String   // earn, spend, bonus, admin
  amount          Int      // Positiv = earn, Negativ = spend
  reason          String
  
  /// Referenz
  rewardId        String?
  
  createdAt       DateTime @default(now())
  
  @@index([configId])
  @@index([twitchUserId])
  @@index([createdAt])
}
```

### Earning-Service

```typescript
// src/lib/services/loyalty.service.ts
export class LoyaltyService {
  /**
   * Berechnet und vergibt Watch-Time-Punkte
   */
  async processWatchTime(channelId: string, activeViewers: string[]) {
    const config = await this.getConfig(channelId);
    if (!config?.enabled) return;
    
    for (const viewerId of activeViewers) {
      const balance = await this.getOrCreateBalance(config.id, viewerId);
      const multiplier = await this.getMultiplier(viewerId, config);
      const points = Math.floor(config.watchTimeRate * multiplier);
      
      await this.addPoints(balance.id, points, 'Watch Time');
      await this.updateWatchTime(balance.id, 5); // 5 Minuten
    }
  }
  
  /**
   * Berechnet Chat-Bonus
   */
  async processChatMessage(channelId: string, userId: string, userName: string) {
    const config = await this.getConfig(channelId);
    if (!config?.enabled) return;
    
    const balance = await this.getOrCreateBalance(config.id, userId, userName);
    
    // Cooldown prüfen
    const lastEarn = await this.getLastChatEarn(balance.id);
    if (lastEarn && Date.now() - lastEarn.getTime() < config.chatCooldown * 1000) {
      return;
    }
    
    const multiplier = await this.getMultiplier(userId, config);
    const points = Math.floor(config.chatMessageRate * multiplier);
    
    await this.addPoints(balance.id, points, 'Chat Message');
  }
  
  /**
   * Reward einlösen
   */
  async redeemReward(channelId: string, userId: string, rewardId: string): Promise<RedemptionResult> {
    const config = await this.getConfig(channelId);
    const reward = await this.getReward(rewardId);
    const balance = await this.getBalance(config.id, userId);
    
    // Validierungen
    if (!reward.enabled) {
      return { success: false, error: 'Reward nicht verfügbar' };
    }
    
    if (balance.balance < reward.cost) {
      return { success: false, error: 'Nicht genug Punkte' };
    }
    
    if (reward.requiresSub && !(await this.isSubscriber(channelId, userId))) {
      return { success: false, error: 'Nur für Subscriber' };
    }
    
    // Limits prüfen
    if (reward.maxPerStream) {
      const todayCount = await this.getRedemptionCount(rewardId, 'today');
      if (todayCount >= reward.maxPerStream) {
        return { success: false, error: 'Limit erreicht' };
      }
    }
    
    // Punkte abziehen
    await this.spendPoints(balance.id, reward.cost, `Reward: ${reward.name}`);
    
    // Reward-Aktion ausführen
    await this.executeRewardAction(reward);
    
    return { success: true, reward };
  }
  
  private async getMultiplier(userId: string, config: LoyaltyConfig): Promise<number> {
    let multiplier = 1.0;
    
    const userInfo = await this.getUserChannelInfo(userId);
    if (userInfo.isSubscriber) multiplier *= config.subMultiplier;
    if (userInfo.isVIP) multiplier *= config.vipMultiplier;
    
    return multiplier;
  }
}
```

---

## T-COM-002 — Viewer Levels & XP

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine sichtbare Progression für Viewer.

**Lösung:** XP-basiertes Level-System mit Badges und Perks.

### Features

- XP durch Aktivität (Watch Time, Chat, Subs)
- Level-Up-Animationen
- Badges im Chat/Overlay
- Level-basierte Perks (z.B. niedrigere Reward-Kosten)
- Prestige-System (Reset für Bonus)

### Level-Formel

```typescript
// XP pro Level steigt exponentiell
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function levelForXp(xp: number): number {
  let level = 1;
  let requiredXp = 100;
  
  while (xp >= requiredXp) {
    xp -= requiredXp;
    level++;
    requiredXp = xpForLevel(level);
  }
  
  return level;
}

function xpProgress(xp: number): { level: number; current: number; required: number } {
  let level = 1;
  let remaining = xp;
  let required = xpForLevel(1);
  
  while (remaining >= required) {
    remaining -= required;
    level++;
    required = xpForLevel(level);
  }
  
  return { level, current: remaining, required };
}
```

---

## T-COM-003 — Achievement System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Langzeit-Ziele für Viewer.

**Lösung:** Sammelbares Achievement-System wie in Spielen.

### Achievement-Kategorien

```typescript
const ACHIEVEMENTS = {
  // Aktivität
  first_message: { name: 'Erstes Wort', xp: 50 },
  chatter_100: { name: 'Stammgast', xp: 200, requirement: 100 }, // 100 Nachrichten
  chatter_1000: { name: 'Chat-Veteran', xp: 500, requirement: 1000 },
  
  // Watch Time
  watch_1h: { name: 'Newcomer', xp: 100 },
  watch_10h: { name: 'Dedicated', xp: 300 },
  watch_100h: { name: 'True Fan', xp: 1000 },
  
  // Unterstützung
  first_sub: { name: 'Supporter', xp: 500 },
  sub_12_months: { name: 'Year-Long Fan', xp: 2000 },
  first_cheer: { name: 'Generous', xp: 100 },
  
  // Spezial
  first_raid: { name: 'Raider', xp: 200 },
  answer_trivia: { name: 'Smarty', xp: 50 },
  win_raffle: { name: 'Lucky', xp: 100 },
  
  // Geheim
  secret_night_owl: { name: '???', xp: 300 }, // Um 3 Uhr nachts chatten
  secret_combo: { name: '???', xp: 500 },     // 10 richtige Trivia in Folge
};
```

---

## T-COM-004 — Viewer Milestones

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Wichtige Viewer-Meilensteine werden übersehen.

**Lösung:** Automatische Erkennung und Feier von Meilensteinen.

### Milestones

- 1-Jahres-Follow-Jubiläum
- Sub-Jubiläen (3, 6, 12, 24 Monate)
- 100/500/1000 Chat-Nachrichten
- Erster Stream nach X Tagen Pause
- VIP-Ernennung

---

## T-COM-005 — Viewer Profiles

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-005 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine zentrale Ansicht für Viewer-Infos.

**Lösung:** Profilseiten mit Stats, Achievements, Badges.

### Features

- Öffentliches Profil pro Channel
- Stats: Watch Time, Nachrichten, Punkte, Level
- Achievement-Showcase
- Badge-Sammlung
- Aktivitätsverlauf

---

## T-COM-006 — Leaderboards

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-006 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Kein Wettbewerb zwischen Viewern.

**Lösung:** Multi-Dimensionale Ranglisten.

### Leaderboard-Typen

```typescript
enum LeaderboardType {
  POINTS = 'points',         // Meiste Punkte
  WATCH_TIME = 'watch_time', // Längste Watch Time
  MESSAGES = 'messages',     // Meiste Nachrichten
  LEVEL = 'level',           // Höchstes Level
  ACHIEVEMENTS = 'achievements', // Meiste Achievements
  CHEERS = 'cheers',         // Meiste Bits
  GIFT_SUBS = 'gift_subs',   // Meiste Gift Subs
}

enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
  STREAM = 'stream',
}
```

### Overlay

```typescript
export function LeaderboardOverlay({ type, period, limit = 10 }: Props) {
  const { data: leaders } = useLeaderboard(type, period, limit);
  
  return (
    <div className="bg-zinc-900/95 rounded-xl p-4 min-w-[250px]">
      <h3 className="text-lg font-bold mb-4">
        🏆 Top {limit} - {getLeaderboardTitle(type)}
      </h3>
      
      <div className="space-y-2">
        {leaders?.map((entry, index) => (
          <motion.div
            key={entry.id}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className={`w-6 text-center font-bold ${
              index === 0 ? 'text-yellow-400' :
              index === 1 ? 'text-zinc-300' :
              index === 2 ? 'text-amber-600' :
              'text-zinc-500'
            }`}>
              {index + 1}
            </span>
            <span className="flex-1 truncate">{entry.userName}</span>
            <span className="font-mono text-sm text-zinc-400">
              {formatValue(entry.value, type)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## T-COM-007 — Viewer Onboarding Flow

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-007 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Neue Viewer wissen nicht, wie der Chat/Stream funktioniert.

**Lösung:** Geführte Onboarding-Erfahrung.

### Features

- Willkommens-Whisper/DM
- Tutorial für Commands
- Achievement für abgeschlossenes Onboarding
- Starter-Punkte

---

## T-COM-008 — VIP Management

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** VIP-Vergabe ist manuell und unstrukturiert.

**Lösung:** Automatisierte VIP-Verwaltung mit Kriterien.

### Features

- Auto-VIP bei Erreichen von Kriterien
- Temporäres VIP (z.B. für 30 Tage)
- VIP durch Punkte kaufen
- VIP-Perks definieren

---

## T-COM-009 — Subscriber Benefits Hub

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-009 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Subscriber-Vorteile sind unklar.

**Lösung:** Zentrale Seite mit allen Sub-Perks.

### Features

- Übersicht aller Vorteile pro Tier
- Exklusive Commands
- Sub-Only Inhalte
- Bonus-Multiplier anzeigen

---

## T-COM-010 — Community Goals (Crowdfunding)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-010 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine gemeinschaftlichen Ziele außer Sub-Goals.

**Lösung:** Flexible Community-Goals für jeden Zweck.

### Features

- Ziel mit beliebiger Metrik (Subs, Bits, Watch Time, Punkte)
- Community-weiter Fortschritt
- Reward bei Erreichen
- Milestone-Rewards (25%, 50%, 75%)

---

## T-COM-011 — Referral System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-011 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Kein Anreiz für Viewer, Freunde einzuladen.

**Lösung:** Referral-Tracking mit Belohnungen.

### Features

- Einzigartiger Referral-Link pro Viewer
- Bonus für Referrer wenn Eingeladener:
  - Zum ersten Mal chattet
  - Subscribed
- Leaderboard der Top-Recruiter

---

## T-COM-012 — Fan Club Tiers

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-COM-012 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Twitch-Tiers sind limitiert (Sub + VIP).

**Lösung:** Custom Fan-Club-System mit eigenen Tiers.

### Features

- Unbegrenzte Tiers (Bronze, Silber, Gold, etc.)
- Automatischer Tier-Aufstieg durch Aktivität
- Tier-spezifische Perks
- Exclusive Discord-Rollen Sync

---

## Zusammenfassung Community & Loyalty

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-COM-001 | Loyalty Points System | 🔴 | L |
| T-COM-002 | Viewer Levels & XP | 🔴 | M |
| T-COM-003 | Achievement System | 🟡 | M |
| T-COM-004 | Viewer Milestones | 🟡 | S |
| T-COM-005 | Viewer Profiles | 🟡 | M |
| T-COM-006 | Leaderboards | 🔴 | S |
| T-COM-007 | Viewer Onboarding Flow | 🟡 | M |
| T-COM-008 | VIP Management | 🟡 | M |
| T-COM-009 | Subscriber Benefits Hub | 🔴 | M |
| T-COM-010 | Community Goals | 🔴 | M |
| T-COM-011 | Referral System | 🟢 | M |
| T-COM-012 | Fan Club Tiers | 🟢 | L |

---

*Weiter zu [06-monetization-sponsorship.md](./06-monetization-sponsorship.md)*
