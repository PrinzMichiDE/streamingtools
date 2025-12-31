import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const orbitron = localFont({
  src: [
    {
      path: '../../public/fonts/Orbitron-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Orbitron-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Orbitron-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Orbitron-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Orbitron-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['sans-serif'],
})

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/Inter-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['sans-serif'],
})

const jetbrainsMono = localFont({
  src: [
    {
      path: '../../public/fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/JetBrainsMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/JetBrainsMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['monospace'],
})

export const metadata: Metadata = {
  title: {
    default: 'Twitch Streamer Tools - Professional Overlays & Tools',
    template: '%s | Twitch Streamer Tools',
  },
  description: 'All-in-one platform for Twitch streamers with overlays for Gaming, IRL, Creative, and Music streaming.',
  keywords: ['Twitch', 'Streaming', 'Overlays', 'Gaming', 'IRL', 'Creative', 'Music'],
  authors: [{ name: 'Twitch Streamer Tools' }],
  creator: 'Twitch Streamer Tools',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    title: 'Twitch Streamer Tools - Professional Overlays & Tools',
    description: 'All-in-one platform for Twitch streamers with overlays for Gaming, IRL, Creative, and Music streaming.',
    siteName: 'Twitch Streamer Tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitch Streamer Tools',
    description: 'Professional Overlays & Tools for Twitch Streamers',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0F' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
