# Design System - shadcn/ui Integration Guide

> **Version**: 2.0.0 - shadcn/ui Edition  
> **Last Updated**: December 29, 2025  
> **Status**: ✅ Active

---

## 🎯 Overview

Dieses Projekt verwendet **shadcn/ui** - eine Sammlung von wiederverwendbaren Komponenten, die mit Radix UI und Tailwind CSS gebaut wurden. Alle Komponenten sind an unser Gaming/Cyberpunk-Theme angepasst.

---

## 📦 Installierte shadcn/ui Komponenten

### Core Components
- ✅ **Button** - Primary action component with variants
- ✅ **Card** - Container component with glassmorphism
- ✅ **Input** - Form input with icon support
- ✅ **Badge** - Status and category indicators
- ✅ **Progress** - Progress bars with color variants

### Geplante Komponenten
- [ ] Select / Dropdown
- [ ] Dialog / Modal
- [ ] Toast / Notifications
- [ ] Tabs
- [ ] Switch / Toggle
- [ ] Tooltip
- [ ] Popover
- [ ] Sheet / Drawer

---

## 🚀 Quick Start

### 1. Button verwenden

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="glow">With Neon Glow</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With Icons
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Action
</Button>
```

### 2. Card verwenden

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

<Card glow hover>
  <CardHeader>
    <CardTitle>Stream Statistics</CardTitle>
    <CardDescription>Your performance this month</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### 3. Input verwenden

```tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Basic
<Input 
  label="Username"
  placeholder="Enter username"
  type="text"
/>

// With Icon
<Input 
  label="Search"
  placeholder="Search..."
  icon={<Search className="w-4 h-4" />}
/>

// With Error
<Input 
  label="Email"
  type="email"
  error="Invalid email address"
/>
```

### 4. Badge verwenden

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Live</Badge>
<Badge variant="success">Online</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Offline</Badge>
<Badge variant="purple">Featured</Badge>
<Badge variant="cyan">New</Badge>
```

### 5. Progress verwenden

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={75} color="purple" />
<Progress value={50} color="cyan" />
<Progress value={90} color="green" />
<Progress value={30} color="orange" />
```

---

## 🎨 Theme Customization

### Tailwind Config

Unser Gaming-Theme ist in `tailwind.config.ts` definiert:

```typescript
// Primary: Twitch Purple (#9146ff)
// Secondary: Neon Cyan (#00ffff)
// Accent: Neon Pink (#ff00ff)
// Success: Neon Green (#00ff88)
// Warning: Neon Orange (#ff6b00)
```

### CSS Variables

Alle Farben sind als CSS Custom Properties in `globals.css` definiert:

```css
:root {
  --primary: 267 100% 64%;           /* #9146ff */
  --secondary: 180 100% 50%;         /* #00ffff */
  --accent: 300 100% 50%;            /* #ff00ff */
  --background: 222 14% 6%;          /* #0a0a0f */
  --card: 222 14% 10%;               /* #12121a */
  --border: 267 100% 64% / 0.2;      /* Neon purple with opacity */
}
```

---

## 🛠️ Neue Komponenten hinzufügen

### Von shadcn/ui installieren

```bash
npx shadcn@latest add [component-name]
```

Beispiele:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
```

### Manuell anpassen

Alle shadcn/ui Komponenten sind vollständig anpassbar. Nach der Installation:

1. Öffne die Komponente in `src/components/ui/[component].tsx`
2. Passe Styles an (z.B. Glow-Effekte hinzufügen)
3. Erweitere Props nach Bedarf
4. Dokumentiere in diesem Guide

---

## 📐 Layout Patterns mit shadcn/ui

### Dashboard Grid

```tsx
<div className="container mx-auto p-6 space-y-6">
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <Card glow>
      <CardHeader>
        <CardTitle>Stat 1</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">1,234</p>
      </CardContent>
    </Card>
    {/* More stat cards... */}
  </div>
</div>
```

### Form Layout

```tsx
<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardDescription>Update your preferences</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input label="Display Name" />
    <Input label="Email" type="email" />
    <Input label="Password" type="password" />
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

---

## 🎭 Component Variants

### Button Variants

| Variant | Use Case | Example |
|---------|----------|---------|
| `default` | Primary actions | "Start Stream", "Save" |
| `secondary` | Secondary actions | "Cancel", "Skip" |
| `outline` | Neutral actions | "View More", "Info" |
| `ghost` | Subtle actions | Icon buttons, menu items |
| `destructive` | Dangerous actions | "Delete", "Remove" |
| `glow` | Attention-grabbing | "Live Now", "Featured" |

### Badge Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `default` | Purple | Default status |
| `success` | Green | Success, Active, Online |
| `warning` | Orange | Warning, Pending |
| `destructive` | Red | Error, Offline, Failed |
| `purple` | Purple | Featured, Premium |
| `cyan` | Cyan | New, Info |
| `pink` | Pink | Special, Highlight |

---

## 🔄 Migration von alten Komponenten

### Alte Custom Komponenten → shadcn/ui

#### Button Migration

```tsx
// Alt (Custom Component)
import { Button } from '@/components/ui/Button';
<Button variant="primary" size="md" glow>Action</Button>

// Neu (shadcn/ui)
import { Button } from '@/components/ui/button';
<Button variant="glow" size="default">Action</Button>
```

#### Card Migration

```tsx
// Alt
import { Card } from '@/components/ui/Card';
<Card glow hover>Content</Card>

// Neu (shadcn/ui)
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
<Card glow hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## ♿ Accessibility

shadcn/ui Komponenten sind standardmäßig accessible:

- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ High contrast mode

### Best Practices

```tsx
// Labels für Inputs
<Input label="Username" id="username" />

// ARIA für Icon-Buttons
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Descriptive Button Text
<Button>Save Changes</Button> // ✅ Good
<Button>Submit</Button>       // ❌ Too generic
```

---

## 🎨 Styling Guide

### Utility Classes

```tsx
// Spacing
<div className="space-y-4">        // Vertical gap
<div className="space-x-4">        // Horizontal gap

// Layout
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">

// Typography
<h1 className="font-display text-4xl font-bold">
<p className="text-muted-foreground">

// Colors
<div className="text-primary">     // Twitch purple text
<div className="bg-secondary">     // Neon cyan background
<div className="border-accent">    // Neon pink border
```

### Custom Glow Effects

```tsx
// Card mit Glow
<Card glow className="shadow-glow-purple">

// Button mit Animation
<Button variant="glow" className="animate-glow-pulse">

// Custom Glow Color
<div className="shadow-[0_0_20px_rgba(0,255,255,0.5)]">
```

---

## 📱 Responsive Design

shadcn/ui Komponenten sind responsive by default:

```tsx
<div className="
  grid 
  grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-4        /* Desktop: 4 columns */
  gap-4
">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
  <Card>Card 4</Card>
</div>
```

---

## 🔧 Troubleshooting

### Problem: Komponenten werden nicht richtig gestyled

**Lösung**: Stelle sicher, dass `globals.css` korrekt importiert ist in `app/layout.tsx`:

```tsx
import './globals.css';
```

### Problem: Glow-Effekte funktionieren nicht

**Lösung**: Prüfe, ob die Animation in `tailwind.config.ts` definiert ist:

```typescript
animation: {
  'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
}
```

### Problem: Dark Mode funktioniert nicht

**Lösung**: Gaming-Theme ist standardmäßig dark. Kein Light Mode nötig.

---

## 📚 Ressourcen

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Radix UI Docs**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

---

## 🎯 Next Steps

1. ✅ Core Components installiert
2. ✅ Gaming Theme angepasst
3. ✅ Showcase Page erstellt
4. 🔄 Weitere Komponenten nach Bedarf hinzufügen
5. 🔄 Alte Custom Components migrieren

---

**Maintainer**: Development Team  
**Last Review**: December 29, 2025  
**Next Review**: January 29, 2026

