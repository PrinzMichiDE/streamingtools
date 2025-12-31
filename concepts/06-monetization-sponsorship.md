# 💰 Monetization & Sponsorship (10 Tools)

> Tools für Einnahmen, Sponsoren-Management und Conversion-Optimierung

---

## T-MON-001 — Sponsorship Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-001 |
| **Kategorie** | Monetization |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Streamer |

### Problem & Lösung

**Problem:**  
Sponsorship-Tracking ist manuell (Spreadsheets), keine zentrale Übersicht.

**Lösung:**  
CRM-artiges Dashboard für Sponsors, Deals, Deliverables und Zahlungen.

### Features

- Sponsor-Kontakte verwalten
- Deal-Pipeline (Angebot → Verhandlung → Aktiv → Abgeschlossen)
- Deliverable-Tracker (X Mentions, Y Minuten, Z Klicks)
- Zahlungs-Tracking
- Automatische Erinnerungen

### Prisma Schema

```prisma
model Sponsor {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  /// Sponsor-Info
  name          String
  contactName   String?
  contactEmail  String?
  website       String?
  logo          String?
  
  /// Kategorien
  category      String?  // Gaming, Tech, Food, etc.
  
  notes         String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  deals         SponsorDeal[]
  
  @@index([userId])
}

model SponsorDeal {
  id            String   @id @default(cuid())
  sponsorId     String
  sponsor       Sponsor  @relation(fields: [sponsorId], references: [id], onDelete: Cascade)
  
  /// Deal-Details
  title         String
  description   String?
  value         Float
  currency      String   @default("EUR")
  
  /// Status
  status        String   @default("negotiation") // negotiation, active, completed, cancelled
  
  /// Zeitraum
  startDate     DateTime?
  endDate       DateTime?
  
  /// Zahlungsinfos
  paymentStatus String   @default("pending") // pending, partial, paid
  paidAmount    Float    @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  deliverables  Deliverable[]
  
  @@index([sponsorId])
  @@index([status])
}

model Deliverable {
  id            String   @id @default(cuid())
  dealId        String
  deal          SponsorDeal @relation(fields: [dealId], references: [id], onDelete: Cascade)
  
  /// Beschreibung
  title         String
  type          String   // mention, segment, social_post, overlay
  
  /// Anforderungen
  requirement   String?  // z.B. "3x Erwähnung pro Stream"
  targetCount   Int?
  currentCount  Int      @default(0)
  
  /// Status
  completed     Boolean  @default(false)
  completedAt   DateTime?
  
  /// Beweise
  proofUrls     Json     @default("[]")
  
  dueDate       DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([dealId])
}
```

---

## T-MON-002 — Tip Jar with Goals

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Externe Donation-Services (Streamlabs, Ko-fi) sind nicht integriert.

**Lösung:** Integriertes Tip-System mit Goal-Overlay und Alerts.

### Features

- Stripe/PayPal Integration
- Tip-Goals mit Progress
- Top-Tipper Leaderboard
- Mindestbetrag-Filter
- TTS für Nachrichten

### Zahlungs-Integration

```typescript
// src/lib/services/tips.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class TipsService {
  async createPaymentIntent(
    amount: number,
    currency: string,
    tipperName: string,
    message: string
  ) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Cents
      currency,
      metadata: {
        tipperName,
        message: message.substring(0, 500)
      }
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  }
  
  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Tip speichern und Alert triggern
      await this.recordTip({
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        tipperName: paymentIntent.metadata.tipperName,
        message: paymentIntent.metadata.message
      });
      
      // Alert an Overlay senden
      await this.triggerAlert(paymentIntent);
    }
  }
}
```

---

## T-MON-003 — Merchandise Store Integration

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Merch-Verkäufe sind nicht trackbar, keine Stream-Integration.

**Lösung:** Merch-Store-Widget mit Live-Verkaufs-Alerts.

### Features

- Integration mit Shopify, Spreadshop, Teespring
- Verkaufs-Alerts im Stream
- Best-Seller Overlay
- Rabattcode-Tracking
- Sales-Dashboard

---

## T-MON-004 — Subscription Upsell

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-004 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Tier 1 Subs upgraden selten zu höheren Tiers.

**Lösung:** Intelligentes Upselling mit klaren Tier-Vorteilen.

### Features

- Tier-Vergleich Overlay
- Personalisierte Upgrade-Vorschläge
- Exklusive Tier 2/3 Perks hervorheben
- Upgrade-Reminder bei Renewal

---

## T-MON-005 — Affiliate Link Manager

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-005 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Affiliate-Links sind schwer zu tracken und zu verwalten.

**Lösung:** Zentrales Link-Management mit Analytics.

### Features

- Kurz-URLs erstellen (z.B. stream.er/chair)
- Klick-Tracking
- Conversion-Tracking (wenn möglich)
- Overlay-Widget für aktive Links

---

## T-MON-006 — Revenue Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-006 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Einnahmen aus verschiedenen Quellen sind nicht aggregiert.

**Lösung:** Einheitliches Revenue-Dashboard.

### Datenquellen

```typescript
interface RevenueSource {
  type: 'twitch_subs' | 'twitch_bits' | 'twitch_ads' | 'tips' | 'merch' | 'sponsors' | 'affiliates';
  amount: number;
  currency: string;
  period: 'day' | 'week' | 'month' | 'year';
}

async function aggregateRevenue(userId: string, period: string): Promise<RevenueSummary> {
  const [subs, bits, tips, sponsors] = await Promise.all([
    getTwitchSubRevenue(userId, period),
    getTwitchBitsRevenue(userId, period),
    getTipRevenue(userId, period),
    getSponsorRevenue(userId, period)
  ]);
  
  return {
    total: subs + bits + tips + sponsors,
    breakdown: {
      subs,
      bits,
      tips,
      sponsors
    },
    trend: calculateTrend(userId, period),
    projections: projectRevenue(userId)
  };
}
```

---

## T-MON-007 — Bit Goal Multiplier

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-007 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Bit-Goals sind langweilig.

**Lösung:** Multiplier-Events für erhöhte Bit-Werte.

### Features

- Zeitfenster mit 2x/3x Bit-Wert für Goals
- Countdown-Overlay
- Ankündigung im Chat

---

## T-MON-008 — Gift Sub Incentives

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Kein Anreiz für Gift Subs außer Badge.

**Lösung:** Exklusive Perks für Gift-Sub-Geber.

### Features

- Leaderboard: Top Gifters
- Spezielle Badges
- "Gift Sub Champion" des Monats
- Exclusive Emotes für X Gift Subs

---

## T-MON-009 — Ad Break Optimizer

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-009 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Ad Breaks kommen zu ungünstigen Zeiten.

**Lösung:** Intelligente Ad-Planung basierend auf Stream-Aktivität.

### Features

- Vorschläge für optimale Ad-Zeiten
- Integration mit Twitch Ad Manager API
- Pre-Roll-Reduktion durch manuelle Ads
- Analytics: Ad Revenue vs. Viewer Drop

---

## T-MON-010 — Patreon/Ko-fi Sync

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-MON-010 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Patreon/Ko-fi Supporter werden nicht erkannt.

**Lösung:** Sync von Supporter-Status für Perks.

### Features

- OAuth-Integration
- Automatische VIP-Vergabe
- Exclusive Overlay-Badge
- Tier-basierte Perks

---

## Zusammenfassung Monetization

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-MON-001 | Sponsorship Dashboard | 🔴 | L |
| T-MON-002 | Tip Jar with Goals | 🔴 | M |
| T-MON-003 | Merchandise Store Integration | 🟡 | M |
| T-MON-004 | Subscription Upsell | 🔴 | M |
| T-MON-005 | Affiliate Link Manager | 🟡 | S |
| T-MON-006 | Revenue Dashboard | 🔴 | L |
| T-MON-007 | Bit Goal Multiplier | 🟢 | S |
| T-MON-008 | Gift Sub Incentives | 🟡 | M |
| T-MON-009 | Ad Break Optimizer | 🟡 | M |
| T-MON-010 | Patreon/Ko-fi Sync | 🟢 | M |

---

*Weiter zu [07-analytics-insights.md](./07-analytics-insights.md)*

