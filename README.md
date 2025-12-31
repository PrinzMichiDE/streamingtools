# Twitch Streamer Tools

Eine umfassende Next.js Webapp für Twitch-Streamer mit professionellen Overlays und Tools für alle Streamer-Typen (Gaming, IRL, Creative, Music).

## Features

### Universal Tools
- **Chat Overlay** - Twitch Chat mit Custom Styling
- **Alert System** - Follows, Subs, Bits, Raids mit Animationen
- **Goal Tracker** - Sub/Donation/Follower Goals
- **Countdown Timer** - Stream Start, Break Timer
- **Viewer Counter** - Live Zuschauerzahl
- **Stream Health** - Bitrate, FPS, Dropped Frames Monitor

### Gaming Tools
- **Game Info Overlay** - Aktuelles Spiel + Kategorie
- **Death/Kill Counter** - Todeszähler mit Animationen
- **Speedrun Timer** - Segment-Timer mit Splits
- **Health Bar** - Customizable Health Bar
- **Score Tracker** - Punkte/Score Anzeige

### IRL Tools
- **Location Map** - GPS-Tracking mit Leaflet
- **Speed Overlay** - GPS-Geschwindigkeit
- **Battery Status** - Akku + Signal Stärke
- **Weather Widget** - Aktuelles Wetter
- **Trip Stats** - Distanz, Zeit, Durchschnitt

### Creative & Music Tools
- **Topic Tracker** - Aktuelles Gesprächsthema
- **Question Queue** - Chat-Fragen Warteschlange
- **Now Playing** - Spotify/Last.fm Integration
- **BPM Display** - Beats per Minute
- **Waveform Visualizer** - Audio-Visualisierung

### Community Tools
- **Poll/Voting System** - Chat-basierte Umfragen
- **Leaderboard** - Top Chatter, Subs, Watch Time
- **Chat Commands** - Custom Command System
- **Soundboard** - Sound-Effekte per Klick

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Auth**: NextAuth.js v5 mit Twitch OAuth
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + Gaming/Neon Theme
- **Realtime**: Twitch EventSub + WebSocket
- **Maps**: Leaflet.js (OpenStreetMap)
- **State**: Zustand

## Setup

### Voraussetzungen

- Node.js 18+
- PostgreSQL Datenbank
- Twitch Developer Account

### Twitch App erstellen

1. **Gehe zum Twitch Developer Portal:**
   - Öffne https://dev.twitch.tv/console/apps
   - Melde dich mit deinem Twitch-Account an

2. **Registriere eine neue App:**
   - Klicke auf **"Register Your Application"**
   - Fülle das Formular aus:
     - **Name**: z.B. "Twitch Streamer Tools"
     - **OAuth Redirect URLs**: 
       - Für Development: `http://localhost:3000/api/auth/callback/twitch`
       - Für Production: `https://deine-domain.com/api/auth/callback/twitch`
     - **Category**: Wähle "Website Integration" oder "Application Integration"
   - Klicke auf **"Create"**

3. **Hole deine Credentials:**
   - Nach der Erstellung siehst du deine **Client ID**
   - Klicke auf **"New Secret"** um dein **Client Secret** zu generieren
   - **WICHTIG**: Speichere das Client Secret sofort, es wird nur einmal angezeigt!

4. **Webhook Secret erstellen:**
   - Gehe zu https://dev.twitch.tv/console/webhooks
   - Erstelle einen neuen Webhook oder verwende ein zufälliges Secret
   - Du kannst auch ein zufälliges Secret generieren:
     ```bash
     openssl rand -hex 32
     ```

### Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd twitch
```

2. Dependencies installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
Erstelle eine `.env` Datei:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/twitch_tools?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generiere mit: openssl rand -base64 32

# Twitch OAuth (aus dem Developer Portal)
TWITCH_CLIENT_ID="deine-client-id"
TWITCH_CLIENT_SECRET="dein-client-secret"

# Twitch Webhook
TWITCH_WEBHOOK_SECRET="dein-webhook-secret"  # Generiere mit: openssl rand -hex 32
```

4. Datenbank migrieren:
```bash
npx prisma migrate dev
```

5. Development Server starten:
```bash
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
twitch/
├── prisma/
│   └── schema.prisma          # Datenbankschema
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth Seiten
│   │   ├── (dashboard)/       # Dashboard Seiten
│   │   ├── overlay/           # Public Overlay URLs (für OBS)
│   │   └── api/               # API Routes
│   ├── components/
│   │   ├── ui/                # Basis UI Komponenten
│   │   ├── overlays/          # Overlay Komponenten
│   │   └── layout/            # Layout Komponenten
│   └── lib/
│       ├── auth.ts            # NextAuth Config
│       ├── prisma.ts          # Prisma Client
│       └── twitch.ts          # Twitch API Wrapper
└── app/
    └── globals.css            # Neon/Gaming Theme
```

## OBS Integration

Jedes Overlay hat eine öffentliche URL, die als Browser Source in OBS verwendet werden kann:

```
http://localhost:3000/overlay/[type]/[userId]
```

Beispiele:
- Chat: `/overlay/chat/[userId]`
- Alerts: `/overlay/alerts/[userId]`
- Goals: `/overlay/goals/[userId]`
- Location Map: `/overlay/location/[userId]`

## Entwicklung

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Datenbank Studio
```bash
npx prisma studio
```

## Design System

Das Projekt verwendet **shadcn/ui** mit einem professionellen Gaming/Cyberpunk Theme:

### 🎨 Design Principles
- **Gaming-First Aesthetic**: Cyberpunk/neon design language
- **shadcn/ui Components**: Production-ready, accessible components
- **High Contrast**: Optimal readability during streams
- **Glassmorphism**: Modern, translucent overlays
- **Performance-Driven**: 60fps animations in OBS
- **Accessibility-First**: WCAG 2.1 AA compliant

### 📚 Documentation
- **[shadcn/ui Integration Guide](./SHADCN_UI_GUIDE.md)** - How to use shadcn/ui components
- **[Full Design System Documentation](./DESIGN_SYSTEM.md)** - Complete design standards
- **[Quick Reference Guide](./DESIGN_QUICK_REFERENCE.md)** - Developer cheat sheet
- **[Live Showcase](http://localhost:3000/design-system)** - Interactive component library

### 🎨 Key Features
- **shadcn/ui**: Modern, accessible component library
- **Color System**: Twitch Purple (#9146FF), Neon Cyan, Pink, Green with glow effects
- **Typography**: Orbitron (display), Inter (body), JetBrains Mono (code)
- **Components**: Button, Card, Input, Badge, Progress + more
- **Design Tokens**: Type-safe design token system
- **Responsive**: Mobile-first approach with defined breakpoints
- **Animations**: Hardware-accelerated animations optimized for streaming

### 🚀 Quick Start for Developers

```tsx
// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Use components
<Button variant="default">Primary Action</Button>
<Button variant="glow">With Neon Glow</Button>

<Card glow hover>
  <CardHeader>
    <CardTitle>Stream Goals</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here...</p>
  </CardContent>
</Card>

// Input with icon
<Input 
  label="Search"
  icon={<SearchIcon />}
  placeholder="Search streams..."
/>

// Badges
<Badge variant="purple">Live</Badge>
<Badge variant="success">Online</Badge>
```

### 📋 Before You Start Coding

1. Read the [shadcn/ui Integration Guide](./SHADCN_UI_GUIDE.md)
2. Check the [Quick Reference Guide](./DESIGN_QUICK_REFERENCE.md)
3. Visit `/design-system` to see all available components
4. Use shadcn/ui components for consistency
5. Follow accessibility guidelines

## Architecture

### Component Structure
```
components/
├── ui/                    # Reusable UI primitives
│   ├── Button.tsx        # Primary action component
│   ├── Card.tsx          # Container with glassmorphism
│   ├── Input.tsx         # Form input with validation
│   └── ...
├── overlays/             # Stream overlay components
│   ├── universal/        # Chat, alerts, goals, polls
│   ├── gaming/           # Health bar, kill counter, timer
│   └── irl/              # Map, speed, battery
└── layout/               # Page layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── PageWrapper.tsx
```

### Design Token System
All design values (colors, spacing, typography) are centralized in `src/lib/design-tokens.ts` for consistency and maintainability.

## Performance Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Lighthouse Score**: > 90 for all categories

## Lizenz

MIT
