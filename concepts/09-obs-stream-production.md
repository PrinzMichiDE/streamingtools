# 🎬 OBS & Stream Production (10 Tools)

> Produktions-Tools für professionelle Stream-Qualität

---

## T-PROD-001 — OBS Remote Control Panel

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-001 |
| **Kategorie** | Stream Production |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | L |
| **Zielgruppe** | Streamer, Mods |

### Problem & Lösung

**Problem:**  
OBS-Steuerung erfordert Fokuswechsel aus dem Spiel.

**Lösung:**  
Web-basiertes Control Panel für OBS via WebSocket.

### Features

- Szenen-Wechsel
- Source ein/ausblenden
- Audio-Mixer (Lautstärke, Mute)
- Recording starten/stoppen
- Stream-Status anzeigen
- Hotkey-Trigger
- Mobile-freundlich

### OBS WebSocket Integration

```typescript
// src/lib/services/obs.service.ts
import OBSWebSocket from 'obs-websocket-js';

export class OBSService {
  private obs: OBSWebSocket;
  private connected: boolean = false;
  
  async connect(url: string, password?: string) {
    this.obs = new OBSWebSocket();
    
    try {
      await this.obs.connect(url, password);
      this.connected = true;
      
      // Event-Listener
      this.obs.on('CurrentProgramSceneChanged', (data) => {
        this.emit('sceneChanged', data.sceneName);
      });
      
      this.obs.on('StreamStateChanged', (data) => {
        this.emit('streamStateChanged', data.outputActive);
      });
      
    } catch (error) {
      console.error('OBS connection failed:', error);
      throw error;
    }
  }
  
  async getScenes(): Promise<OBSScene[]> {
    const response = await this.obs.call('GetSceneList');
    return response.scenes.map(scene => ({
      name: scene.sceneName,
      index: scene.sceneIndex,
      isCurrent: scene.sceneName === response.currentProgramSceneName
    }));
  }
  
  async switchScene(sceneName: string) {
    await this.obs.call('SetCurrentProgramScene', { sceneName });
  }
  
  async getSources(sceneName: string): Promise<OBSSource[]> {
    const response = await this.obs.call('GetSceneItemList', { sceneName });
    return response.sceneItems.map(item => ({
      id: item.sceneItemId,
      name: item.sourceName,
      visible: item.sceneItemEnabled,
      locked: item.sceneItemLocked
    }));
  }
  
  async toggleSource(sceneName: string, sourceId: number, visible: boolean) {
    await this.obs.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId: sourceId,
      sceneItemEnabled: visible
    });
  }
  
  async getAudioSources(): Promise<OBSAudioSource[]> {
    const response = await this.obs.call('GetInputList');
    const audioInputs = [];
    
    for (const input of response.inputs) {
      try {
        const volume = await this.obs.call('GetInputVolume', { inputName: input.inputName });
        const muted = await this.obs.call('GetInputMute', { inputName: input.inputName });
        
        audioInputs.push({
          name: input.inputName,
          kind: input.inputKind,
          volume: volume.inputVolumeDb,
          muted: muted.inputMuted
        });
      } catch {
        // Nicht alle Inputs haben Audio
      }
    }
    
    return audioInputs;
  }
  
  async setVolume(inputName: string, volumeDb: number) {
    await this.obs.call('SetInputVolume', { inputName, inputVolumeDb: volumeDb });
  }
  
  async toggleMute(inputName: string) {
    await this.obs.call('ToggleInputMute', { inputName });
  }
  
  async startRecording() {
    await this.obs.call('StartRecord');
  }
  
  async stopRecording() {
    await this.obs.call('StopRecord');
  }
  
  async getStreamStatus(): Promise<OBSStreamStatus> {
    const status = await this.obs.call('GetStreamStatus');
    return {
      active: status.outputActive,
      duration: status.outputDuration,
      bytesPerSec: status.outputBytes,
      congestion: status.outputCongestion,
      skippedFrames: status.outputSkippedFrames,
      totalFrames: status.outputTotalFrames
    };
  }
}
```

### Frontend

```typescript
// src/components/obs/OBSControlPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useOBS } from '@/hooks/useOBS';

export function OBSControlPanel() {
  const { 
    connected, 
    scenes, 
    currentScene, 
    sources, 
    audioSources,
    streamStatus,
    switchScene,
    toggleSource,
    setVolume,
    toggleMute
  } = useOBS();
  
  if (!connected) {
    return (
      <Card className="p-6">
        <OBSConnectionForm />
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Stream Status */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Stream Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${streamStatus.active ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{streamStatus.active ? 'LIVE' : 'Offline'}</span>
          </div>
          {streamStatus.active && (
            <>
              <p className="text-sm text-zinc-400">
                Laufzeit: {formatDuration(streamStatus.duration)}
              </p>
              <p className="text-sm text-zinc-400">
                Bitrate: {formatBitrate(streamStatus.bytesPerSec)}
              </p>
            </>
          )}
        </div>
      </Card>
      
      {/* Scenes */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Szenen</h3>
        <div className="grid grid-cols-2 gap-2">
          {scenes.map(scene => (
            <Button
              key={scene.name}
              variant={scene.isCurrent ? 'default' : 'outline'}
              onClick={() => switchScene(scene.name)}
              className="truncate"
            >
              {scene.name}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Sources */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Quellen ({currentScene})</h3>
        <div className="space-y-2">
          {sources.map(source => (
            <div key={source.id} className="flex items-center justify-between">
              <span className="truncate">{source.name}</span>
              <Button
                size="sm"
                variant={source.visible ? 'default' : 'ghost'}
                onClick={() => toggleSource(currentScene, source.id, !source.visible)}
              >
                {source.visible ? '👁️' : '👁️‍🗨️'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Audio Mixer */}
      <Card className="p-4 lg:col-span-2">
        <h3 className="font-semibold mb-4">Audio Mixer</h3>
        <div className="space-y-4">
          {audioSources.map(source => (
            <div key={source.name} className="flex items-center gap-4">
              <Button
                size="sm"
                variant={source.muted ? 'destructive' : 'outline'}
                onClick={() => toggleMute(source.name)}
              >
                {source.muted ? '🔇' : '🔊'}
              </Button>
              <span className="w-32 truncate">{source.name}</span>
              <Slider
                min={-60}
                max={0}
                value={source.volume}
                onChange={(value) => setVolume(source.name, value)}
                className="flex-1"
              />
              <span className="w-16 text-right text-sm text-zinc-400">
                {source.volume.toFixed(1)} dB
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

---

## T-PROD-002 — Stream Deck Integration

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-002 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Stream Deck kann nur vordefinierte Aktionen ausführen.

**Lösung:** Custom Stream Deck Plugin für StreamingTools.

### Features

- Overlay ein/ausblenden
- Alert triggern
- Goal aktualisieren
- Chat-Command ausführen
- Scene wechseln (via OBS)

---

## T-PROD-003 — Audio Ducking

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-003 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Alerts überlagern wichtige Audio-Quellen.

**Lösung:** Automatisches Audio-Ducking bei Alerts.

### Features

- Musik leiser bei Alerts
- Konfigurierbare Ducking-Stufen
- Smooth Fade In/Out
- Per-Source Einstellungen

---

## T-PROD-004 — Scene Presets

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-004 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Verschiedene Spiele brauchen verschiedene Layouts.

**Lösung:** Gespeicherte Scene-Konfigurationen pro Kategorie.

---

## T-PROD-005 — Instant Replay System

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-005 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Coole Momente können nicht sofort wiederholt werden.

**Lösung:** Replay-Buffer mit On-Demand-Wiedergabe.

### Features

- Rolling Buffer (letzte X Sekunden)
- Hotkey für Replay
- Slow-Motion Option
- Overlay-Anzeige
- Auto-Clip nach Replay

---

## T-PROD-006 — Multi-Cam Director

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-006 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Mehrere Kameras manuell wechseln ist aufwendig.

**Lösung:** Automatischer Kamera-Wechsel basierend auf Regeln.

---

## T-PROD-007 — Stream Health Monitor

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-007 |
| **Priorität** | 🔴 Hoch |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Stream-Probleme werden zu spät bemerkt.

**Lösung:** Echtzeit-Monitoring mit Alerts.

### Metriken

```typescript
interface StreamHealth {
  // Encoding
  fps: number;
  targetFps: number;
  droppedFrames: number;
  droppedFramesPercent: number;
  
  // Network
  bitrate: number;
  targetBitrate: number;
  rtt: number;
  packetLoss: number;
  
  // CPU/GPU
  cpuUsage: number;
  gpuUsage: number;
  ramUsage: number;
  
  // Overall
  healthScore: number;  // 0-100
  issues: HealthIssue[];
}

interface HealthIssue {
  type: 'warning' | 'critical';
  component: string;
  message: string;
  suggestion: string;
}
```

---

## T-PROD-008 — Virtual Green Screen

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-008 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | L |

### Problem & Lösung

**Problem:** Kein echtes Green Screen vorhanden.

**Lösung:** AI-basierte Hintergrund-Entfernung.

---

## T-PROD-009 — Transition Library

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-009 |
| **Priorität** | 🟢 Niedrig |
| **Komplexität** | M |

### Problem & Lösung

**Problem:** Übergänge sind langweilig.

**Lösung:** Library mit animierten Transitions.

---

## T-PROD-010 — Stream Timer Dashboard

### Übersicht

| Feld | Wert |
|------|------|
| **ID** | T-PROD-010 |
| **Priorität** | 🟡 Mittel |
| **Komplexität** | S |

### Problem & Lösung

**Problem:** Keine Übersicht über Stream-Timing.

**Lösung:** Dashboard mit allen Timern.

### Features

- Stream-Laufzeit
- Segment-Timer
- Break-Timer
- Countdown bis Raid/End
- Geplante Events

---

## Zusammenfassung OBS & Production

| ID | Name | Priorität | Komplexität |
|----|------|-----------|-------------|
| T-PROD-001 | OBS Remote Control Panel | 🔴 | L |
| T-PROD-002 | Stream Deck Integration | 🟡 | L |
| T-PROD-003 | Audio Ducking | 🟡 | M |
| T-PROD-004 | Scene Presets | 🟢 | S |
| T-PROD-005 | Instant Replay System | 🟡 | L |
| T-PROD-006 | Multi-Cam Director | 🟢 | L |
| T-PROD-007 | Stream Health Monitor | 🔴 | M |
| T-PROD-008 | Virtual Green Screen | 🟢 | L |
| T-PROD-009 | Transition Library | 🟢 | M |
| T-PROD-010 | Stream Timer Dashboard | 🟡 | S |

---

*Weiter zu [10-accessibility-localization.md](./10-accessibility-localization.md)*

