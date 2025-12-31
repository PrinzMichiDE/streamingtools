import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Gamepad2,
  ArrowLeft,
  ArrowRight,
  Info,
  Hash,
  Timer,
  Heart,
  Skull,
  Swords,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Game Info',
    description: 'Zeige aktuelle Spielinformationen und Statistiken an',
    href: '/dashboard/gaming/game-info',
    icon: Info,
    color: 'purple',
    status: 'active' as const,
  },
  {
    name: 'Death Counter',
    description: 'Zähle und zeige Tode in schwierigen Spielen',
    href: '/dashboard/gaming/counters',
    icon: Skull,
    color: 'red',
    status: 'active' as const,
  },
  {
    name: 'Kill Counter',
    description: 'Tracke Kills und Eliminations',
    href: '/dashboard/gaming/counters',
    icon: Swords,
    color: 'cyan',
    status: 'active' as const,
  },
  {
    name: 'Speedrun Timer',
    description: 'Präziser Timer für Speedrun-Versuche mit Splits',
    href: '/dashboard/gaming/speedrun',
    icon: Timer,
    color: 'green',
    status: 'active' as const,
  },
  {
    name: 'Health Bar',
    description: 'Visuelle HP-Anzeige für Challenges',
    href: '/dashboard/gaming/counters',
    icon: Heart,
    color: 'pink',
    status: 'active' as const,
  },
  {
    name: 'Achievement Tracker',
    description: 'Verfolge und feiere Erfolge im Stream',
    href: '/dashboard/gaming/counters',
    icon: Trophy,
    color: 'orange',
    status: 'beta' as const,
  },
]

/**
 * Gaming tools category page.
 * Contains game-specific overlays like counters and timers.
 */
export default function GamingPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard" 
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-glow-cyan">
              <Gamepad2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                Gaming Tools
              </h1>
              <p className="text-text-secondary">
                Overlays speziell für Gaming-Streams
              </p>
            </div>
          </div>
        </div>
        <Badge variant="cyan" glow>
          {tools.length} Tools
        </Badge>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon
          const colorMap: Record<string, string> = {
            purple: 'neon-purple',
            cyan: 'neon-cyan',
            green: 'neon-green',
            pink: 'neon-pink',
            orange: 'neon-orange',
            red: 'red-500',
          }
          const color = colorMap[tool.color] || 'neon-purple'

          return (
            <Link
              key={tool.name}
              href={tool.href}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card hover glow className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    bg-${color}/20 group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon size={24} className={`text-${color}`} />
                  </div>
                  <Badge variant={tool.status === 'active' ? 'green' : 'orange'} size="sm">
                    {tool.status === 'active' ? 'Aktiv' : 'Beta'}
                  </Badge>
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary mb-2 group-hover:text-neon-cyan transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-neon-cyan font-medium">
                  Konfigurieren
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

