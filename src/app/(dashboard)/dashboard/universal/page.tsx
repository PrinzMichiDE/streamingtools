import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MessageSquare,
  Bell,
  Target,
  Timer,
  Eye,
  ArrowRight,
  ArrowLeft,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Chat Overlay',
    description: 'Zeige deinen Twitch-Chat in einem anpassbaren Overlay an',
    href: '/dashboard/universal/chat',
    icon: MessageSquare,
    color: 'purple',
    status: 'active' as const,
  },
  {
    name: 'Alerts',
    description: 'Konfiguriere Follower-, Sub- und Donation-Alerts',
    href: '/dashboard/universal/alerts',
    icon: Bell,
    color: 'cyan',
    status: 'active' as const,
  },
  {
    name: 'Goals',
    description: 'Erstelle und verwalte Ziele wie Follower oder Subs',
    href: '/dashboard/universal/goals',
    icon: Target,
    color: 'green',
    status: 'active' as const,
  },
  {
    name: 'Countdown',
    description: 'Countdowns für Stream-Start, Events oder Pausen',
    href: '/dashboard/universal/countdown',
    icon: Timer,
    color: 'pink',
    status: 'active' as const,
  },
  {
    name: 'Viewer Counter',
    description: 'Zeige die aktuelle Zuschauerzahl an',
    href: '/dashboard/universal/viewer',
    icon: Eye,
    color: 'orange',
    status: 'active' as const,
  },
  {
    name: 'Poll Display',
    description: 'Zeige laufende Umfragen im Stream an',
    href: '/dashboard/community/polls',
    icon: BarChart3,
    color: 'cyan',
    status: 'active' as const,
  },
]

/**
 * Universal tools category page.
 * Contains common streaming tools like chat, alerts, goals, and countdown.
 */
export default function UniversalPage() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center shadow-glow-purple">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                Universal Tools
              </h1>
              <p className="text-text-secondary">
                Essenzielle Overlays für jeden Stream
              </p>
            </div>
          </div>
        </div>
        <Badge variant="purple" glow>
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
                  <Badge variant={tool.status === 'active' ? 'green' : 'purple'} size="sm">
                    {tool.status === 'active' ? 'Aktiv' : 'Beta'}
                  </Badge>
                </div>
                <h3 className="text-lg font-display font-bold text-text-primary mb-2 group-hover:text-neon-purple transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-neon-purple font-medium">
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

