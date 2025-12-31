# ♿ Accessibility & Localization (8 Tools)

> Barrierefreie und mehrsprachige Streaming-Erlebnisse

---

## T-A11Y-001 — Live Captions

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-001 |
| **Kategorie** | Accessibility |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Gehörlose/Schwerhörige Viewer |

### Problem & Lösung

**Problem:**  
Gehörlose und schwerhörige Zuschauer können dem Stream nicht folgen.

**Lösung:**  
Echtzeit-Untertitel via Speech-to-Text.

### Features

- Echtzeit Speech-to-Text
- Mehrere Sprachen
- Anpassbare Schriftgröße/Farbe
- Position wählbar
- Keyword-Highlighting
- Profanity-Filter

### Technische Umsetzung

```typescript
// src/lib/services/captions.service.ts
export class CaptionsService {
  private recognition: SpeechRecognition | null = null;
  private callbacks: ((text: string) => void)[] = [];
  
  async startListening(language: string = 'de-DE') {
    if (!('webkitSpeechRecognition' in window)) {
      throw new Error('Speech Recognition not supported');
    }
    
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language;
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const text = finalTranscript || interimTranscript;
      this.callbacks.forEach(cb => cb(text));
    };
    
    this.recognition.start();
  }
  
  onCaption(callback: (text: string) => void) {
    this.callbacks.push(callback);
  }
  
  stop() {
    this.recognition?.stop();
  }
}

// Alternative: Cloud Speech-to-Text für bessere Qualität
export class CloudCaptionsService {
  private websocket: WebSocket | null = null;
  
  async connect(userId: string) {
    this.websocket = new WebSocket(`wss://api.example.com/captions/${userId}`);
    
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit('caption', data.text);
    };
  }
  
  async sendAudio(audioData: ArrayBuffer) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(audioData);
    }
  }
}
```

### Overlay-Komponente

```typescript
// src/components/overlays/captions/CaptionsOverlay.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  userId: string;
  config: CaptionsConfig;
}

export function CaptionsOverlay({ userId, config }: Props) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/captions/stream?userId=${userId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setCaptions(prev => {
        const newCaptions = [...prev, {
          id: Date.now().toString(),
          text: data.text,
          timestamp: new Date()
        }];
        
        // Nur letzte X Captions behalten
        return newCaptions.slice(-config.maxLines);
      });
    };
    
    return () => eventSource.close();
  }, [userId, config.maxLines]);
  
  // Auto-Remove alte Captions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCaptions(prev => 
        prev.filter(c => now - c.timestamp.getTime() < config.displayDuration)
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [config.displayDuration]);
  
  const positionClass = getPositionClass(config.position);
  
  return (
    <div 
      ref={containerRef}
      className={`fixed ${positionClass} max-w-[80%] p-4`}
    >
      <div 
        className="rounded-lg px-4 py-2"
        style={{
          backgroundColor: config.backgroundColor,
          fontSize: `${config.fontSize}px`,
          fontFamily: config.fontFamily
        }}
      >
        <AnimatePresence mode="popLayout">
          {captions.map((caption) => (
            <motion.p
              key={caption.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="leading-relaxed"
              style={{ color: config.textColor }}
            >
              {caption.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

---

## T-A11Y-002 — Sign Language Avatar

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-002 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | XL |

### Problem & Lösung

**Problem:** Text-Captions sind nicht ideal für Gebärdensprach-Nutzer.

**Lösung:** Animierter Avatar, der Gebärdensprache zeigt.

---

## T-A11Y-003 — High Contrast Mode

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Overlays sind für sehbehinderte Nutzer schlecht lesbar.

**Lösung:** High-Contrast-Theme für alle Overlays.

### Features

- Automatische Kontrast-Anpassung
- Größere Schriften
- Deutliche Rahmen
- Keine Transparenz
- Customizable per Viewer (URL-Parameter)

---

## T-A11Y-004 — Screen Reader Friendly Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-004 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Dashboard ist nicht mit Screen Readern nutzbar.

**Lösung:** Vollständige ARIA-Labels und Keyboard-Navigation.

### Anforderungen

```typescript
// Accessibility-Checkliste
const A11Y_REQUIREMENTS = [
  'Alle Bilder haben alt-Texte',
  'Alle Buttons haben labels',
  'Fokus-Reihenfolge ist logisch',
  'Tab-Navigation funktioniert',
  'Skip-Links vorhanden',
  'ARIA-live Regions für Updates',
  'Kontrast-Verhältnis >= 4.5:1',
  'Keine reinen Farb-Indikatoren',
  'Formular-Fehler sind beschrieben',
  'Zeitlimits sind anpassbar'
];
```

---

## T-A11Y-005 — Audio Descriptions

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-005 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Visuelle Events werden von blinden Viewern nicht wahrgenommen.

**Lösung:** TTS-Ansagen für wichtige Events.

### Features

- "Neuer Follower: [Name]"
- "Goal erreicht: 100 Subs"
- "Raid von [Name] mit [X] Viewern"
- Anpassbare Stimme/Geschwindigkeit

---

## T-A11Y-006 — Multi-Language Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-006 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Dashboard nur auf Englisch/Deutsch.

**Lösung:** Internationalisierung mit mehreren Sprachen.

### Implementation

```typescript
// src/lib/i18n/config.ts
export const SUPPORTED_LOCALES = ['de', 'en', 'es', 'fr', 'pt', 'ja', 'ko', 'zh'];

export const DEFAULT_LOCALE = 'de';

// Beispiel-Übersetzungen
export const translations = {
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Willkommen zurück, {name}!',
      streamStatus: 'Stream-Status',
      liveNow: 'Jetzt Live',
      offline: 'Offline',
    },
    overlays: {
      title: 'Overlays',
      alerts: 'Alerts',
      goals: 'Ziele',
      chat: 'Chat',
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    // ...
  }
};
```

---

## T-A11Y-007 — Chat Translation

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-007 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Internationale Viewer verstehen Chat nicht.

**Lösung:** Echtzeit-Übersetzung von Chat-Nachrichten.

### Features

- Auto-Detect Sprache
- Übersetzung in Viewer-Sprache
- Inline-Anzeige
- Per-User Opt-in

---

## T-A11Y-008 — Colorblind-Safe Overlays

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-A11Y-008 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Rot/Grün-Indikatoren sind für Farbenblinde unlesbar.

**Lösung:** Colorblind-Safe Farbpaletten und Muster.

### Features

- Deuteranopie-freundliche Farben
- Zusätzliche Icons/Muster neben Farben
- Testmodus für Streamer
- Automatische Palette-Anpassung

---

## Zusammenfassung Accessibility

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-A11Y-001 | Live Captions | 🔴 | L |
| T-A11Y-002 | Sign Language Avatar | 🟢 | XL |
| T-A11Y-003 | High Contrast Mode | 🟡 | S |
| T-A11Y-004 | Screen Reader Friendly Dashboard | 🔴 | M |
| T-A11Y-005 | Audio Descriptions | 🟢 | L |
| T-A11Y-006 | Multi-Language Dashboard | 🔴 | M |
| T-A11Y-007 | Chat Translation | 🟡 | M |
| T-A11Y-008 | Colorblind-Safe Overlays | 🟡 | S |

---

*Weiter zu [11-developer-platform-api.md](./11-developer-platform-api.md)*

