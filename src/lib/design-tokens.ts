/**
 * @fileoverview Design system utilities and helper functions
 * 
 * This module provides type-safe access to design tokens and utility
 * functions for consistent styling across the application.
 * 
 * @module lib/design-tokens
 */

/**
 * Design tokens for the Twitch overlay platform
 * 
 * @remarks
 * These tokens are the single source of truth for design values.
 * Use these instead of hardcoded values in your components.
 */
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
      cardHover: 'rgba(18, 18, 26, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0B0',
      muted: '#606070',
    },
    semantic: {
      success: '#00FF88',
      warning: '#FF6B00',
      error: '#EF4444',
      info: '#00FFFF',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
    '5xl': '96px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    glowPurple: '0 0 20px rgba(145, 70, 255, 0.5), 0 0 40px rgba(145, 70, 255, 0.3)',
    glowCyan: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
    glowPink: '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
    glowGreen: '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
    glowOrange: '0 0 20px rgba(255, 107, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.3)',
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
      black: 900,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  animation: {
    duration: {
      instant: '100ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
      alert: '5000ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
} as const;

/**
 * Type-safe color getter
 * 
 * @param category - Color category (brand, neon, background, text)
 * @param shade - Specific shade within the category
 * @returns Hex or RGBA color value
 * 
 * @example
 * ```typescript
 * const primaryColor = getColor('brand', 'primary'); // '#9146FF'
 * const bgColor = getColor('background', 'card'); // 'rgba(18, 18, 26, 0.8)'
 * ```
 */
export function getColor<
  T extends keyof typeof designTokens.colors,
  K extends keyof (typeof designTokens.colors)[T]
>(category: T, shade: K): string {
  return designTokens.colors[category][shade] as string;
}

/**
 * Type-safe spacing getter
 * 
 * @param size - Spacing size (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
 * @returns Pixel value as string
 * 
 * @example
 * ```typescript
 * const padding = getSpacing('md'); // '16px'
 * ```
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size];
}

/**
 * Generates a glow effect style object
 * 
 * @param color - Neon color name
 * @param intensity - Glow intensity (0-1)
 * @returns CSS style object with box-shadow
 * 
 * @example
 * ```typescript
 * <div style={getGlowEffect('purple', 0.8)}>
 *   Glowing element
 * </div>
 * ```
 */
export function getGlowEffect(
  color: 'purple' | 'cyan' | 'pink' | 'green' | 'orange',
  intensity: number = 1
): { boxShadow: string } {
  const glowMap = {
    purple: designTokens.shadows.glowPurple,
    cyan: designTokens.shadows.glowCyan,
    pink: designTokens.shadows.glowPink,
    green: designTokens.shadows.glowGreen,
    orange: designTokens.shadows.glowOrange,
  };

  const shadow = glowMap[color];
  
  // Adjust intensity by modifying opacity values in shadow
  const adjustedShadow = shadow.replace(/rgba\(([^)]+), ([\d.]+)\)/g, (_, rgb, alpha) => {
    const newAlpha = parseFloat(alpha) * intensity;
    return `rgba(${rgb}, ${newAlpha})`;
  });

  return { boxShadow: adjustedShadow };
}

/**
 * Generates responsive font size classes
 * 
 * @param mobile - Font size on mobile
 * @param tablet - Font size on tablet (optional)
 * @param desktop - Font size on desktop
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * <h1 className={getResponsiveFontSize('2xl', '3xl', '4xl')}>
 *   Responsive Heading
 * </h1>
 * ```
 */
export function getResponsiveFontSize(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  const classes = [`text-${mobile}`];
  
  if (tablet) {
    classes.push(`md:text-${tablet}`);
  }
  
  if (desktop) {
    classes.push(`lg:text-${desktop}`);
  }
  
  return classes.join(' ');
}

/**
 * Generates CSS variables for design tokens
 * 
 * @remarks
 * Use this in the root layout to make tokens available as CSS variables
 * 
 * @returns CSS-in-JS style object
 * 
 * @example
 * ```typescript
 * <html style={getCSSVariables()}>
 * ```
 */
export function getCSSVariables(): Record<string, string> {
  return {
    '--color-brand-primary': designTokens.colors.brand.primary,
    '--color-brand-secondary': designTokens.colors.brand.secondary,
    '--color-neon-purple': designTokens.colors.neon.purple,
    '--color-neon-cyan': designTokens.colors.neon.cyan,
    '--color-bg-primary': designTokens.colors.background.primary,
    '--color-bg-secondary': designTokens.colors.background.secondary,
    '--color-text-primary': designTokens.colors.text.primary,
    '--color-text-secondary': designTokens.colors.text.secondary,
    '--font-display': designTokens.typography.fontFamily.display,
    '--font-body': designTokens.typography.fontFamily.body,
    '--font-mono': designTokens.typography.fontFamily.mono,
  };
}

/**
 * Component variant styles generator
 * 
 * @param variant - Component variant name
 * @param variantMap - Map of variant names to Tailwind classes
 * @param defaultVariant - Default variant to use
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * const buttonStyles = getVariantStyles(
 *   variant,
 *   {
 *     primary: 'bg-neon-purple text-white',
 *     secondary: 'bg-bg-secondary text-text-primary',
 *   },
 *   'primary'
 * );
 * ```
 */
export function getVariantStyles<T extends string>(
  variant: T | undefined,
  variantMap: Record<T, string>,
  defaultVariant: T
): string {
  return variantMap[variant ?? defaultVariant] || variantMap[defaultVariant];
}

/**
 * Size variant styles generator
 * 
 * @param size - Size variant name
 * @param sizeMap - Map of size names to Tailwind classes
 * @param defaultSize - Default size to use
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * const buttonSize = getSizeStyles(
 *   size,
 *   {
 *     sm: 'px-3 py-1.5 text-sm',
 *     md: 'px-4 py-2 text-base',
 *     lg: 'px-6 py-3 text-lg',
 *   },
 *   'md'
 * );
 * ```
 */
export function getSizeStyles<T extends string>(
  size: T | undefined,
  sizeMap: Record<T, string>,
  defaultSize: T
): string {
  return sizeMap[size ?? defaultSize] || sizeMap[defaultSize];
}

/**
 * Generates glassmorphism effect classes
 * 
 * @param blur - Blur intensity ('sm', 'md', 'lg', 'xl')
 * @param opacity - Background opacity (0-1)
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * <div className={getGlassmorphism('lg', 0.6)}>
 *   Glass effect card
 * </div>
 * ```
 */
export function getGlassmorphism(
  blur: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  opacity: number = 0.6
): string {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const opacityClass = `bg-bg-card/${Math.round(opacity * 100)}`;

  return `${blurMap[blur]} ${opacityClass} border border-neon-purple/20`;
}

/**
 * Accessibility focus ring classes
 * 
 * @param color - Focus ring color ('purple', 'cyan', 'green')
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * <button className={getFocusRing('purple')}>
 *   Accessible button
 * </button>
 * ```
 */
export function getFocusRing(color: 'purple' | 'cyan' | 'green' = 'purple'): string {
  const colorMap = {
    purple: 'focus:outline-neon-purple',
    cyan: 'focus:outline-neon-cyan',
    green: 'focus:outline-neon-green',
  };

  return `focus:outline-2 ${colorMap[color]} focus:outline-offset-2 focus-visible:outline-2`;
}

/**
 * Animation classes generator
 * 
 * @param animation - Animation type
 * @param duration - Animation duration override
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * <div className={getAnimation('fade-in', 'slow')}>
 *   Animated content
 * </div>
 * ```
 */
export function getAnimation(
  animation: 'fade-in' | 'slide-up' | 'slide-down' | 'scale-in' | 'glow-pulse',
  duration?: 'fast' | 'base' | 'slow' | 'slower'
): string {
  const animationClass = `animate-${animation}`;
  const durationClass = duration ? `duration-${duration}` : '';
  
  return [animationClass, durationClass].filter(Boolean).join(' ');
}

/**
 * Truncate text with ellipsis
 * 
 * @param lines - Number of lines before truncation
 * @returns Tailwind CSS classes string
 * 
 * @example
 * ```typescript
 * <p className={getTruncate(2)}>
 *   Long text that will be truncated after 2 lines...
 * </p>
 * ```
 */
export function getTruncate(lines: number = 1): string {
  if (lines === 1) {
    return 'truncate';
  }
  
  return `line-clamp-${lines}`;
}

/**
 * Converts hex color to RGBA
 * 
 * @param hex - Hex color code (with or without #)
 * @param alpha - Alpha channel (0-1)
 * @returns RGBA color string
 * 
 * @example
 * ```typescript
 * const color = hexToRgba('#9146FF', 0.5); // 'rgba(145, 70, 255, 0.5)'
 * ```
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Type definitions for design token types
 */
export type ColorCategory = keyof typeof designTokens.colors;
export type SpacingSize = keyof typeof designTokens.spacing;
export type BorderRadius = keyof typeof designTokens.borderRadius;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;
export type AnimationDuration = keyof typeof designTokens.animation.duration;
export type AnimationEasing = keyof typeof designTokens.animation.easing;
export type Breakpoint = keyof typeof designTokens.breakpoints;
export type ZIndex = keyof typeof designTokens.zIndex;

