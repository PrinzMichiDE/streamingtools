import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Music,
  ArrowLeft,
  ArrowRight,
  Disc,
  Activity,
  AudioLines,
  ListMusic,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Now Playing',
    description: 'Zeige den aktuell gespielten Song mit Albumcover',
    href: '/dashboard/music/now-playing',
    icon: Disc,
    color: 'orange',
    status: 'active' as const,
  },
  {
    name: 'BPM Display',
    description: 'Echtzeit-BPM-Anzeige für DJ-Streams',
    href: '/dashboard/music/bpm',
    icon: Activity,
    color: 'pink',
    status: 'active' as const,
  },
  {
    name: 'Waveform',
    description: 'Visualisiere Audio als animierte Wellenform',
    href: '/dashboard/music/now-playing',
    icon: AudioLines,
    color: 'cyan',
    status: 'beta' as const,
  },
  {
    name: 'Playlist',
    description: 'Zeige die aktuelle Playlist oder Song-Queue',
    href: '/dashboard/music/now-playing',
    icon: ListMusic,
    color: 'purple',
    status: 'beta' as const,
  },
]

/**
 * Music tools category page.
 * Contains tools for music and DJ streams.
 */
export default function MusicPage() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-orange to-neon-pink flex items-center justify-center shadow-glow-orange">
              <Music size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                Music Tools
              </h1>
              <p className="text-text-secondary">
                Overlays für Musik- und DJ-Streams
              </p>
            </div>
          </div>
        </div>
        <Badge variant="orange" glow>
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
            pink: 'neon-pink',
            orange: 'neon-orange',
          }
          const color = colorMap[tool.color] || 'neon-orange'

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
                <h3 className="text-lg font-display font-bold text-text-primary mb-2 group-hover:text-neon-orange transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-neon-orange font-medium">
                  Konfigurieren
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Music Services Integration */}
      <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10">
        <h3 className="text-lg font-display font-bold text-text-primary mb-3">
          🎵 Unterstützte Dienste
        </h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="green">Spotify</Badge>
          <Badge variant="orange">SoundCloud</Badge>
          <Badge variant="purple">Last.fm</Badge>
          <Badge variant="cyan">Apple Music</Badge>
          <Badge variant="pink">YouTube Music</Badge>
        </div>
        <p className="text-sm text-text-secondary mt-3">
          Verbinde deinen Musik-Account für automatische Song-Erkennung.
        </p>
      </Card>
    </div>
  )
}

