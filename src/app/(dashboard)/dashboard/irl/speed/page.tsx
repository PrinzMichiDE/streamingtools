'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Gauge,
  ArrowLeft,
  Copy,
  Check,
  Mountain,
  Compass,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Speed and altitude overlay configuration page.
 * Shows real-time movement data for IRL streams.
 */
export default function SpeedPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showSpeed: true,
    showAltitude: true,
    showDirection: true,
    showMaxSpeed: true,
    showDistance: true,
    unit: 'kmh',
    fontSize: 24,
    gaugeStyle: 'digital',
  })

  // Demo data
  const stats = {
    speed: 42.5,
    maxSpeed: 68.2,
    altitude: 324,
    direction: 'NE',
    distance: 12.4,
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/speed/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/irl" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
          <Gauge size={20} className="text-neon-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Speed & Altitude
          </h1>
          <p className="text-sm text-text-secondary">
            Geschwindigkeit und Höhenmeter in Echtzeit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Display Options */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Anzeige
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Geschwindigkeit"
                checked={config.showSpeed}
                onChange={(checked) => setConfig({ ...config, showSpeed: checked })}
              />
              <Toggle
                label="Maximale Geschwindigkeit"
                checked={config.showMaxSpeed}
                onChange={(checked) => setConfig({ ...config, showMaxSpeed: checked })}
              />
              <Toggle
                label="Höhe"
                checked={config.showAltitude}
                onChange={(checked) => setConfig({ ...config, showAltitude: checked })}
              />
              <Toggle
                label="Richtung/Kompass"
                checked={config.showDirection}
                onChange={(checked) => setConfig({ ...config, showDirection: checked })}
              />
              <Toggle
                label="Zurückgelegte Strecke"
                checked={config.showDistance}
                onChange={(checked) => setConfig({ ...config, showDistance: checked })}
              />
            </div>
          </Card>

          {/* Unit Settings */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Einheiten
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Geschwindigkeit
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'kmh', label: 'km/h' },
                    { value: 'mph', label: 'mph' },
                    { value: 'ms', label: 'm/s' },
                  ].map((unit) => (
                    <Button
                      key={unit.value}
                      variant={config.unit === unit.value ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setConfig({ ...config, unit: unit.value })}
                    >
                      {unit.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Stil
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'digital', label: 'Digital' },
                    { value: 'analog', label: 'Analog' },
                    { value: 'minimal', label: 'Minimal' },
                  ].map((style) => (
                    <Button
                      key={style.value}
                      variant={config.gaugeStyle === style.value ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setConfig({ ...config, gaugeStyle: style.value })}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Slider
                label="Schriftgröße"
                min={16}
                max={48}
                step={2}
                value={config.fontSize}
                onChange={(value) => setConfig({ ...config, fontSize: value })}
                showValue
              />
            </div>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant="green" glow>Live</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-52 p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                {config.showSpeed && (
                  <div className="bg-bg-secondary/50 rounded-lg p-3 flex flex-col items-center justify-center">
                    <Gauge size={24} className="text-neon-cyan mb-2" />
                    <p 
                      className="font-display font-bold text-neon-cyan"
                      style={{ fontSize: `${config.fontSize}px` }}
                    >
                      {stats.speed}
                    </p>
                    <p className="text-xs text-text-muted">
                      {config.unit === 'kmh' ? 'km/h' : config.unit === 'mph' ? 'mph' : 'm/s'}
                    </p>
                  </div>
                )}
                {config.showAltitude && (
                  <div className="bg-bg-secondary/50 rounded-lg p-3 flex flex-col items-center justify-center">
                    <Mountain size={24} className="text-neon-green mb-2" />
                    <p 
                      className="font-display font-bold text-neon-green"
                      style={{ fontSize: `${config.fontSize}px` }}
                    >
                      {stats.altitude}
                    </p>
                    <p className="text-xs text-text-muted">Meter</p>
                  </div>
                )}
                {config.showDirection && (
                  <div className="bg-bg-secondary/50 rounded-lg p-3 flex flex-col items-center justify-center">
                    <Compass size={24} className="text-neon-purple mb-2" />
                    <p 
                      className="font-display font-bold text-neon-purple"
                      style={{ fontSize: `${config.fontSize}px` }}
                    >
                      {stats.direction}
                    </p>
                    <p className="text-xs text-text-muted">Richtung</p>
                  </div>
                )}
                {config.showDistance && (
                  <div className="bg-bg-secondary/50 rounded-lg p-3 flex flex-col items-center justify-center">
                    <TrendingUp size={24} className="text-neon-pink mb-2" />
                    <p 
                      className="font-display font-bold text-neon-pink"
                      style={{ fontSize: `${config.fontSize}px` }}
                    >
                      {stats.distance}
                    </p>
                    <p className="text-xs text-text-muted">km</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Overlay URL */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink size={18} className="text-neon-purple" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Overlay URL
              </h2>
            </div>
            <div className="flex gap-2">
              <Input
                value={overlayUrl}
                readOnly
                className="flex-1 text-sm font-mono"
              />
              <Button
                variant="primary"
                onClick={copyToClipboard}
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
              >
                {copied ? 'Kopiert!' : 'Kopieren'}
              </Button>
            </div>
          </Card>

          {/* Session Stats */}
          <Card className="bg-gradient-to-br from-neon-cyan/10 to-neon-green/10">
            <h3 className="text-sm font-bold text-text-primary mb-3">📊 Session Statistik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-display font-bold text-neon-cyan">{stats.maxSpeed}</p>
                <p className="text-xs text-text-muted">Max Speed (km/h)</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-neon-green">{stats.distance}</p>
                <p className="text-xs text-text-muted">Distanz (km)</p>
              </div>
            </div>
          </Card>

          <Button variant="primary" glow className="w-full">
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

