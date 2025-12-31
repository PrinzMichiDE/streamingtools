# Professional Design & Frontend Standards
## Twitch Overlay Platform Design System

> **Version**: 1.0.0  
> **Last Updated**: December 29, 2025  
> **Status**: Active

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animation & Motion](#animation--motion)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Dark Mode](#dark-mode)
10. [Performance](#performance)
11. [Code Standards](#code-standards)

---

## Design Philosophy

### Core Principles

1. **Gaming-First Aesthetic**
   - Cyberpunk/neon design language reflecting streaming culture
   - High-contrast UI for readability during streams
   - Glassmorphism for modern, translucent overlays

2. **Performance-Driven**
   - Optimized for 60fps animations in OBS overlays
   - Minimal reflows and repaints
   - Lazy loading for dashboard components

3. **Accessibility-First**
   - WCAG 2.1 AA compliance minimum
   - Keyboard navigation for all interactive elements
   - Screen reader optimized

4. **Consistency**
   - Unified component library across dashboard and overlays
   - Predictable interactions and feedback
   - Systematic design tokens

---

## Color System

### Brand Colors

```typescript
// Primary Brand Colors
const colors = {
  brand: {
    primary: '#9146FF',      // Twitch Purple
    secondary: '#00FFFF',    // Neon Cyan
    accent: '#FF00FF',       // Neon Pink
  }
}
```

### Semantic Colors

```css
/* Background Layers */
--bg-primary: #0a0a0f;           /* Base background */
--bg-secondary: #12121a;         /* Elevated surfaces */
--bg-card: rgba(18, 18, 26, 0.8); /* Card backgrounds */
--bg-card-hover: rgba(18, 18, 26, 0.95); /* Hover state */

/* Neon Accent Colors */
--neon-purple: #9146ff;          /* Primary actions */
--neon-cyan: #00ffff;            /* Secondary actions */
--neon-pink: #ff00ff;            /* Alerts/highlights */
--neon-green: #00ff88;           /* Success states */
--neon-orange: #ff6b00;          /* Warning states */
--neon-yellow: #ffff00;          /* Attention */

/* Text Colors */
--text-primary: #ffffff;         /* Primary text */
--text-secondary: #a0a0b0;       /* Secondary text */
--text-muted: #606070;           /* Tertiary text */
```

### Color Usage Guidelines

| Use Case | Color | Usage |
|----------|-------|-------|
| Primary CTA | `neon-purple` | Main actions, links, focus states |
| Secondary Actions | `neon-cyan` | Secondary buttons, accents |
| Success | `neon-green` | Success messages, confirmations |
| Warning | `neon-orange` | Warning states, caution |
| Error | `red-600` | Error states, destructive actions |
| Info | `neon-cyan` | Informational messages |

### Contrast Requirements

- **Text on dark backgrounds**: Minimum 7:1 (AAA)
- **UI components**: Minimum 4.5:1 (AA)
- **Large text (18pt+)**: Minimum 3:1

---

## Typography

### Font Stack

```typescript
// Font Families
const fonts = {
  display: "'Orbitron', sans-serif",     // Headings, UI elements
  body: "'Inter', sans-serif",           // Body text, descriptions
  mono: "'JetBrains Mono', monospace",   // Code, technical data
}
```

### Font Import

Add to `app/layout.tsx`:

```typescript
import { Inter, Orbitron } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});
```

### Type Scale

```css
/* Display (Headings) */
.text-display-xl { font-size: 3.75rem; line-height: 1.2; } /* 60px */
.text-display-lg { font-size: 3rem; line-height: 1.2; }    /* 48px */
.text-display-md { font-size: 2.25rem; line-height: 1.3; } /* 36px */
.text-display-sm { font-size: 1.875rem; line-height: 1.3; }/* 30px */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.6; }        /* 18px */
.text-base { font-size: 1rem; line-height: 1.6; }          /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.5; }        /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1.5; }         /* 12px */
```

### Typography Usage

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Page Title | Orbitron | 48px | 700 | 1.2 |
| Section Header | Orbitron | 36px | 600 | 1.3 |
| Card Title | Orbitron | 24px | 600 | 1.3 |
| Body Text | Inter | 16px | 400 | 1.6 |
| Button Text | Orbitron | 16px | 600 | 1.4 |
| Caption | Inter | 14px | 400 | 1.5 |

---

## Spacing & Layout

### Spacing Scale (4px base)

```typescript
const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
}
```

### Layout Grid

- **Container Max Width**: `1400px`
- **Grid Columns**: 12 columns
- **Gutter**: `24px` (desktop), `16px` (mobile)
- **Side Margins**: `24px` (desktop), `16px` (mobile)

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Component Spacing Rules

1. **Cards**: 
   - Padding: `24px` (desktop), `16px` (mobile)
   - Gap between cards: `24px`
   
2. **Sections**:
   - Margin bottom: `48px` (desktop), `32px` (mobile)
   - Padding top/bottom: `64px` (desktop), `40px` (mobile)

3. **Form Elements**:
   - Gap between inputs: `16px`
   - Label to input: `8px`

---

## Components

### Component Hierarchy

```
UI Components (atoms)
├── Button
├── Input
├── Card
├── Badge
├── Toggle
├── Slider
├── ProgressBar
└── Modal

Layout Components (molecules)
├── Header
├── Sidebar
├── PageWrapper
└── Container

Feature Components (organisms)
├── Overlays
│   ├── Universal (chat, goals, polls)
│   ├── Gaming (health, kills, timer)
│   └── IRL (map, speed, battery)
└── Dashboard Widgets
```

### Button Component

**Variants**: `primary`, `secondary`, `ghost`, `danger`

```typescript
<Button variant="primary" size="md" glow>
  Start Stream
</Button>
```

**States**:
- Default
- Hover (scale: 1.02, glow intensity +20%)
- Active (scale: 0.98)
- Disabled (opacity: 0.5)
- Loading (spinner icon)

**Sizing**:
- `sm`: 32px height, 12px horizontal padding
- `md`: 40px height, 16px horizontal padding
- `lg`: 48px height, 24px horizontal padding

### Card Component

```typescript
<Card glow hover>
  <CardHeader>
    <CardTitle>Stream Goals</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Properties**:
- `glow`: Adds neon glow effect
- `hover`: Animated hover effect
- Background: Glassmorphism (blur + transparency)

### Input Component

```typescript
<Input 
  label="API Key"
  type="text"
  placeholder="sk_xxxxxxxxxxxxx"
  error="Invalid API key"
  icon={<KeyIcon />}
/>
```

**States**:
- Default (border: `neon-purple/20`)
- Focus (border: `neon-purple`, glow effect)
- Error (border: `red-600`, error text below)
- Disabled (opacity: 0.5)

### Modal Component

```typescript
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Create New Overlay"
  size="lg"
>
  {/* Content */}
</Modal>
```

**Features**:
- Backdrop blur + dark overlay
- Smooth fade-in animation (200ms)
- Keyboard support (Escape to close)
- Focus trap
- Scroll lock

---

## Animation & Motion

### Animation Principles

1. **Purposeful**: Every animation serves a function
2. **Fast**: Duration 150-300ms for UI transitions
3. **Smooth**: Use easing functions (not linear)
4. **Performance**: Use `transform` and `opacity` only

### Standard Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Glow Pulse */
@keyframes glowPulse {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(145, 70, 255, 0.5); 
  }
  50% { 
    box-shadow: 0 0 40px rgba(145, 70, 255, 0.8); 
  }
}

/* Scale In */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}
```

### Timing Functions

```typescript
const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
}
```

### Animation Durations

| Interaction | Duration | Usage |
|-------------|----------|-------|
| Micro | 100ms | Hover states, toggles |
| Fast | 200ms | Dropdowns, tooltips |
| Standard | 300ms | Modals, drawers |
| Slow | 500ms | Page transitions |
| Overlay Alerts | 5000ms | Stream alerts |

### Performance Guidelines

```typescript
// ✅ Good - Hardware accelerated
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

// ❌ Bad - Causes reflow
.element {
  left: 100px;
  visibility: hidden;
}
```

### Overlay-Specific Animations

For OBS overlays, use:
- `will-change: transform, opacity` on animated elements
- RequestAnimationFrame for smooth updates
- CSS transitions over JavaScript animation libraries
- Max 60fps target

---

## Accessibility

### WCAG 2.1 AA Compliance

#### 1. Color Contrast

✅ **Text Contrast Ratios**:
- Normal text (16px): 7:1 (AAA)
- Large text (18px+): 4.5:1 (AA)
- UI components: 3:1

#### 2. Keyboard Navigation

**Tab Order**: Logical, left-to-right, top-to-bottom

```typescript
// All interactive elements must be focusable
<button 
  className="focus:outline-2 focus:outline-neon-purple focus:outline-offset-2"
  aria-label="Close modal"
>
```

**Keyboard Shortcuts**:
- `Escape`: Close modals/dropdowns
- `Enter`: Submit forms, activate buttons
- `Space`: Toggle checkboxes, activate buttons
- `Arrow keys`: Navigate lists, sliders

#### 3. Screen Reader Support

```typescript
// ✅ Good
<button aria-label="Delete goal">
  <TrashIcon aria-hidden="true" />
</button>

// ✅ Good - Status announcements
<div role="status" aria-live="polite">
  Goal updated successfully
</div>

// ✅ Good - Form labels
<label htmlFor="username">Username</label>
<input id="username" name="username" />
```

#### 4. Focus Management

```typescript
// Trap focus in modals
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ children }) {
  const modalRef = useFocusTrap();
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

#### 5. Touch Targets

**Minimum Size**: 44x44px for all interactive elements

```typescript
// ✅ Good
<button className="min-w-[44px] min-h-[44px]">
  <Icon />
</button>

// ❌ Bad
<button className="w-8 h-8"> {/* 32x32px - too small */}
  <Icon />
</button>
```

### Accessibility Checklist

- [ ] All images have meaningful `alt` text
- [ ] Forms have associated `<label>` elements
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Color is not the only means of conveying information
- [ ] Focus indicators are visible (2px outline)
- [ ] Page has logical heading hierarchy (h1 → h2 → h3)
- [ ] Skip to main content link available
- [ ] Error messages are announced to screen readers
- [ ] Modals trap focus and restore on close
- [ ] ARIA landmarks used (`main`, `nav`, `aside`)

---

## Responsive Design

### Mobile-First Approach

```typescript
// Start with mobile styles, enhance for larger screens
<div className="
  px-4 py-8              /* Mobile */
  md:px-6 md:py-12       /* Tablet */
  lg:px-8 lg:py-16       /* Desktop */
">
```

### Breakpoint Strategy

| Device | Breakpoint | Container | Columns | Gutter |
|--------|------------|-----------|---------|--------|
| Mobile | < 640px | 100% | 1-2 | 16px |
| Tablet | 640-1023px | 100% | 2-4 | 20px |
| Desktop | 1024-1279px | 1024px | 3-6 | 24px |
| Large | 1280px+ | 1280px | 4-12 | 24px |

### Responsive Component Behavior

#### Navigation
- **Mobile**: Hamburger menu, drawer
- **Tablet**: Collapsed sidebar, toggle button
- **Desktop**: Expanded sidebar, always visible

#### Cards/Grid
- **Mobile**: 1 column, full width
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

#### Typography
- **Mobile**: Base size 14px, headings -20%
- **Tablet**: Base size 15px, headings -10%
- **Desktop**: Base size 16px, headings 100%

### Touch Optimization

```typescript
// Larger touch targets on mobile
<button className="
  min-h-[44px] min-w-[44px]     /* Mobile - WCAG compliant */
  lg:min-h-[40px] lg:min-w-[40px] /* Desktop - can be smaller */
">
```

---

## Dark Mode

### Implementation

This application uses **dark mode only** for the gaming/streaming aesthetic.

If light mode is needed in the future:

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#ffffff',
          text: '#000000',
        }
      }
    }
  }
}
```

### Current Dark Theme

- **Background**: Deep blacks (#0a0a0f, #12121a)
- **Text**: Pure white (#ffffff) for maximum contrast
- **Accents**: Neon colors with glow effects
- **Surfaces**: Glassmorphism with subtle borders

---

## Performance

### Core Web Vitals Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | TBD |
| FID (First Input Delay) | < 100ms | TBD |
| CLS (Cumulative Layout Shift) | < 0.1 | TBD |
| FCP (First Contentful Paint) | < 1.8s | TBD |
| TTI (Time to Interactive) | < 3.8s | TBD |

### Optimization Strategies

#### 1. Images

```typescript
// ✅ Always use next/image
import Image from 'next/image';

<Image 
  src="/overlay-preview.png"
  alt="Overlay preview"
  width={1200}
  height={630}
  priority={isAboveFold}
  placeholder="blur"
  quality={85}
/>
```

#### 2. Fonts

```typescript
// ✅ Preload fonts with next/font
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevents FOIT (Flash of Invisible Text)
});
```

#### 3. Code Splitting

```typescript
// ✅ Lazy load heavy components
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only if needed
});
```

#### 4. Server Components

```typescript
// ✅ Default to Server Components
export default async function DashboardPage() {
  const data = await fetchData(); // Server-side
  return <DashboardView data={data} />;
}

// Only use 'use client' when needed
'use client';
export function InteractiveWidget() {
  const [state, setState] = useState();
  // ...
}
```

#### 5. Caching

```typescript
// ✅ Cache database queries
import { unstable_cache } from 'next/cache';

const getCachedGoals = unstable_cache(
  async (userId: string) => {
    return prisma.goal.findMany({ where: { userId } });
  },
  ['user-goals'],
  { revalidate: 60, tags: ['goals'] }
);
```

### Performance Budget

| Asset Type | Max Size | Notes |
|------------|----------|-------|
| Initial JS Bundle | 200 KB | Gzipped |
| CSS Bundle | 50 KB | Gzipped |
| Images (per page) | 500 KB | Total |
| Fonts | 100 KB | WOFF2 format |

---

## Code Standards

### Component Structure

```typescript
/**
 * Component description
 * 
 * @component
 * @example
 * <AlertAnimation type="follower" username="JohnDoe" />
 */

'use client'; // Only if needed

import React from 'react';
import { cn } from '@/lib/utils';

interface AlertAnimationProps {
  /** Type of alert */
  type: 'follower' | 'subscriber' | 'donation';
  /** Username triggering alert */
  username: string;
  /** Optional custom message */
  message?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

export function AlertAnimation({
  type,
  username,
  message,
  onComplete
}: AlertAnimationProps) {
  // Hooks at the top
  const [isVisible, setIsVisible] = React.useState(false);
  
  // Effects
  React.useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };
  
  // Early returns for guard clauses
  if (!username) return null;
  
  // Render
  return (
    <div className={cn(
      'alert-container',
      isVisible && 'visible'
    )}>
      {/* Component content */}
    </div>
  );
}

// Display name for debugging
AlertAnimation.displayName = 'AlertAnimation';
```

### Styling Conventions

```typescript
// ✅ Good - Tailwind classes
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-bg-card border border-neon-purple/20
  rounded-lg
  hover:border-neon-purple/50
  transition-colors duration-300
">

// ✅ Good - Use cn() for conditional classes
import { cn } from '@/lib/utils';

<button className={cn(
  'base-button-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)}>

// ❌ Bad - Inline styles (avoid)
<div style={{ color: 'red', marginTop: '10px' }}>
```

### File Organization

```
src/components/overlays/universal/
├── AlertAnimation/
│   ├── AlertAnimation.tsx       # Main component
│   ├── AlertAnimation.test.tsx  # Tests
│   ├── AlertAnimation.stories.tsx # Storybook
│   ├── types.ts                 # Type definitions
│   └── index.ts                 # Barrel export
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `AlertAnimation.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Hooks | camelCase + 'use' prefix | `useAuth.ts` |
| Types | PascalCase | `UserProfile` |

---

## Design Tokens Export

```typescript
// design-tokens.ts
export const designTokens = {
  colors: {
    brand: {
      primary: '#9146FF',
      secondary: '#00FFFF',
      accent: '#FF00FF',
    },
    neon: {
      purple: '#9146FF',
      cyan: '#00FFFF',
      pink: '#FF00FF',
      green: '#00FF88',
      orange: '#FF6B00',
      yellow: '#FFFF00',
    },
    background: {
      primary: '#0A0A0F',
      secondary: '#12121A',
      card: 'rgba(18, 18, 26, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0B0',
      muted: '#606070',
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    glowPurple: '0 0 20px rgba(145, 70, 255, 0.5)',
    glowCyan: '0 0 20px rgba(0, 255, 255, 0.5)',
    glowPink: '0 0 20px rgba(255, 0, 255, 0.5)',
  },
  
  typography: {
    fontFamily: {
      display: "'Orbitron', sans-serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.6,
    }
  },
  
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  }
} as const;
```

---

## Component Examples

### Complete Button Example

```typescript
// components/ui/Button/Button.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    glow = false,
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      font-display font-semibold rounded-lg 
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
      inline-flex items-center justify-center gap-2
      focus:outline-2 focus:outline-neon-purple focus:outline-offset-2
    `;
    
    const variants = {
      primary: `
        bg-neon-purple text-white 
        hover:bg-[#a855f5] 
        border border-neon-purple
        hover:scale-[1.02] active:scale-[0.98]
      `,
      secondary: `
        bg-bg-secondary text-text-primary 
        hover:bg-bg-card 
        border border-neon-purple/50
        hover:border-neon-purple
      `,
      ghost: `
        bg-transparent text-text-primary 
        hover:bg-bg-secondary 
        border border-transparent
      `,
      danger: `
        bg-red-600 text-white 
        hover:bg-red-700 
        border border-red-600
      `,
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    };
    
    const glowClass = glow && variant === 'primary' 
      ? 'animate-[glow-pulse_2s_ease-in-out_infinite]' 
      : '';
    
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowClass,
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="inline-flex">{icon}</span>
            )}
            <span className="relative z-10">{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="inline-flex">{icon}</span>
            )}
          </>
        )}
        
        {variant === 'primary' && (
          <span className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 hover:opacity-20 transition-opacity duration-300" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

## Testing Components

### Visual Testing Checklist

For each component, test:
- [ ] Default state
- [ ] All variants
- [ ] All sizes
- [ ] Hover state
- [ ] Focus state (keyboard)
- [ ] Active/pressed state
- [ ] Disabled state
- [ ] Loading state (if applicable)
- [ ] Error state (if applicable)
- [ ] Mobile viewport
- [ ] Tablet viewport
- [ ] Desktop viewport
- [ ] High contrast mode
- [ ] With/without icons
- [ ] Long text overflow
- [ ] RTL languages (if applicable)

---

## Changelog

### Version 1.0.0 (December 29, 2025)
- Initial design system documentation
- Established color palette and typography
- Defined component library structure
- Created accessibility guidelines
- Set performance targets

---

## Resources

### Design Tools
- **Figma**: [Design File Link]
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Development Tools
- **Tailwind CSS**: https://tailwindcss.com
- **Next.js**: https://nextjs.org
- **Radix UI**: https://www.radix-ui.com
- **Lucide Icons**: https://lucide.dev

### Inspiration
- Twitch UI/UX patterns
- Cyberpunk 2077 interface design
- Modern gaming dashboards (Overwolf, Streamlabs)

---

## Maintenance

This design system should be reviewed and updated:
- **Monthly**: Check for outdated patterns
- **Quarterly**: Review accessibility compliance
- **After major features**: Update component library
- **Annually**: Full design system audit

**Maintainers**: Development Team  
**Last Review**: December 29, 2025  
**Next Review**: January 29, 2026

