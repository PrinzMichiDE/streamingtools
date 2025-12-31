# 🔒 Security, Privacy & Compliance

> Governance-Dokument für alle Tool-Implementierungen

---

## 1. Twitch API Scopes

### Scope-Übersicht

| Scope | Beschreibung | Tools die es benötigen |
|-------|--------------|------------------------|
| `channel:read:subscriptions` | Abo-Daten lesen | Alerts, Goals, Loyalty, Analytics |
| `channel:read:redemptions` | Channel Points lesen | Games, Rewards, Automation |
| `channel:manage:redemptions` | Channel Points verwalten | Raffle, Auctions |
| `bits:read` | Bit-Daten lesen | Alerts, Goals, Analytics |
| `moderator:read:followers` | Follower-Daten lesen | Alerts, Goals, Analytics |
| `moderator:manage:chat_messages` | Chat-Nachrichten löschen | Moderation, Chat Filter |
| `moderator:manage:banned_users` | User bannen/entbannen | Moderation |
| `moderator:manage:chat_settings` | Chat-Einstellungen ändern | Automation, Emergency Mode |
| `chat:read` | Chat-Nachrichten lesen | Chat-Tools, Analytics |
| `chat:edit` | Chat-Nachrichten senden | Bot, Commands, Announcements |
| `channel:read:polls` | Umfragen lesen | Polls Overlay |
| `channel:manage:polls` | Umfragen verwalten | Poll-Automation |
| `channel:read:predictions` | Predictions lesen | Predictions Overlay |
| `channel:manage:predictions` | Predictions verwalten | Prediction-Automation |
| `channel:read:goals` | Goals lesen | Goals Overlay |
| `channel:read:hype_train` | Hype Train lesen | Hype Train Overlay |
| `user:read:email` | E-Mail lesen | Account-Verwaltung |

### Least Privilege Prinzip

```typescript
// Scopes sollten nur bei Bedarf angefordert werden
const CORE_SCOPES = [
  'user:read:email',
];

const ALERT_SCOPES = [
  ...CORE_SCOPES,
  'channel:read:subscriptions',
  'bits:read',
  'moderator:read:followers',
];

const MODERATION_SCOPES = [
  ...CORE_SCOPES,
  'moderator:manage:chat_messages',
  'moderator:manage:banned_users',
  'chat:read',
];

// Bei Feature-Aktivierung zusätzliche Scopes anfordern
async function requestAdditionalScopes(userId: string, feature: string) {
  const requiredScopes = getRequiredScopes(feature);
  const currentScopes = await getCurrentScopes(userId);
  const missingScopes = requiredScopes.filter(s => !currentScopes.includes(s));
  
  if (missingScopes.length > 0) {
    return redirectToAuth(missingScopes);
  }
}
```

---

## 2. EventSub Subscriptions

### Verfügbare Subscriptions

| Event | Beschreibung | Rate Limit |
|-------|--------------|------------|
| `channel.follow` | Neuer Follower | Keine |
| `channel.subscribe` | Neues Abo | Keine |
| `channel.subscription.gift` | Gift Sub | Keine |
| `channel.subscription.message` | Resub Message | Keine |
| `channel.cheer` | Bits Cheer | Keine |
| `channel.raid` | Raid | Keine |
| `channel.poll.begin` | Poll gestartet | Keine |
| `channel.poll.end` | Poll beendet | Keine |
| `channel.prediction.begin` | Prediction gestartet | Keine |
| `channel.prediction.end` | Prediction beendet | Keine |
| `channel.channel_points_custom_reward_redemption.add` | Reward eingelöst | Keine |
| `stream.online` | Stream gestartet | Keine |
| `stream.offline` | Stream beendet | Keine |
| `channel.update` | Kanal aktualisiert | Keine |

### Subscription-Management

```typescript
// src/lib/services/eventsub.service.ts
export class EventSubService {
  private readonly REQUIRED_SUBSCRIPTIONS = [
    'channel.follow',
    'channel.subscribe',
    'channel.subscription.gift',
    'channel.subscription.message',
    'channel.cheer',
    'channel.raid',
    'stream.online',
    'stream.offline',
  ];
  
  async setupSubscriptions(userId: string, accessToken: string) {
    const existingSubscriptions = await this.getExistingSubscriptions(userId);
    const missingTypes = this.REQUIRED_SUBSCRIPTIONS.filter(
      type => !existingSubscriptions.some(sub => sub.type === type)
    );
    
    for (const type of missingTypes) {
      await this.createSubscription(userId, type, accessToken);
    }
  }
  
  async cleanupSubscriptions(userId: string) {
    const subscriptions = await this.getExistingSubscriptions(userId);
    
    for (const sub of subscriptions) {
      await this.deleteSubscription(sub.id);
    }
  }
}
```

---

## 3. Rate Limiting

### Twitch API Limits

| API | Limit | Window |
|-----|-------|--------|
| Helix (default) | 800 | 1 Minute |
| Helix (mit Token) | 800 | 1 Minute |
| Chat (Join) | 20 | 10 Sekunden |
| Chat (Messages) | 20 | 30 Sekunden |
| Chat (Mod) | 100 | 30 Sekunden |

### Interne Rate Limits

```typescript
// Unsere API-Limits
const RATE_LIMITS = {
  // Authentifizierte Requests
  api: {
    authenticated: { limit: 100, window: 60 },  // 100/min
    readOnly: { limit: 200, window: 60 },       // 200/min für Read-Only Keys
  },
  
  // Overlay-Requests (öffentlich)
  overlay: {
    statePolling: { limit: 60, window: 60 },    // 1/sec
    events: { limit: 1, window: 0 },            // SSE-Connections
  },
  
  // Webhooks
  webhooks: {
    inbound: { limit: 1000, window: 60 },       // Twitch EventSub
    outbound: { limit: 100, window: 60 },       // An externe URLs
  },
  
  // Spezielle Aktionen
  actions: {
    alertTest: { limit: 10, window: 60 },
    goalUpdate: { limit: 30, window: 60 },
    chatMessage: { limit: 20, window: 30 },
  }
};

// Rate Limiter Middleware
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

export async function rateLimitMiddleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  }
  
  return null;
}
```

---

## 4. Datenaufbewahrung

### Retention Policies

| Datentyp | Aufbewahrung | Begründung |
|----------|--------------|------------|
| User-Account | Bis Löschung | Kernfunktion |
| Stream-Sessions | 90 Tage | Analytics |
| Chat-Logs | 7 Tage | Moderation |
| Alert-History | 30 Tage | Debugging |
| Event-Logs | 30 Tage | Debugging |
| Location-Daten | 24 Stunden | IRL Privacy |
| Mod-Queue | 7 Tage | Review |
| Webhook-Logs | 14 Tage | Debugging |

### Automatische Bereinigung

```typescript
// src/lib/jobs/data-cleanup.ts
export async function runDataCleanup() {
  const now = new Date();
  
  // Chat-Logs: 7 Tage
  await prisma.chatMessage.deleteMany({
    where: { createdAt: { lt: subDays(now, 7) } }
  });
  
  // Alert-History: 30 Tage
  await prisma.alertHistory.deleteMany({
    where: { createdAt: { lt: subDays(now, 30) } }
  });
  
  // Event-Logs: 30 Tage
  await prisma.toolEvent.deleteMany({
    where: { createdAt: { lt: subDays(now, 30) } }
  });
  
  // Locations: 24 Stunden
  await prisma.location.deleteMany({
    where: { timestamp: { lt: subHours(now, 24) } }
  });
  
  // Stream-Sessions: 90 Tage
  await prisma.streamSession.deleteMany({
    where: { startedAt: { lt: subDays(now, 90) } }
  });
  
  // Webhook-Logs: 14 Tage
  await prisma.webhookLog.deleteMany({
    where: { createdAt: { lt: subDays(now, 14) } }
  });
}
```

---

## 5. Datenschutz (DSGVO)

### Betroffenenrechte

```typescript
// src/lib/services/privacy.service.ts
export class PrivacyService {
  /**
   * Recht auf Auskunft (Art. 15 DSGVO)
   */
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        overlays: true,
        goals: true,
        commands: true,
        alertConfig: true,
        streamSessions: {
          take: 100,
          orderBy: { startedAt: 'desc' }
        }
      }
    });
    
    return {
      exportedAt: new Date(),
      user: sanitizeUser(user),
      overlays: user.overlays,
      goals: user.goals,
      commands: user.commands,
      alertConfig: user.alertConfig,
      recentStreams: user.streamSessions,
    };
  }
  
  /**
   * Recht auf Löschung (Art. 17 DSGVO)
   */
  async deleteUserData(userId: string): Promise<void> {
    // 1. EventSub Subscriptions löschen
    await eventSubService.cleanupSubscriptions(userId);
    
    // 2. Alle User-Daten löschen (Cascade in Prisma)
    await prisma.user.delete({
      where: { id: userId }
    });
    
    // 3. Bestätigung loggen (anonymisiert)
    await prisma.deletionLog.create({
      data: {
        userIdHash: hashUserId(userId),
        deletedAt: new Date()
      }
    });
  }
  
  /**
   * Recht auf Datenübertragbarkeit (Art. 20 DSGVO)
   */
  async exportPortableData(userId: string): Promise<Buffer> {
    const data = await this.exportUserData(userId);
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}
```

### Privacy by Design

```typescript
// Datenminimierung bei API-Responses
function sanitizeUserForPublic(user: User): PublicUser {
  return {
    id: user.id,
    displayName: user.displayName,
    avatar: user.avatar,
    // KEINE: email, accessToken, refreshToken
  };
}

// Anonymisierung für Analytics
function anonymizeForAnalytics(data: StreamSession): AnonymizedSession {
  return {
    duration: data.duration,
    peakViewers: data.peakViewers,
    averageViewers: data.averageViewers,
    category: data.category,
    // KEINE: userId, streamId, Timestamps (nur relative)
  };
}
```

---

## 6. Sicherheitsmaßnahmen

### Authentifizierung

```typescript
// Multi-Layer Authentication
const AUTH_LAYERS = {
  // Layer 1: NextAuth Session
  session: {
    provider: 'twitch',
    encryption: 'AES-256-GCM',
    expiry: '24h'
  },
  
  // Layer 2: API Keys
  apiKey: {
    format: 'sk_[type]_[random32]',
    storage: 'sha256 hash',
    rotation: 'on-demand'
  },
  
  // Layer 3: Webhook Signatures
  webhook: {
    algorithm: 'HMAC-SHA256',
    header: 'X-Webhook-Signature'
  }
};
```

### Token-Handling

```typescript
// Sichere Token-Speicherung
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';

export function encryptToken(token: string): EncryptedToken {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decryptToken(data: EncryptedToken): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(data.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Input Validation

```typescript
// Alle Inputs werden validiert
import { z } from 'zod';

// Beispiel: Goal-Erstellung
const CreateGoalSchema = z.object({
  title: z.string()
    .min(1, 'Titel erforderlich')
    .max(100, 'Titel zu lang')
    .refine(val => !containsXSS(val), 'Ungültige Zeichen'),
  
  targetValue: z.number()
    .int('Muss Ganzzahl sein')
    .min(1, 'Mindestens 1')
    .max(1000000, 'Maximum überschritten'),
  
  type: z.enum(['subs', 'followers', 'bits', 'custom']),
});

// XSS-Prüfung
function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}
```

---

## 7. Abuse Prevention

### Bekannte Abuse-Patterns

| Pattern | Erkennung | Mitigation |
|---------|-----------|------------|
| Alert-Spam | > 50 Events/Minute | Rate Limit + Merge |
| Bot-Accounts | Account-Alter < 24h | First-Timer-Queue |
| Raid-Attacks | Viele neue Accounts gleichzeitig | Auto-Defense |
| API-Abuse | Ungewöhnliche Request-Patterns | IP-Block + Key-Revoke |
| Webhook-Flood | Viele Failures | Auto-Disable |

### Abuse-Detection

```typescript
// src/lib/services/abuse-detection.service.ts
export class AbuseDetectionService {
  private readonly THRESHOLDS = {
    eventsPerMinute: 50,
    newAccountsPerMinute: 10,
    apiRequestsPerMinute: 200,
    webhookFailuresPerHour: 50,
  };
  
  async detectAnomalies(userId: string): Promise<AbuseAlert[]> {
    const alerts: AbuseAlert[] = [];
    
    // Event-Rate prüfen
    const eventRate = await this.getEventRate(userId, 60);
    if (eventRate > this.THRESHOLDS.eventsPerMinute) {
      alerts.push({
        type: 'event_flood',
        severity: 'warning',
        value: eventRate,
        threshold: this.THRESHOLDS.eventsPerMinute
      });
    }
    
    // API-Rate prüfen
    const apiRate = await this.getApiRate(userId, 60);
    if (apiRate > this.THRESHOLDS.apiRequestsPerMinute) {
      alerts.push({
        type: 'api_abuse',
        severity: 'critical',
        value: apiRate,
        threshold: this.THRESHOLDS.apiRequestsPerMinute
      });
    }
    
    return alerts;
  }
  
  async handleAbuse(userId: string, alert: AbuseAlert): Promise<void> {
    switch (alert.severity) {
      case 'warning':
        await this.sendWarning(userId, alert);
        break;
      
      case 'critical':
        await this.temporaryBlock(userId, 3600); // 1 Stunde
        await this.notifyAdmin(userId, alert);
        break;
    }
  }
}
```

---

## 8. Prioritäts-Scoring

### Scoring-Modell

```typescript
interface ToolScore {
  toolId: string;
  
  // Faktoren (0-10)
  impact: number;        // Wert für User
  effort: number;        // Entwicklungsaufwand (invertiert)
  risk: number;          // Technische/rechtliche Risiken (invertiert)
  synergy: number;       // Wiederverwendung
  
  // Gewichtung
  weights: {
    impact: 0.4;
    effort: 0.3;
    risk: 0.2;
    synergy: 0.1;
  };
  
  // Ergebnis
  totalScore: number;
  priority: 'P1' | 'P2' | 'P3';
}

function calculatePriority(score: ToolScore): 'P1' | 'P2' | 'P3' {
  const total = 
    score.impact * score.weights.impact +
    (10 - score.effort) * score.weights.effort +
    (10 - score.risk) * score.weights.risk +
    score.synergy * score.weights.synergy;
  
  if (total >= 7) return 'P1';
  if (total >= 4) return 'P2';
  return 'P3';
}
```

### Beispiel-Scoring

| Tool | Impact | Effort | Risk | Synergy | Total | Priority |
|------|--------|--------|------|---------|-------|----------|
| Smart Alert Director | 9 | 7 | 2 | 8 | 7.1 | P1 |
| Trivia Quiz | 7 | 5 | 1 | 6 | 5.9 | P2 |
| Sign Language Avatar | 4 | 10 | 3 | 2 | 2.9 | P3 |

---

## 9. Compliance Checkliste

### Vor jeder Tool-Implementierung

- [ ] Benötigte Twitch-Scopes identifiziert
- [ ] Scopes sind minimal (Least Privilege)
- [ ] EventSub-Subscriptions dokumentiert
- [ ] Rate Limits berücksichtigt
- [ ] Datenaufbewahrung definiert
- [ ] Datenschutz-Impact bewertet
- [ ] Input-Validierung implementiert
- [ ] Abuse-Cases identifiziert
- [ ] Mitigations implementiert
- [ ] Error-Handling implementiert
- [ ] Logging implementiert (ohne PII)
- [ ] Tests geschrieben

### Vor jedem Release

- [ ] Security-Review durchgeführt
- [ ] Dependencies aktualisiert (`ncu -u`)
- [ ] `npm audit` bestanden
- [ ] Build erfolgreich (`npm run build`)
- [ ] Linting bestanden (`npm run lint`)
- [ ] Tests bestanden
- [ ] Datenschutz-Dokumentation aktualisiert
- [ ] Changelog aktualisiert

---

## 10. Kontakte & Eskalation

### Security Issues

- **E-Mail**: security@streamingtools.app
- **Response Time**: < 24 Stunden

### Privacy Requests (DSGVO)

- **E-Mail**: privacy@streamingtools.app
- **Response Time**: < 30 Tage (gesetzlich)

### Abuse Reports

- **E-Mail**: abuse@streamingtools.app
- **Response Time**: < 48 Stunden

---

*Dieses Dokument wird bei jeder neuen Tool-Implementierung aktualisiert.*

