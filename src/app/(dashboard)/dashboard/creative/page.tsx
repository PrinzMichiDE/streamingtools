import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Palette,
  ArrowLeft,
  ArrowRight,
  FileText,
  HelpCircle,
  Brush,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Topic Tracker',
    description: 'Zeige das aktuelle Thema oder Projekt im Stream an',
    href: '/dashboard/creative/topic',
    icon: FileText,
    color: 'purple',
    status: 'active' as const,
  },
  {
    name: 'Question Queue',
    description: 'Sammle und zeige Fragen aus dem Chat',
    href: '/dashboard/creative/questions',
    icon: HelpCircle,
    color: 'cyan',
    status: 'active' as const,
  },
  {
    name: 'Canvas Overlay',
    description: 'Zeichenfläche für Brainstorming und Notizen',
    href: '/dashboard/creative/topic',
    icon: Brush,
    color: 'pink',
    status: 'beta' as const,
  },
  {
    name: 'Feedback Widget',
    description: 'Sammle Feedback von Zuschauern in Echtzeit',
    href: '/dashboard/creative/questions',
    icon: MessageCircle,
    color: 'green',
    status: 'beta' as const,
  },
]

/**
 * Creative tools category page.
 * Contains tools for creative and educational streams.
 */
export default function CreativePage() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-glow-pink">
              <Palette size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                Creative Tools
              </h1>
              <p className="text-text-secondary">
                Overlays für kreative und educational Streams
              </p>
            </div>
          </div>
        </div>
        <Badge variant="pink" glow>
          {tools.length} Tools
        </Badge>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon
          const colorMap: Record<string, string> = {
            purple: 'neon-purple',
            cyan: 'neon-cyan',
            green: 'neon-green',
            pink: 'neon-pink',
          }
          const color = colorMap[tool.color] || 'neon-pink'

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
                <h3 className="text-lg font-display font-bold text-text-primary mb-2 group-hover:text-neon-pink transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-neon-pink font-medium">
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

