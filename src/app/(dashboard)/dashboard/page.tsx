import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  MessageSquare,
  Bell,
  Target,
  Timer,
  Eye,
  Activity,
  Gamepad2,
  MapPin,
  Music,
  Palette,
  Users,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Zap,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

type TrendType = 'up' | 'down' | 'neutral'

const quickStats: Array<{
  label: string
  value: string
  change?: string
  icon: typeof Sparkles
  color: 'purple' | 'cyan' | 'green'
  trend: TrendType
}> = [
  { 
    label: 'Active Overlays', 
    value: '0', 
    change: '+0',
    icon: Sparkles, 
    color: 'purple',
    trend: 'neutral'
  },
  { 
    label: 'Total Views', 
    value: '0', 
    change: '+0',
    icon: Eye, 
    color: 'cyan',
    trend: 'neutral'
  },
  { 
    label: 'Stream Health', 
    value: 'Good', 
    change: '100%',
    icon: Activity, 
    color: 'green',
    trend: 'up'
  },
]

const categories = [
  {
    name: 'Universal',
    icon: MessageSquare,
    description: 'Chat, Alerts, Goals, Countdown & more',
    href: '/dashboard/universal',
    color: 'purple',
    count: 8,
    gradient: 'from-neon-purple to-neon-pink',
  },
  {
    name: 'Gaming',
    icon: Gamepad2,
    description: 'Game Info, Counters, Speedrun Timer',
    href: '/dashboard/gaming',
    color: 'cyan',
    count: 7,
    gradient: 'from-neon-cyan to-neon-purple',
  },
  {
    name: 'IRL',
    icon: MapPin,
    description: 'Location Map, Speed, Battery Status',
    href: '/dashboard/irl',
    color: 'green',
    count: 6,
    gradient: 'from-neon-green to-neon-cyan',
  },
  {
    name: 'Creative',
    icon: Palette,
    description: 'Topic Tracker, Question Queue, Canvas',
    href: '/dashboard/creative',
    color: 'pink',
    count: 4,
    gradient: 'from-neon-pink to-neon-purple',
  },
  {
    name: 'Music',
    icon: Music,
    description: 'Now Playing, BPM, Waveform',
    href: '/dashboard/music',
    color: 'orange',
    count: 4,
    gradient: 'from-neon-orange to-neon-pink',
  },
  {
    name: 'Community',
    icon: Users,
    description: 'Polls, Leaderboard, Commands',
    href: '/dashboard/community',
    color: 'cyan',
    count: 5,
    gradient: 'from-neon-cyan to-neon-green',
  },
]

/**
 * Dashboard page with overview statistics, categories, and quick actions.
 * 
 * Provides a comprehensive overview of the user's streaming tools and
 * quick access to common actions.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="animate-slide-down">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
              Willkommen zurück! 👋
            </h1>
            <p className="text-text-secondary text-lg">
              Verwalte deine Stream-Overlays und Tools von einem zentralen Dashboard.
            </p>
          </div>
          <Link href="/dashboard/universal/alerts">
            <Button variant="primary" glow icon={<Plus size={18} />} iconPosition="left">
              Neues Overlay
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          const colorMap = {
            purple: 'neon-purple',
            cyan: 'neon-cyan',
            green: 'neon-green',
          } as const
          const color = colorMap[stat.color as keyof typeof colorMap] || 'neon-purple'
          
          return (
            <Card 
              key={stat.label} 
              hover 
              glow
              className="animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-2 font-medium">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-3xl font-display font-bold text-text-primary">{stat.value}</p>
                    {stat.change && (
                      <div className={`
                        flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                        ${stat.trend === 'up' ? 'bg-neon-green/20 text-neon-green' : 
                          stat.trend === 'down' ? 'bg-red-500/20 text-red-400' : 
                          'bg-text-muted/20 text-text-muted'}
                      `}>
                        {stat.trend === 'up' && <TrendingUp size={12} />}
                        {stat.change}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  bg-${color}/20 group-hover:scale-110 transition-transform duration-300
                `}>
                  <Icon size={28} className={`text-${color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Categories Grid */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2">
              Tool Kategorien
            </h2>
            <p className="text-text-secondary">
              Wähle eine Kategorie, um deine Overlays zu verwalten
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link 
                key={category.name} 
                href={category.href}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card hover glow className="h-full transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${category.gradient}
                      group-hover:scale-110 transition-transform duration-300 shadow-glow-purple
                    `}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <Badge variant={category.color as any} glow>
                      {category.count} Tools
                    </Badge>
                  </div>
                  <h3 className="text-xl font-display font-bold text-text-primary mb-2 group-hover:text-neon-purple transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm text-neon-purple font-medium group-hover:gap-2 transition-all">
                    Kategorie öffnen
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Quick Actions */}
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-text-primary mb-1">
                Schnellaktionen
              </h2>
              <p className="text-sm text-text-secondary">
                Häufig verwendete Funktionen
              </p>
            </div>
            <Zap size={20} className="text-neon-purple" />
          </div>
          <div className="space-y-3">
            <Link href="/dashboard/universal/alerts">
              <Button 
                variant="primary" 
                className="w-full justify-start"
                icon={<Bell size={18} />} 
                iconPosition="left"
              >
                Alert konfigurieren
              </Button>
            </Link>
            <Link href="/dashboard/universal/goals">
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<Target size={18} />} 
                iconPosition="left"
              >
                Goal erstellen
              </Button>
            </Link>
            <Link href="/dashboard/universal/countdown">
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<Timer size={18} />} 
                iconPosition="left"
              >
                Countdown starten
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Activity / Getting Started */}
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-text-primary mb-1">
                Erste Schritte
              </h2>
              <p className="text-sm text-text-secondary">
                Starte mit diesen ersten Schritten
              </p>
            </div>
            <Clock size={20} className="text-neon-cyan" />
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                <span className="text-neon-purple font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary mb-1">
                  Verbinde deinen Twitch-Account
                </p>
                <p className="text-xs text-text-secondary">
                  Stelle sicher, dass dein Account verbunden ist
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                <span className="text-neon-cyan font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary mb-1">
                  Erstelle dein erstes Overlay
                </p>
                <p className="text-xs text-text-secondary">
                  Wähle eine Kategorie und erstelle ein Overlay
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                <span className="text-neon-green font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary mb-1">
                  Konfiguriere deine Alerts
                </p>
                <p className="text-xs text-text-secondary">
                  Personalisiere deine Alert-Benachrichtigungen
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

