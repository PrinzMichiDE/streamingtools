import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  Map,
  Gauge,
  Battery,
  Thermometer,
  Compass,
  Mountain,
} from 'lucide-react'
import Link from 'next/link'

const tools = [
  {
    name: 'Location Map',
    description: 'Zeige deinen aktuellen Standort auf einer interaktiven Karte',
    href: '/dashboard/irl/location',
    icon: Map,
    color: 'green',
    status: 'active' as const,
  },
  {
    name: 'Speed & Altitude',
    description: 'Geschwindigkeit, Höhe und Bewegungsdaten in Echtzeit',
    href: '/dashboard/irl/speed',
    icon: Gauge,
    color: 'cyan',
    status: 'active' as const,
  },
  {
    name: 'Battery Status',
    description: 'Zeige den Akkustand deines Streaming-Geräts',
    href: '/dashboard/irl/battery',
    icon: Battery,
    color: 'orange',
    status: 'active' as const,
  },
  {
    name: 'Compass',
    description: 'Kompass-Overlay für Outdoor-Streams',
    href: '/dashboard/irl/speed',
    icon: Compass,
    color: 'purple',
    status: 'beta' as const,
  },
  {
    name: 'Weather',
    description: 'Aktuelle Wetterdaten für deinen Standort',
    href: '/dashboard/irl/location',
    icon: Thermometer,
    color: 'pink',
    status: 'beta' as const,
  },
  {
    name: 'Elevation Profile',
    description: 'Höhenprofil für Wander- und Radtouren',
    href: '/dashboard/irl/speed',
    icon: Mountain,
    color: 'cyan',
    status: 'beta' as const,
  },
]

/**
 * IRL streaming tools category page.
 * Contains location, speed, and battery overlays.
 */
export default function IRLPage() {
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-glow-green">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
                IRL Tools
              </h1>
              <p className="text-text-secondary">
                Overlays für IRL- und Outdoor-Streams
              </p>
            </div>
          </div>
        </div>
        <Badge variant="green" glow>
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
          const color = colorMap[tool.color] || 'neon-green'

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
                <h3 className="text-lg font-display font-bold text-text-primary mb-2 group-hover:text-neon-green transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-sm text-neon-green font-medium">
                  Konfigurieren
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Privacy Notice */}
      <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10 border-neon-orange/20">
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-neon-orange flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-text-primary mb-1">
              Hinweis zur Privatsphäre
            </h3>
            <p className="text-sm text-text-secondary">
              Die Standortdaten werden nur während des Streams übertragen und nicht gespeichert. 
              Du kannst jederzeit die GPS-Genauigkeit anpassen oder den Standort verzögert anzeigen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

