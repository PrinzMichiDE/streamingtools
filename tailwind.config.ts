import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Background colors (legacy support)
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-card': 'rgba(18, 18, 26, 0.8)',
        'bg-card-hover': 'rgba(18, 18, 26, 0.95)',
        
        // Neon accent colors (legacy support)
        'neon-purple': '#9146ff',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff00ff',
        'neon-green': '#00ff88',
        'neon-orange': '#ff6b00',
        'neon-yellow': '#ffff00',
        
        // Text colors (legacy support)
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0b0',
        'text-muted': '#606070',
        
        // shadcn/ui color system
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Orbitron', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.75rem', { lineHeight: '1.2', fontWeight: '700' }],  // 60px
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],     // 48px
        'display-md': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],  // 36px
        'display-sm': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }], // 30px
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(145, 70, 255, 0.5), 0 0 40px rgba(145, 70, 255, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 107, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.3)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-cyan-pulse': 'glow-cyan-pulse 2s ease-in-out infinite',
        'text-glow': 'text-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(145, 70, 255, 0.5), 0 0 40px rgba(145, 70, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(145, 70, 255, 0.8), 0 0 60px rgba(145, 70, 255, 0.5)',
          },
        },
        'glow-cyan-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5)',
          },
        },
        'text-glow': {
          '0%, 100%': {
            textShadow: '0 0 10px currentColor',
          },
          '50%': {
            textShadow: '0 0 20px currentColor, 0 0 30px currentColor',
          },
        },
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-down': {
          from: {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};

export default config;

