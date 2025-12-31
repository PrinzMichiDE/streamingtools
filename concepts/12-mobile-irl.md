# 📱 Mobile & IRL (10 Tools)

> Tools für mobile Streams und IRL-Inhalte

---

## T-IRL-001 — Mobile Control App

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-001 |
| **Kategorie** | Mobile & IRL |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | XL |
| **Zielgruppe** | IRL-Streamer |

### Problem & Lösung

**Problem:**  
Kein Zugriff auf Dashboard-Funktionen während IRL-Streams.

**Lösung:**  
Native Mobile App für volle Kontrolle unterwegs.

### Features

- Stream-Status anzeigen
- Overlays ein/ausschalten
- Goals aktualisieren
- Alerts testen
- Chat-Moderation
- Quick Actions
- Push-Benachrichtigungen

### Technologie

```typescript
// React Native + Expo
// src/app/mobile/screens/DashboardScreen.tsx

import { View, Text, ScrollView } from 'react-native';
import { useStreamStatus } from '@/hooks/useStreamStatus';
import { useOverlays } from '@/hooks/useOverlays';
import { StreamStatusCard } from '@/components/StreamStatusCard';
import { QuickActionsGrid } from '@/components/QuickActionsGrid';
import { OverlayToggleList } from '@/components/OverlayToggleList';

export function DashboardScreen() {
  const { status, isLive, viewers } = useStreamStatus();
  const { overlays, toggleOverlay } = useOverlays();
  
  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <StreamStatusCard isLive={isLive} viewers={viewers} />
      
      <View className="p-4">
        <Text className="text-xl font-bold text-white mb-4">
          Quick Actions
        </Text>
        <QuickActionsGrid />
      </View>
      
      <View className="p-4">
        <Text className="text-xl font-bold text-white mb-4">
          Overlays
        </Text>
        <OverlayToggleList 
          overlays={overlays} 
          onToggle={toggleOverlay}
        />
      </View>
    </ScrollView>
  );
}
```

---

## T-IRL-002 — GPS Location Overlay

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-002 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Viewer wissen nicht, wo der Streamer ist.

**Lösung:** Echtzeit-Karten-Overlay mit Location.

### Features

- Live-Karte (MapTiler, OpenStreetMap)
- Route-Tracking
- POI-Anzeige
- Privacy-Delay (5-30 Minuten)
- Blur-Radius für genaue Position
- Offline-Fallback

### Prisma Schema

```prisma
model LocationConfig {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  enabled       Boolean  @default(false)
  
  /// Privacy
  delayMinutes  Int      @default(5)
  blurRadius    Int      @default(500)  // Meter
  
  /// Styling
  mapStyle      String   @default("dark")
  showRoute     Boolean  @default(true)
  routeColor    String   @default("#8b5cf6")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  locations     Location[]
}

model Location {
  id            String   @id @default(cuid())
  configId      String
  config        LocationConfig @relation(fields: [configId], references: [id], onDelete: Cascade)
  
  latitude      Float
  longitude     Float
  altitude      Float?
  accuracy      Float?
  speed         Float?
  heading       Float?
  
  /// Zeitstempel
  timestamp     DateTime
  
  /// Wann darf diese Location angezeigt werden (Privacy-Delay)
  visibleAt     DateTime
  
  @@index([configId])
  @@index([timestamp])
  @@index([visibleAt])
}
```

### Location Service

```typescript
// src/lib/services/location.service.ts
export class LocationService {
  async updateLocation(userId: string, location: LocationInput) {
    const config = await this.getConfig(userId);
    if (!config?.enabled) return;
    
    // Privacy-Delay berechnen
    const visibleAt = new Date(
      location.timestamp.getTime() + config.delayMinutes * 60 * 1000
    );
    
    await prisma.location.create({
      data: {
        configId: config.id,
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        timestamp: location.timestamp,
        visibleAt
      }
    });
    
    // Alte Locations löschen (> 24h)
    await this.cleanupOldLocations(config.id);
  }
  
  async getCurrentLocation(userId: string): Promise<BlurredLocation | null> {
    const config = await this.getConfig(userId);
    if (!config?.enabled) return null;
    
    // Nur bereits sichtbare Locations
    const latest = await prisma.location.findFirst({
      where: {
        configId: config.id,
        visibleAt: { lte: new Date() }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    if (!latest) return null;
    
    // Position mit Blur-Radius versetzen
    return this.blurLocation(latest, config.blurRadius);
  }
  
  async getRoute(userId: string, hours: number = 4): Promise<BlurredLocation[]> {
    const config = await this.getConfig(userId);
    if (!config?.enabled || !config.showRoute) return [];
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const locations = await prisma.location.findMany({
      where: {
        configId: config.id,
        visibleAt: { lte: new Date() },
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'asc' }
    });
    
    return locations.map(loc => this.blurLocation(loc, config.blurRadius));
  }
  
  private blurLocation(location: Location, radiusMeters: number): BlurredLocation {
    // Zufällige Verschiebung innerhalb des Radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusMeters;
    
    // Umrechnung in Grad (approximiert)
    const latOffset = (distance * Math.cos(angle)) / 111320;
    const lngOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(location.latitude * Math.PI / 180));
    
    return {
      latitude: location.latitude + latOffset,
      longitude: location.longitude + lngOffset,
      timestamp: location.timestamp,
      speed: location.speed
    };
  }
}
```

---

## T-IRL-003 — Battery & Connection Indicator

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-003 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Viewer wissen nicht, warum Stream abbricht.

**Lösung:** Overlay mit Batterie- und Signal-Anzeige.

### Features

- Batteriestatus (%)
- Ladezustand-Indikator
- Mobilfunk-Signalstärke
- Verbindungstyp (4G, 5G, WiFi)
- Low-Battery-Warnung

---

## T-IRL-004 — Speed & Altitude Gauge

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-004 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Bewegungsdaten sind interessant für Travel-Streams.

**Lösung:** Tacho-artiges Overlay mit Geschwindigkeit.

### Features

- Aktuelle Geschwindigkeit (km/h oder mph)
- Höhe über Meeresspiegel
- Zurückgelegte Strecke
- Durchschnittsgeschwindigkeit

---

## T-IRL-005 — Weather Widget

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-005 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Wetter-Kontext für IRL-Streams.

**Lösung:** Wetter-Overlay mit aktuellen Daten.

### Features

- Aktuelle Temperatur
- Wetter-Icon
- Gefühlte Temperatur
- Luftfeuchtigkeit
- Nächste Stunden Vorhersage

---

## T-IRL-006 — SOS/Safety Button

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-006 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Sicherheit bei IRL-Streams kann gefährdet sein.

**Lösung:** Notfall-Button mit automatischen Aktionen.

### Features

- Ein-Button-Aktivierung
- Automatische Aktionen:
  - Stream beenden
  - Letzte Location speichern
  - Notfall-Kontakt benachrichtigen
  - Automatische Clip-Erstellung (Beweis)
  - Discord-Alert an Mods
- Timer bis Aktivierung (Versehen verhindern)
- Safe-Word im Chat für Mods

---

## T-IRL-007 — Countdown to Location

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-007 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Viewer wissen nicht, wann Streamer ankommt.

**Lösung:** ETA-Anzeige zum nächsten Ziel.

### Features

- Ziel eingeben (Adresse oder Koordinaten)
- Geschätzte Ankunftszeit
- Verbleibende Distanz
- Route-Overlay

---

## T-IRL-008 — Chat Voice Control

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Während IRL kann man nicht am Handy tippen.

**Lösung:** Sprachsteuerung für Mod-Aktionen.

### Features

- "Timeout [User]"
- "Ban [User]"
- "Slow mode on/off"
- "Read chat" (TTS der letzten Nachrichten)
- Custom Voice Commands

---

## T-IRL-009 — Multi-Camera Manager

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-009 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Wechsel zwischen Kameras ist umständlich.

**Lösung:** App-gesteuerter Kamera-Wechsel.

---

## T-IRL-010 — Offline Buffer

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-IRL-010 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Bei Verbindungsabbrüchen geht Content verloren.

**Lösung:** Lokaler Buffer für Verbindungslücken.

### Features

- Lokale Aufnahme bei Verbindungsverlust
- Automatisches Re-Streaming wenn online
- "Wir sind gleich zurück" Overlay
- Seamless Reconnection

---

## Zusammenfassung Mobile & IRL

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-IRL-001 | Mobile Control App | 🔴 | XL |
| T-IRL-002 | GPS Location Overlay | 🔴 | M |
| T-IRL-003 | Battery & Connection Indicator | 🔴 | S |
| T-IRL-004 | Speed & Altitude Gauge | 🟡 | S |
| T-IRL-005 | Weather Widget | 🟢 | S |
| T-IRL-006 | SOS/Safety Button | 🔴 | M |
| T-IRL-007 | Countdown to Location | 🟢 | M |
| T-IRL-008 | Chat Voice Control | 🟡 | L |
| T-IRL-009 | Multi-Camera Manager | 🟢 | L |
| T-IRL-010 | Offline Buffer | 🟡 | L |

---

*Weiter zu [99-security-privacy-compliance.md](./99-security-privacy-compliance.md)*

