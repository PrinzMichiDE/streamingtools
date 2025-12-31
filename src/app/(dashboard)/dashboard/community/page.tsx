import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Trophy,
  Terminal,
  Heart,
  Gift,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Polls',
    description: 'Erstelle interaktive Umfragen für deine Community',
    href: '/dashboard/community/polls',
    icon: BarChart3,
    color: 'cyan',
    status: 'active' as const,
  },
  {
    name: 'Leaderboard',
    description: 'Top-Supporter, aktivste Chatter, Punktestand',
    href: '/dashboard/community/leaderboard',
    icon: Trophy,
    color: 'orange',
    status: 'active' as const,
  },
  {
    name: 'Commands',
    description: 'Chat-Befehle und Overlays verwalten',
    href: '/dashboard/community/commands',
    icon: Terminal,
    color: 'green',
    status: 'active' as const,
  },
  {
    name: 'Loyalty System',
    description: 'Punkte und Belohnungen für Zuschauer',
    href: '/dashboard/community/leaderboard',
    icon: Heart,
    color: 'pink',
    status: 'beta' as const,
  },
  {
    name: 'Giveaways',
    description: 'Verlosungen für deine Community',
    href: '/dashboard/community/polls',
    icon: Gift,
    color: 'purple',
    status: 'beta' as const,
  },
]

/**
 * Community tools category page.
 * Contains tools for community engagement.
 */
export default function CommunityPage() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-green flex items-center justify-center shadow-glow-cyan">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                Community Tools
              </h1>
              <p className="text-text-secondary">
                Engagement und Interaktion mit deiner Community
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
          }
          const color = colorMap[tool.color] || 'neon-cyan'

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

