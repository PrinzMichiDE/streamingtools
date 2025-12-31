# Visual Style Guide

> **Quick visual reference for the Twitch Overlay Platform design system**

---

## 🎨 Color Usage Examples

### Primary Actions
```
Background: #9146FF (Twitch Purple)
Text: #FFFFFF (White)
Border: #9146FF
Glow: 0 0 20px rgba(145, 70, 255, 0.5)

Use for:
✓ Primary buttons
✓ Links
✓ Active states
✓ Key information
```

### Secondary Actions
```
Background: #12121A (Dark Gray)
Text: #FFFFFF (White)
Border: rgba(145, 70, 255, 0.5)
Hover: #00FFFF (Cyan border)

Use for:
✓ Secondary buttons
✓ Filters
✓ Toggles
✓ Less important actions
```

### Success States
```
Color: #00FF88 (Neon Green)
Use for:
✓ Success messages
✓ Positive metrics (+12%)
✓ Completed goals
✓ Online status
```

### Warning States
```
Color: #FF6B00 (Neon Orange)
Use for:
✓ Warnings
✓ Pending actions
✓ Caution messages
✓ Moderate issues
```

### Error States
```
Color: #EF4444 (Red)
Use for:
✓ Errors
✓ Failed actions
✓ Critical alerts
✓ Destructive actions
```

### Information
```
Color: #00FFFF (Neon Cyan)
Use for:
✓ Info messages
✓ Neutral alerts
✓ Tips
✓ Secondary highlights
```

---

## 📝 Typography Hierarchy

### Page Title (Hero)
```
Font: Orbitron
Size: 60px / 3.75rem
Weight: 700 (Bold)
Line Height: 1.2
Color: #9146FF (with glow)

Example: "Twitch Overlay Dashboard"
```

### Section Header
```
Font: Orbitron
Size: 48px / 3rem
Weight: 700 (Bold)
Line Height: 1.2
Color: #FFFFFF or #00FFFF

Example: "Stream Statistics"
```

### Card Title
```
Font: Orbitron
Size: 24px / 1.5rem
Weight: 600 (Semibold)
Line Height: 1.3
Color: #FFFFFF

Example: "Follower Goal Progress"
```

### Body Text (Standard)
```
Font: Inter
Size: 16px / 1rem
Weight: 400 (Regular)
Line Height: 1.6
Color: #A0A0B0

Example: "Track your stream goals with real-time updates and customizable overlays."
```

### Caption / Helper Text
```
Font: Inter
Size: 14px / 0.875rem
Weight: 400 (Regular)
Line Height: 1.5
Color: #606070

Example: "Last updated 5 minutes ago"
```

### Code / Technical
```
Font: JetBrains Mono
Size: 16px / 1rem
Weight: 400 (Regular)
Color: #00FF88
Background: #12121A

Example: sk_1234567890abcdef
```

---

## 📐 Spacing Examples

### Component Spacing

#### Compact (List Items, Chips)
```
Padding: 8px (top/bottom) × 12px (left/right)
Gap: 8px between items

Use for:
- Badge lists
- Tag clouds
- Compact tables
```

#### Standard (Buttons, Inputs)
```
Padding: 12px (top/bottom) × 16px (left/right)
Gap: 16px between items

Use for:
- Form elements
- Standard buttons
- List items
```

#### Comfortable (Cards, Sections)
```
Padding: 24px (all sides)
Gap: 24px between items

Use for:
- Card content
- Section spacing
- Modal content
```

#### Spacious (Hero Sections)
```
Padding: 64px (top/bottom) × 32px (left/right)
Gap: 48px between sections

Use for:
- Hero sections
- Major page divisions
- Landing pages
```

### Layout Grid

```
Container: max-width 1400px, centered
Gutter: 24px (desktop), 16px (mobile)
Columns: 12 columns
Margin: 24px (desktop), 16px (mobile)
```

---

## 🎭 Component States

### Button States

#### Default
```
Background: #9146FF
Text: #FFFFFF
Border: 1px solid #9146FF
Scale: 1.0
Cursor: pointer
```

#### Hover
```
Background: #A855F5 (lighter)
Gradient overlay: 20% opacity
Scale: 1.02
Border glow: Increased
Transition: 200ms ease-in-out
```

#### Focus (Keyboard)
```
Outline: 2px solid #9146FF
Outline offset: 2px
No other changes
```

#### Active (Pressed)
```
Scale: 0.98
Background: #9146FF (unchanged)
Duration: 100ms
```

#### Disabled
```
Opacity: 0.5
Cursor: not-allowed
No hover effects
Background: #9146FF (dimmed)
```

#### Loading
```
Icon: Spinning loader
Text: Optional "Loading..."
Disabled: true
Animation: Rotate 360° in 1s
```

### Card States

#### Default
```
Background: rgba(18, 18, 26, 0.8)
Backdrop filter: blur(10px)
Border: 1px solid rgba(145, 70, 255, 0.2)
Shadow: None
```

#### Hover (if enabled)
```
Border: 1px solid rgba(145, 70, 255, 0.5)
Shadow: 0 0 30px rgba(145, 70, 255, 0.4)
Transition: 300ms ease-in-out
Transform: None (no lift)
```

#### Glow (emphasis)
```
Border: 1px solid rgba(145, 70, 255, 0.4)
Shadow: 0 0 20px rgba(145, 70, 255, 0.3)
Animation: Pulse (2s infinite)
```

### Input States

#### Default
```
Background: #12121A
Text: #FFFFFF
Border: 1px solid rgba(145, 70, 255, 0.2)
Placeholder: #606070
```

#### Focus
```
Border: 1px solid #9146FF
Shadow: 0 0 0 3px rgba(145, 70, 255, 0.2)
Outline: None
Caret: #9146FF
```

#### Error
```
Border: 1px solid #EF4444
Shadow: 0 0 0 3px rgba(239, 68, 68, 0.2)
Text below: #EF4444 (error message)
```

#### Disabled
```
Opacity: 0.5
Cursor: not-allowed
Background: #0A0A0F (darker)
```

---

## 💫 Animation Examples

### Fade In
```css
Duration: 200ms
Easing: ease-out
From: opacity 0
To: opacity 1

Use for:
- Modal overlays
- Tooltips
- Notifications
```

### Slide Up
```css
Duration: 300ms
Easing: ease-out
From: translateY(20px), opacity 0
To: translateY(0), opacity 1

Use for:
- Modals
- Drawers
- Alert messages
```

### Scale In
```css
Duration: 200ms
Easing: ease-out
From: scale(0.9), opacity 0
To: scale(1), opacity 1

Use for:
- Popups
- Confirmations
- Success icons
```

### Glow Pulse
```css
Duration: 2s
Easing: ease-in-out
Iteration: infinite
From: shadow 0 0 20px
To: shadow 0 0 40px

Use for:
- Live indicators
- Attention grabbers
- Active states
- Stream alerts
```

---

## 🖼️ Layout Patterns

### Dashboard Grid
```
Desktop (1024px+):
┌─────────────────────────────────┐
│         Header (64px)           │
├────────┬────────────────────────┤
│ Side   │                        │
│ bar    │   Main Content         │
│ 240px  │   (flexible)           │
│        │                        │
└────────┴────────────────────────┘

Mobile (<768px):
┌─────────────────┐
│  Header (56px)  │
├─────────────────┤
│                 │
│  Main Content   │
│  (full width)   │
│                 │
└─────────────────┘
Sidebar: Drawer (toggle)
```

### Card Grid Layout
```
Mobile: 1 column (100%)
Tablet: 2 columns (50% each)
Desktop: 3-4 columns (33% or 25%)
Gap: 24px
```

### Hero Section
```
Height: min 60vh
Alignment: Center (vertical + horizontal)
Padding: 64px (top/bottom)
Background: Gradient or solid
Text align: Center
```

### Form Layout
```
Width: max 480px (centered)
Label: Block, 8px below
Input: 100% width
Error: 4px below input, red text
Gap between fields: 16px
Submit button: Full width or right-aligned
```

---

## 🎯 Component Size Guide

### Buttons
```
Small:
Height: 32px
Padding: 6px 12px
Font: 14px

Medium (default):
Height: 40px
Padding: 8px 16px
Font: 16px

Large:
Height: 48px
Padding: 12px 24px
Font: 18px
```

### Icons
```
Small: 16×16px (in text)
Medium: 20×20px (in buttons)
Large: 24×24px (standalone)
XL: 32×32px (hero icons)
XXL: 48×48px (feature icons)
```

### Cards
```
Min width: 280px
Max width: None (grid-based)
Min height: Auto (content-based)
Padding: 24px (desktop), 16px (mobile)
Border radius: 12px
```

### Modals
```
Small: 400px width
Medium: 600px width
Large: 800px width
Full: 90vw max

Max height: 90vh
Padding: 24px
Border radius: 16px
```

---

## 📊 Data Visualization

### Progress Bars
```
Height: 8px (thin) or 12px (thick)
Border radius: Full (9999px)
Background: #12121A
Fill: Linear gradient or solid
Animation: Smooth transition (300ms)

Colors:
- Purple: Goals
- Cyan: Time-based
- Green: Success metrics
- Orange: Warning thresholds
```

### Stat Cards
```
Layout:
┌──────────────────────┐
│ Label    [Icon]      │
│ Value                │
│ +Change%             │
└──────────────────────┘

Value: 36px, Orbitron, colored
Label: 14px, Inter, secondary
Change: 12px, colored (+green/-red)
Icon: 32px, colored, 30% opacity
```

### Charts
```
Colors: Use neon palette
Grid: Subtle (#606070, 10% opacity)
Labels: 12px, Inter, secondary
Hover: Highlight with glow
Animations: Smooth, 300ms
```

---

## 🎪 Overlay Styles (OBS)

### General Rules
```
Background: Transparent (rgba(0,0,0,0))
Text: Drop shadow for readability
Animations: 60fps target
Updates: Smooth transitions
Size: Responsive to container
```

### Alert Animations
```
Entry: Scale in + fade in (300ms)
Duration: 5000ms (default)
Exit: Fade out (200ms)
Sound: Sync with animation
Glow: Prominent (80% opacity)
```

### Chat Overlay
```
Background: Semi-transparent (#12121A, 70%)
Border: Subtle glow (left side)
Spacing: 8px between messages
Font: 16px, Inter
Max messages: 10-20 (configurable)
Animation: Slide up (new messages)
```

### Goal Bar
```
Background: Glass effect
Border: Neon glow
Height: 48px
Progress: Animated fill
Text: 18px, Orbitron
Updates: Smooth transition (500ms)
```

---

## ✅ Do's and Don'ts

### Do's ✓

```
✓ Use design tokens
✓ Follow 4px spacing grid
✓ Use semantic HTML
✓ Add ARIA labels
✓ Test keyboard navigation
✓ Use responsive classes
✓ Add loading states
✓ Handle errors gracefully
✓ Use proper heading hierarchy
✓ Optimize images with next/image
```

### Don'ts ✗

```
✗ Hardcode colors (#9146FF)
✗ Use inline styles for layout
✗ Use <div> for buttons
✗ Forget alt text on images
✗ Skip focus indicators
✗ Ignore mobile viewport
✗ Use linear animations
✗ Animate with left/top
✗ Nest headings incorrectly
✗ Use regular <img> tags
```

---

## 📱 Responsive Breakpoints

### Mobile Portrait (< 640px)
```
- Single column layout
- Larger touch targets (48px)
- Simplified navigation (drawer)
- Font size: 14px base
- Padding: 16px
```

### Mobile Landscape / Tablet (640-1023px)
```
- 2 column grid
- Standard touch targets (44px)
- Collapsible sidebar
- Font size: 15px base
- Padding: 20px
```

### Desktop (1024px+)
```
- 3-4 column grid
- Hover states enabled
- Persistent sidebar
- Font size: 16px base
- Padding: 24px
```

### Large Desktop (1280px+)
```
- 4-6 column grid
- Max container width: 1400px
- Enhanced spacing
- Larger type scale
```

---

## 🔧 Browser Support

### Minimum Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features
✓ CSS Grid
✓ Flexbox
✓ CSS Variables
✓ Backdrop filter
✓ CSS Transforms
✓ Web Animations API

---

**This is a living document. Update as the design evolves!**

Last updated: December 29, 2025

