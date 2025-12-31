import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  MessageSquare,
  Gamepad2,
  MapPin,
  Music,
  Palette,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Infinity,
} from 'lucide-react'

const features = [
  {
    category: 'Universal',
    icon: MessageSquare,
    color: 'purple',
    items: ['Chat Overlay', 'Alert System', 'Goals', 'Countdown Timer', 'Viewer Counter'],
  },
  {
    category: 'Gaming',
    icon: Gamepad2,
    color: 'cyan',
    items: ['Game Info', 'Death/Kill Counter', 'Speedrun Timer', 'Health Bar', 'Score Tracker'],
  },
  {
    category: 'IRL',
    icon: MapPin,
    color: 'green',
    items: ['Location Map', 'Speed Overlay', 'Battery Status', 'Weather Widget', 'Trip Stats'],
  },
  {
    category: 'Creative',
    icon: Palette,
    color: 'pink',
    items: ['Topic Tracker', 'Question Queue', 'Drawing Canvas', 'Art Progress'],
  },
  {
    category: 'Music',
    icon: Music,
    color: 'orange',
    items: ['Now Playing', 'Song Queue', 'BPM Display', 'Waveform Visualizer'],
  },
  {
    category: 'Community',
    icon: Users,
    color: 'cyan',
    items: ['Polls', 'Leaderboard', 'Chat Commands', 'Soundboard'],
  },
]

const benefits = [
  {
    icon: Zap,
    title: 'Blitzschnell',
    description: 'Optimierte Performance für flüssige Streams',
  },
  {
    icon: Shield,
    title: 'Sicher & Zuverlässig',
    description: 'Deine Daten sind bei uns sicher',
  },
  {
    icon: Infinity,
    title: 'Unbegrenzt',
    description: 'Unbegrenzte Overlays und Anpassungen',
  },
]

/**
 * Homepage with hero section, features, and call-to-action.
 * 
 * Showcases the platform's capabilities with animated sections
 * and professional design following the design system.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20 animate-glow-pulse" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-purple/20 border border-neon-purple/50 rounded-full mb-8 animate-slide-down">
              <Sparkles size={16} className="text-neon-purple animate-pulse" />
              <span className="text-sm text-neon-purple font-medium">All-in-One Streamer Tools</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 gradient-text animate-fade-in">
              Twitch Streamer Tools
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Professionelle Overlays und Tools für Gaming, IRL, Creative und Music Streamer.
              Alles was du brauchst in einer modernen, anpassbaren Plattform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/api/auth/signin">
                <Button size="lg" glow className="w-full sm:w-auto">
                  Get Started with Twitch
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card
                key={benefit.title}
                hover
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-neon-purple/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-neon-purple" />
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {benefit.description}
                </p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-text-primary">
            Tools für jeden Streamer-Typ
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Von Gaming-Overlays bis IRL-Location-Tracking - wir haben alles was du brauchst.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.category}
                hover
                glow
                className="animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-neon-${feature.color}/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} className={`text-neon-${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-text-primary">
                      {feature.category}
                    </h3>
                  </div>
                  <Badge variant={feature.color as any}>{feature.items.length}</Badge>
                </div>
                <ul className="space-y-2.5">
                  {feature.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-text-secondary group-hover:text-text-primary transition-colors"
                    >
                      <CheckCircle2 size={16} className={`text-neon-${feature.color} flex-shrink-0`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="text-center max-w-3xl mx-auto p-8 md:p-12 glow animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl mb-6 mx-auto shadow-glow-purple">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-text-primary">
            Bereit loszulegen?
          </h2>
          <p className="text-text-secondary mb-8 text-lg max-w-xl mx-auto">
            Verbinde deinen Twitch-Account und starte noch heute mit professionellen Overlays.
          </p>
          <Link href="/api/auth/signin">
            <Button size="lg" glow className="w-full sm:w-auto">
              Mit Twitch anmelden
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
