# 🔧 Developer Platform & API (6 Tools)

> Erweiterbarkeit und Integration für Entwickler

---

## T-DEV-001 — Public REST API

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-001 |
| **Kategorie** | Developer Platform |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Third-Party-Entwickler |

### Problem & Lösung

**Problem:**  
Keine Möglichkeit, StreamingTools-Daten extern zu nutzen.

**Lösung:**  
Öffentliche REST API mit vollständiger Dokumentation.

### API-Design

```typescript
// Basis-URL: https://api.streamingtools.app/v1

// Endpunkte
const API_ENDPOINTS = {
  // User
  'GET /users/me': 'Aktueller User',
  'GET /users/:id': 'User by ID',
  
  // Overlays
  'GET /overlays': 'Alle Overlays des Users',
  'GET /overlays/:type': 'Overlay by Type',
  'PUT /overlays/:type': 'Overlay aktualisieren',
  
  // Goals
  'GET /goals': 'Alle Goals',
  'POST /goals': 'Goal erstellen',
  'GET /goals/:id': 'Goal by ID',
  'PUT /goals/:id': 'Goal aktualisieren',
  'DELETE /goals/:id': 'Goal löschen',
  'POST /goals/:id/increment': 'Goal-Wert erhöhen',
  
  // Loyalty
  'GET /loyalty/config': 'Loyalty-Konfiguration',
  'GET /loyalty/balances': 'Alle Balances',
  'GET /loyalty/balances/:userId': 'Balance eines Users',
  'POST /loyalty/balances/:userId/add': 'Punkte hinzufügen',
  'POST /loyalty/balances/:userId/subtract': 'Punkte abziehen',
  
  // Commands
  'GET /commands': 'Alle Commands',
  'POST /commands': 'Command erstellen',
  'PUT /commands/:id': 'Command aktualisieren',
  'DELETE /commands/:id': 'Command löschen',
  
  // Stats
  'GET /stats/current-stream': 'Aktuelle Stream-Stats',
  'GET /stats/history': 'Historische Stats',
  
  // Events
  'POST /events/trigger': 'Custom Event triggern',
};
```

### OpenAPI-Spezifikation

```yaml
openapi: 3.1.0
info:
  title: StreamingTools API
  version: 1.0.0
  description: API für StreamingTools-Integration

servers:
  - url: https://api.streamingtools.app/v1
    description: Production

security:
  - ApiKeyAuth: []

paths:
  /goals:
    get:
      summary: Liste aller Goals
      tags: [Goals]
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, completed, all]
      responses:
        200:
          description: Erfolg
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Goal'
        401:
          $ref: '#/components/responses/Unauthorized'
    
    post:
      summary: Neues Goal erstellen
      tags: [Goals]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateGoalRequest'
      responses:
        201:
          description: Goal erstellt
        400:
          $ref: '#/components/responses/BadRequest'

  /goals/{id}/increment:
    post:
      summary: Goal-Wert erhöhen
      tags: [Goals]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                amount:
                  type: integer
                  minimum: 1
      responses:
        200:
          description: Erfolg

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: Authorization
      description: Bearer Token (API Key)

  schemas:
    Goal:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        targetValue:
          type: integer
        currentValue:
          type: integer
        type:
          type: string
        isActive:
          type: boolean
        createdAt:
          type: string
          format: date-time

  responses:
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            type: object
            properties:
              success:
                type: boolean
                example: false
              error:
                type: object
                properties:
                  message:
                    type: string
                  code:
                    type: string
```

---

## T-DEV-002 — Webhooks (Outgoing)

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Externe Services können nicht auf Events reagieren.

**Lösung:** Konfiguierbare Webhooks für alle Events.

### Features

- Webhook-URL konfigurieren
- Event-Filter (nur bestimmte Events)
- Retry-Logik mit Backoff
- Signatur-Verifizierung
- Webhook-Logs

### Prisma Schema

```prisma
model Webhook {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  url           String
  secret        String   // Für HMAC-Signatur
  
  /// Events (JSON Array)
  events        Json     @default("[\"*\"]")
  
  /// Status
  enabled       Boolean  @default(true)
  
  /// Statistiken
  successCount  Int      @default(0)
  failureCount  Int      @default(0)
  lastTriggered DateTime?
  lastStatus    Int?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  logs          WebhookLog[]
  
  @@index([userId])
}

model WebhookLog {
  id            String   @id @default(cuid())
  webhookId     String
  webhook       Webhook  @relation(fields: [webhookId], references: [id], onDelete: Cascade)
  
  event         String
  payload       Json
  
  /// Response
  statusCode    Int?
  responseBody  String?
  
  /// Timing
  duration      Int?     // ms
  
  /// Retries
  attempt       Int      @default(1)
  
  createdAt     DateTime @default(now())
  
  @@index([webhookId])
  @@index([createdAt])
}
```

### Webhook-Service

```typescript
// src/lib/services/webhook.service.ts
import crypto from 'crypto';

export class WebhookService {
  async triggerWebhooks(userId: string, event: string, payload: object) {
    const webhooks = await this.getActiveWebhooks(userId, event);
    
    for (const webhook of webhooks) {
      this.sendWebhook(webhook, event, payload);
    }
  }
  
  private async sendWebhook(
    webhook: Webhook,
    event: string,
    payload: object,
    attempt: number = 1
  ) {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload
    });
    
    const signature = this.generateSignature(body, webhook.secret);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Delivery': crypto.randomUUID()
        },
        body,
        signal: AbortSignal.timeout(10000) // 10s Timeout
      });
      
      await this.logDelivery(webhook.id, event, payload, {
        statusCode: response.status,
        duration: Date.now() - startTime,
        attempt
      });
      
      if (!response.ok && attempt < 3) {
        // Retry mit Backoff
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendWebhook(webhook, event, payload, attempt + 1);
        }, delay);
      }
      
    } catch (error) {
      await this.logDelivery(webhook.id, event, payload, {
        statusCode: 0,
        error: error.message,
        duration: Date.now() - startTime,
        attempt
      });
      
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => {
          this.sendWebhook(webhook, event, payload, attempt + 1);
        }, delay);
      }
    }
  }
  
  private generateSignature(body: string, secret: string): string {
    return `sha256=${crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')}`;
  }
}
```

---

## T-DEV-003 — Plugin System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-003 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | XL |

### Problem & Lösung

**Problem:** Plattform ist nicht erweiterbar.

**Lösung:** Plugin-Architektur für Custom-Funktionen.

### Features

- Plugin-Manifest (JSON)
- Sandboxed Execution
- API-Zugriff mit Scopes
- UI-Erweiterungspunkte
- Plugin-Marketplace

---

## T-DEV-004 — Custom Overlay SDK

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Custom Overlays sind schwer zu entwickeln.

**Lösung:** SDK für einfache Overlay-Entwicklung.

### SDK-Features

```typescript
// @streamingtools/overlay-sdk

import { StreamingToolsOverlay } from '@streamingtools/overlay-sdk';

const overlay = new StreamingToolsOverlay({
  userId: 'user123',
  apiKey: 'sk_...'
});

// Events abonnieren
overlay.on('goal.updated', (goal) => {
  console.log('Goal updated:', goal.currentValue);
});

overlay.on('alert.new', (alert) => {
  console.log('New alert:', alert.type);
});

// Daten abrufen
const goals = await overlay.getGoals();
const loyalty = await overlay.getLoyaltyConfig();

// Real-time Updates
overlay.subscribe('goals', (goals) => {
  updateUI(goals);
});

// Theming
overlay.setTheme({
  primaryColor: '#8b5cf6',
  fontFamily: 'Inter'
});
```

---

## T-DEV-005 — API Documentation Portal

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-005 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Dokumentation für Entwickler.

**Lösung:** Interaktives API-Dokumentations-Portal.

### Features

- OpenAPI-basierte Dokumentation
- Try-It-Out Playground
- Code-Beispiele (cURL, JS, Python)
- Authentication Guide
- Rate Limit Info
- Changelog

---

## T-DEV-006 — Developer Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-DEV-006 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Keine Übersicht über API-Nutzung.

**Lösung:** Developer-Dashboard mit Statistiken.

### Features

- API-Key-Verwaltung
- Request-Statistiken
- Error-Logs
- Webhook-Status
- Rate-Limit-Anzeige

---

## Zusammenfassung Developer Platform

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-DEV-001 | Public REST API | 🔴 | L |
| T-DEV-002 | Webhooks (Outgoing) | 🔴 | M |
| T-DEV-003 | Plugin System | 🟢 | XL |
| T-DEV-004 | Custom Overlay SDK | 🟡 | L |
| T-DEV-005 | API Documentation Portal | 🔴 | M |
| T-DEV-006 | Developer Dashboard | 🟡 | M |

---

*Weiter zu [12-mobile-irl.md](./12-mobile-irl.md)*

