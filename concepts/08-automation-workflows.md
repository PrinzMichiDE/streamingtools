# ⚡ Automation & Workflows (12 Tools)

> Automatisierungen für wiederkehrende Aufgaben und Event-basierte Aktionen

---

## T-AUTO-001 — Event Trigger Engine (IFTTT for Streams)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-001 |
| **Kategorie** | Automation |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | XL |
| **Zielgruppe** | Streamer, Power-User |

### Problem & Lösung

**Problem:**  
Wiederkehrende Aktionen müssen manuell ausgeführt werden.

**Lösung:**  
Visueller Workflow-Builder: "Wenn X passiert, tue Y".

---

## 1. Aufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Event Trigger Engine                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Trigger   │──│  Condition  │──│   Action    │──│   Logger    │ │
│  │   Listener  │  │   Evaluator │  │   Executor  │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Trigger-Typen

```typescript
enum TriggerType {
  // Twitch Events
  STREAM_ONLINE = 'stream.online',
  STREAM_OFFLINE = 'stream.offline',
  NEW_FOLLOWER = 'channel.follow',
  NEW_SUB = 'channel.subscribe',
  GIFT_SUB = 'channel.subscription.gift',
  CHEER = 'channel.cheer',
  RAID_RECEIVED = 'channel.raid',
  CHANNEL_POINT_REDEMPTION = 'channel.channel_points_custom_reward_redemption.add',
  
  // Custom Events
  VIEWER_MILESTONE = 'custom.viewer_milestone',
  CHAT_KEYWORD = 'custom.chat_keyword',
  TIMER = 'custom.timer',
  SCHEDULE = 'custom.schedule',
  GOAL_REACHED = 'custom.goal_reached',
  
  // External
  WEBHOOK_RECEIVED = 'external.webhook',
  API_POLL = 'external.api_poll',
}
```

### Action-Typen

```typescript
enum ActionType {
  // Chat
  SEND_CHAT_MESSAGE = 'chat.send_message',
  SET_SLOW_MODE = 'chat.slow_mode',
  SET_SUB_ONLY = 'chat.sub_only',
  
  // Overlay
  SHOW_ALERT = 'overlay.show_alert',
  UPDATE_OVERLAY = 'overlay.update',
  TRIGGER_ANIMATION = 'overlay.animation',
  
  // OBS
  SWITCH_SCENE = 'obs.switch_scene',
  TOGGLE_SOURCE = 'obs.toggle_source',
  START_RECORDING = 'obs.start_recording',
  
  // Discord
  SEND_DISCORD_MESSAGE = 'discord.send_message',
  POST_ANNOUNCEMENT = 'discord.announcement',
  
  // Twitter/Social
  POST_TWEET = 'social.tweet',
  
  // System
  SEND_NOTIFICATION = 'system.notification',
  WEBHOOK_CALL = 'system.webhook',
  DELAY = 'system.delay',
  
  // Custom
  RUN_SCRIPT = 'custom.script',
}
```

### Workflow-Schema

```prisma
model Workflow {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  description   String?
  
  enabled       Boolean  @default(true)
  
  /// Workflow-Definition (JSON)
  definition    Json
  
  /// Statistiken
  executionCount Int     @default(0)
  lastExecuted   DateTime?
  lastError      String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  executions    WorkflowExecution[]
  
  @@index([userId])
  @@index([enabled])
}

model WorkflowExecution {
  id            String   @id @default(cuid())
  workflowId    String
  workflow      Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  /// Trigger-Daten
  triggerType   String
  triggerData   Json
  
  /// Ergebnis
  status        String   // success, failed, partial
  actionsExecuted Int
  
  /// Logs
  logs          Json     @default("[]")
  error         String?
  
  startedAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([workflowId])
  @@index([startedAt])
}
```

### Workflow-Definition

```typescript
interface WorkflowDefinition {
  trigger: TriggerConfig;
  conditions?: Condition[];
  actions: ActionConfig[];
}

interface TriggerConfig {
  type: TriggerType;
  config: Record<string, unknown>;
}

interface Condition {
  type: 'and' | 'or' | 'not';
  conditions?: Condition[];
  field?: string;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'matches';
  value?: unknown;
}

interface ActionConfig {
  type: ActionType;
  config: Record<string, unknown>;
  delay?: number;  // ms
  continueOnError?: boolean;
}

// Beispiel-Workflow
const exampleWorkflow: WorkflowDefinition = {
  trigger: {
    type: TriggerType.RAID_RECEIVED,
    config: { minViewers: 10 }
  },
  conditions: [
    {
      type: 'and',
      conditions: [
        { field: 'viewers', operator: 'gt', value: 50 },
        { field: 'time', operator: 'gt', value: '18:00' }
      ]
    }
  ],
  actions: [
    {
      type: ActionType.SEND_CHAT_MESSAGE,
      config: { message: 'Willkommen Raider! 🎉' }
    },
    {
      type: ActionType.SHOW_ALERT,
      config: { template: 'raid', duration: 10000 },
      delay: 2000
    },
    {
      type: ActionType.SEND_DISCORD_MESSAGE,
      config: {
        channel: 'announcements',
        message: 'Wir wurden von {raider} mit {viewers} Viewern geraided!'
      }
    }
  ]
};
```

### Workflow-Engine

```typescript
// src/lib/services/workflow.service.ts
export class WorkflowEngine {
  async processEvent(event: TriggerEvent) {
    // 1. Matching Workflows finden
    const workflows = await this.findMatchingWorkflows(event);
    
    // 2. Für jeden Workflow ausführen
    for (const workflow of workflows) {
      await this.executeWorkflow(workflow, event);
    }
  }
  
  private async executeWorkflow(workflow: Workflow, event: TriggerEvent) {
    const definition = workflow.definition as WorkflowDefinition;
    const context = this.buildContext(event);
    
    // Conditions prüfen
    if (definition.conditions) {
      const conditionsMet = this.evaluateConditions(definition.conditions, context);
      if (!conditionsMet) return;
    }
    
    // Actions ausführen
    const execution = await this.createExecution(workflow.id, event);
    
    for (const action of definition.actions) {
      try {
        if (action.delay) {
          await this.delay(action.delay);
        }
        
        await this.executeAction(action, context);
        await this.logAction(execution.id, action, 'success');
        
      } catch (error) {
        await this.logAction(execution.id, action, 'failed', error);
        
        if (!action.continueOnError) {
          throw error;
        }
      }
    }
    
    await this.completeExecution(execution.id, 'success');
  }
  
  private async executeAction(action: ActionConfig, context: WorkflowContext) {
    const executor = this.getExecutor(action.type);
    const resolvedConfig = this.resolveVariables(action.config, context);
    await executor.execute(resolvedConfig);
  }
  
  private resolveVariables(config: Record<string, unknown>, context: WorkflowContext): Record<string, unknown> {
    // Ersetzt {variable} mit Werten aus Context
    const resolve = (value: unknown): unknown => {
      if (typeof value === 'string') {
        return value.replace(/\{(\w+)\}/g, (_, key) => {
          return context[key] ?? `{${key}}`;
        });
      }
      if (Array.isArray(value)) {
        return value.map(resolve);
      }
      if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, resolve(v)])
        );
      }
      return value;
    };
    
    return resolve(config) as Record<string, unknown>;
  }
}
```

---

## T-AUTO-002 — Stream Start/End Automation

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Vergessene Pre/Post-Stream-Aufgaben.

**Lösung:** Checkliste mit automatischer Ausführung.

### Features

- Pre-Stream:
  - Discord-Announcement posten
  - Tweet senden
  - OBS-Szene wechseln
  - Overlays aktivieren
  
- Post-Stream:
  - VOD-Export starten
  - Stats-Summary posten
  - "Stream Offline" Nachricht
  - Backup-Routine

---

## T-AUTO-003 — Smart Scene Switcher

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Manuelle Szenen-Wechsel bei Events.

**Lösung:** Automatische Szenen-Wechsel basierend auf Events.

### Regeln

- Bei Raid: Wechsel zu "Raid Welcome" Scene für 30s
- Bei Sub-Bomb: "Celebration" Scene
- Bei BRB-Timer Start: "BRB" Scene
- Bei Game-Wechsel: Update Game-Overlay

---

## T-AUTO-004 — Scheduled Tasks

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Zeitbasierte Aufgaben vergessen.

**Lösung:** Cron-ähnlicher Task-Scheduler.

### Features

- Zeitbasierte Aktionen (z.B. "Jeden Montag 18:00")
- Wiederkehrende Aktionen (z.B. "Alle 30 Minuten während Stream")
- Einmalige Aktionen mit Countdown

---

## T-AUTO-005 — Chat Macro System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-005 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Lange Nachrichten müssen jedes Mal getippt werden.

**Lösung:** Macro-System für häufige Nachrichten.

---

## T-AUTO-006 — Backup Automation

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-006 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Overlay-Konfigurationen gehen verloren.

**Lösung:** Automatische Backups aller Einstellungen.

---

## T-AUTO-007 — Multi-Platform Sync

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-007 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Stream-Info auf mehreren Plattformen manuell aktualisieren.

**Lösung:** Automatischer Sync von Titel, Kategorie, etc.

---

## T-AUTO-008 — Clip Auto-Publisher

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Clips werden nicht geteilt.

**Lösung:** Automatische Veröffentlichung von Top-Clips.

### Features

- Clips mit X+ Views automatisch teilen
- Twitter/Discord Post mit Clip-Link
- Daily/Weekly Clip-Digest

---

## T-AUTO-009 — Goal Automation

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-009 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Goal-Änderungen sind manuell.

**Lösung:** Automatische Goal-Updates basierend auf Regeln.

---

## T-AUTO-010 — Integration Hub

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-010 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Viele externe Services, keine zentrale Steuerung.

**Lösung:** Zentrale Integration für alle verbundenen Services.

### Integrationen

- Discord (Webhooks, Bot)
- Twitter/X
- OBS WebSocket
- Spotify
- Philips Hue
- StreamElements
- Streamlabs

---

## T-AUTO-011 — Webhook Relay

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-011 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Externe Services können Events nicht empfangen.

**Lösung:** Webhook-Relay für benutzerdefinierte Endpoints.

---

## T-AUTO-012 — Emergency Mode

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-AUTO-012 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine schnelle Reaktion auf Notfälle (Raid, Doxxing).

**Lösung:** Ein-Klick "Panic Button" für Notfall-Maßnahmen.

### Features

- Ein Button aktiviert:
  - Emote-Only Mode
  - Follower-Only (7 Tage)
  - Chat-Clear
  - Overlay-Hide
  - Mod-Benachrichtigung
  
- Cooldown für Deaktivierung
- Automatische Rücknahme nach X Minuten

---

## Zusammenfassung Automation

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-AUTO-001 | Event Trigger Engine | 🔴 | XL |
| T-AUTO-002 | Stream Start/End Automation | 🔴 | M |
| T-AUTO-003 | Smart Scene Switcher | 🟡 | M |
| T-AUTO-004 | Scheduled Tasks | 🟡 | S |
| T-AUTO-005 | Chat Macro System | 🟢 | S |
| T-AUTO-006 | Backup Automation | 🟡 | M |
| T-AUTO-007 | Multi-Platform Sync | 🟢 | L |
| T-AUTO-008 | Clip Auto-Publisher | 🟡 | M |
| T-AUTO-009 | Goal Automation | 🟡 | S |
| T-AUTO-010 | Integration Hub | 🔴 | L |
| T-AUTO-011 | Webhook Relay | 🟢 | S |
| T-AUTO-012 | Emergency Mode | 🔴 | M |

---

*Weiter zu [09-obs-stream-production.md](./09-obs-stream-production.md)*

