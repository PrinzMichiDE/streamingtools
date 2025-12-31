# Design System Quick Reference Guide

> **Quick start guide for developers** - Keep this handy while building components!

---

## 🎨 Colors

### Usage in Code

```tsx
// Tailwind classes
<div className="bg-neon-purple text-white">
<div className="text-neon-cyan border-neon-pink">

// Design tokens
import { designTokens, getColor } from '@/lib/design-tokens';
const purple = getColor('neon', 'purple'); // '#9146FF'
```

### Color Reference

| Use Case | Class | Hex |
|----------|-------|-----|
| Primary Action | `bg-neon-purple` | `#9146FF` |
| Secondary Action | `bg-neon-cyan` | `#00FFFF` |
| Success | `text-neon-green` | `#00FF88` |
| Warning | `text-neon-orange` | `#FF6B00` |
| Error | `text-red-600` | `#EF4444` |
| Background | `bg-bg-primary` | `#0A0A0F` |
| Card | `bg-bg-card` | `rgba(18,18,26,0.8)` |
| Text Primary | `text-text-primary` | `#FFFFFF` |
| Text Secondary | `text-text-secondary` | `#A0A0B0` |

---

## 📝 Typography

### Font Families

```tsx
// In component
<h1 className="font-display">Heading</h1>  // Orbitron
<p className="font-body">Body text</p>     // Inter
<code className="font-mono">Code</code>    // JetBrains Mono
```

### Font Sizes

```tsx
<h1 className="text-display-xl">Hero Title</h1>      // 60px
<h2 className="text-display-lg">Page Title</h2>      // 48px
<h3 className="text-display-md">Section Title</h3>   // 36px
<p className="text-lg">Large text</p>                // 18px
<p className="text-base">Body text</p>               // 16px
<p className="text-sm">Small text</p>                // 14px
<span className="text-xs">Caption</span>             // 12px
```

### Responsive Typography

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

---

## 🔲 Spacing

### Scale (4px base)

```
px-1  = 4px    px-4  = 16px   px-8  = 32px   px-16 = 64px
px-2  = 8px    px-5  = 20px   px-10 = 40px   px-20 = 80px
px-3  = 12px   px-6  = 24px   px-12 = 48px   px-24 = 96px
```

### Common Patterns

```tsx
// Card padding
<Card className="p-6">                    // 24px all sides
<Card className="p-4 md:p-6">           // Responsive

// Section spacing
<section className="space-y-8">         // 32px vertical gap
<section className="mb-12">             // 48px bottom margin

// Form spacing
<div className="space-y-4">             // 16px gap between inputs
```

---

## 🧩 Components

### Button

```tsx
import { Button } from '@/components/ui/Button';

// Basic
<Button variant="primary" size="md">Click me</Button>

// With icon
<Button 
  variant="primary" 
  icon={<Icon />} 
  iconPosition="left"
>
  Action
</Button>

// States
<Button glow>Glowing Button</Button>
<Button loading>Processing...</Button>
<Button disabled>Disabled</Button>
```

**Variants**: `primary` | `secondary` | `ghost` | `danger`  
**Sizes**: `sm` | `md` | `lg`

### Card

```tsx
import { Card } from '@/components/ui/Card';

// Basic
<Card>Content</Card>

// With effects
<Card glow hover>Interactive Card</Card>

// Custom styling
<Card className="p-8 bg-bg-secondary">
  Custom Card
</Card>
```

### Input

```tsx
import { Input } from '@/components/ui/Input';

<Input 
  label="Username"
  type="text"
  placeholder="Enter username"
  error="This field is required"
  icon={<SearchIcon />}
/>
```

### Badge

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
```

**Variants**: `default` | `success` | `warning` | `danger` | `info` | `purple` | `cyan` | `pink`

---

## ✨ Effects

### Glassmorphism

```tsx
// Utility class
<div className="glass">Content</div>

// Manual
<div className="bg-bg-card backdrop-blur-md border border-neon-purple/20">
```

### Glow Effects

```tsx
// Classes
<div className="shadow-glow-purple">Glowing box</div>
<h1 className="text-glow-purple">Glowing text</h1>

// Animation
<div className="animate-glow-pulse">Pulsing glow</div>

// Helper function
import { getGlowEffect } from '@/lib/design-tokens';
<div style={getGlowEffect('purple', 0.8)}>Custom glow</div>
```

### Animations

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Scale in
<div className="animate-scale-in">Content</div>

// Glow pulse
<div className="animate-glow-pulse">Content</div>
```

---

## 📱 Responsive Design

### Breakpoints

```
sm:  640px   (Mobile landscape)
md:  768px   (Tablet)
lg:  1024px  (Desktop)
xl:  1280px  (Large desktop)
2xl: 1536px  (Extra large)
```

### Usage

```tsx
// Mobile-first
<div className="
  px-4 py-8              /* Mobile */
  md:px-6 md:py-12       /* Tablet */
  lg:px-8 lg:py-16       /* Desktop */
">

// Grid
<div className="
  grid 
  grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-4        /* Desktop: 4 columns */
  gap-4
">

// Hide/show
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

---

## ♿ Accessibility

### Focus States

```tsx
// Automatic focus ring (included in Button component)
<button className="
  focus:outline-2 
  focus:outline-neon-purple 
  focus:outline-offset-2
">

// Helper function
import { getFocusRing } from '@/lib/design-tokens';
<button className={getFocusRing('purple')}>
```

### ARIA Labels

```tsx
// Icon-only buttons
<button aria-label="Close modal">
  <X aria-hidden="true" />
</button>

// Form labels
<label htmlFor="email">Email</label>
<input id="email" name="email" />

// Status messages
<div role="status" aria-live="polite">
  Changes saved successfully
</div>
```

### Touch Targets

```tsx
// Minimum 44x44px
<button className="min-w-[44px] min-h-[44px]">
  <Icon />
</button>
```

---

## 🎭 Layout Patterns

### Container

```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Section Spacing

```tsx
<section className="py-12 md:py-16 lg:py-20">
  <h2 className="text-display-md mb-8">Section Title</h2>
  {/* Content */}
</section>
```

### Grid Layouts

```tsx
// Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Dashboard layout
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-3">{/* Main content */}</div>
  <aside>{/* Sidebar */}</aside>
</div>
```

### Flexbox

```tsx
// Horizontal layout
<div className="flex items-center justify-between gap-4">
  <h2>Title</h2>
  <Button>Action</Button>
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## 🚀 Performance Tips

### Images

```tsx
import Image from 'next/image';

<Image 
  src="/image.png"
  alt="Description"
  width={1200}
  height={630}
  priority          // For above-the-fold images
  placeholder="blur"
  quality={85}
/>
```

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Server Components (Default)

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}

// Client Component (only when needed)
'use client';
export function InteractiveWidget() {
  const [state, setState] = useState();
  // ...
}
```

---

## 🛠️ Utility Functions

### Class Names

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}>
```

### Design Tokens

```tsx
import { 
  designTokens,
  getColor,
  getSpacing,
  getGlowEffect,
  getGlassmorphism,
  getFocusRing,
  getAnimation
} from '@/lib/design-tokens';

// Get color
const purple = getColor('neon', 'purple');

// Get spacing
const padding = getSpacing('md'); // '16px'

// Glow effect
<div style={getGlowEffect('cyan', 0.7)}>

// Glassmorphism
<div className={getGlassmorphism('lg', 0.6)}>

// Focus ring
<button className={getFocusRing('purple')}>

// Animation
<div className={getAnimation('fade-in', 'slow')}>
```

---

## 📋 Checklist for New Components

Before committing a new component:

- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] Follows design system colors
- [ ] Uses design tokens (not hardcoded values)
- [ ] Responsive (mobile-first)
- [ ] Accessible (WCAG AA)
  - [ ] Keyboard navigation
  - [ ] Focus indicators
  - [ ] ARIA labels
  - [ ] Min 44x44px touch targets
- [ ] Loading state (if applicable)
- [ ] Error state (if applicable)
- [ ] Disabled state (if applicable)
- [ ] Uses `cn()` for conditional classes
- [ ] Performance optimized (Server Component if possible)

---

## 🐛 Common Mistakes to Avoid

### ❌ Don't

```tsx
// Hardcoded colors
<div style={{ color: '#9146FF' }}>

// Inline styles for layout
<div style={{ marginTop: '20px' }}>

// Non-semantic HTML
<div onClick={handler}>Click me</div>

// Missing alt text
<img src="/image.png" />

// Linear easing
transition: all 0.3s linear;

// Left property (causes reflow)
.element { left: 100px; }
```

### ✅ Do

```tsx
// Design system colors
<div className="text-neon-purple">

// Tailwind utilities
<div className="mt-5">

// Semantic HTML
<button onClick={handler}>Click me</button>

// Descriptive alt text
<Image src="/image.png" alt="Stream overlay preview" />

// Proper easing
transition: all 0.3s ease-in-out;

// Transform (hardware accelerated)
.element { transform: translateX(100px); }
```

---

## 📚 Resources

- **Full Documentation**: `/DESIGN_SYSTEM.md`
- **Live Showcase**: `/design-system` (in dashboard)
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## 💡 Pro Tips

1. **Use the showcase page** (`/design-system`) to preview components before using them
2. **Import design tokens** instead of copying values
3. **Test on mobile first**, then enhance for desktop
4. **Use semantic HTML** (`<button>`, `<nav>`, `<main>`, etc.)
5. **Leverage Server Components** for better performance
6. **Add loading states** to all async operations
7. **Use `cn()` utility** for conditional classes
8. **Follow the 8px grid** for spacing consistency

---

**Last Updated**: December 29, 2025  
**Maintainer**: Development Team  
**Questions?** Check `/DESIGN_SYSTEM.md` for detailed docs

