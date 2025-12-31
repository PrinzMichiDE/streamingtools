'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Bell,
  ArrowLeft,
  Copy,
  Check,
  Play,
  Heart,
  Star,
  Gift,
  Users,
  Volume2,
  Palette,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

const alertTypes = [
  { id: 'follow', name: 'Follower', icon: Heart, color: 'neon-pink' },
  { id: 'sub', name: 'Subscriber', icon: Star, color: 'neon-purple' },
  { id: 'donation', name: 'Donation', icon: Gift, color: 'neon-green' },
  { id: 'raid', name: 'Raid', icon: Users, color: 'neon-cyan' },
]

/**
 * Alert configuration page.
 * Allows users to customize follower, sub, donation, and raid alerts.
 */
export default function AlertsPage() {
  const [copied, setCopied] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState('follow')
  const [testPlaying, setTestPlaying] = useState(false)
  const [config, setConfig] = useState({
    enabled: true,
    duration: 5,
    volume: 80,
    animation: 'bounce',
    showMessage: true,
    customMessage: 'Danke für den Follow, {name}! 💜',
    textColor: '#ffffff',
    fontSize: 24,
  })

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/alerts/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const playTestAlert = () => {
    setTestPlaying(true)
    setTimeout(() => setTestPlaying(false), config.duration * 1000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/universal" 
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
            <Bell size={20} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Alerts
            </h1>
            <p className="text-sm text-text-secondary">
              Konfiguriere deine Stream-Benachrichtigungen
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={playTestAlert}
          disabled={testPlaying}
          icon={<Play size={16} />}
        >
          {testPlaying ? 'Spielt ab...' : 'Test Alert'}
        </Button>
      </div>

      {/* Alert Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {alertTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedAlert === type.id
          return (
            <button
              key={type.id}
              onClick={() => setSelectedAlert(type.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? `border-${type.color} bg-${type.color}/10` 
                  : 'border-neon-purple/20 bg-bg-card hover:border-neon-purple/40'
                }
              `}
            >
              <div className={`w-10 h-10 rounded-lg bg-${type.color}/20 flex items-center justify-center mx-auto mb-2`}>
                <Icon size={20} className={`text-${type.color}`} />
              </div>
              <p className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                {type.name}
              </p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Allgemeine Einstellungen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Alert aktiviert"
                description="Aktiviere oder deaktiviere diesen Alert-Typ"
                checked={config.enabled}
                onChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
              <Slider
                label="Anzeigedauer (Sekunden)"
                min={2}
                max={15}
                step={1}
                value={config.duration}
                onChange={(value) => setConfig({ ...config, duration: value })}
                showValue
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Animation
                </label>
                <select
                  value={config.animation}
                  onChange={(e) => setConfig({ ...config, animation: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                >
                  <option value="bounce">Bounce</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                  <option value="shake">Shake</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Sound Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 size={18} className="text-neon-green" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Sound
              </h2>
            </div>
            <div className="space-y-4">
              <Slider
                label="Lautstärke"
                min={0}
                max={100}
                step={5}
                value={config.volume}
                onChange={(value) => setConfig({ ...config, volume: value })}
                showValue
              />
              <Button variant="secondary" className="w-full">
                Sound hochladen
              </Button>
            </div>
          </Card>

          {/* Message Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} className="text-neon-pink" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Nachricht
              </h2>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Nachricht anzeigen"
                checked={config.showMessage}
                onChange={(checked) => setConfig({ ...config, showMessage: checked })}
              />
              {config.showMessage && (
                <>
                  <Input
                    label="Nachricht"
                    value={config.customMessage}
                    onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                    helperText="Nutze {name} für den Benutzernamen"
                  />
                  <Slider
                    label="Schriftgröße"
                    min={16}
                    max={48}
                    step={2}
                    value={config.fontSize}
                    onChange={(value) => setConfig({ ...config, fontSize: value })}
                    showValue
                  />
                  <Input
                    label="Textfarbe"
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                  />
                </>
              )}
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
              <Badge variant={testPlaying ? 'green' : 'purple'} glow={testPlaying}>
                {testPlaying ? 'Spielt ab' : 'Bereit'}
              </Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-56 flex items-center justify-center overflow-hidden">
              {testPlaying ? (
                <div className={`
                  text-center animate-bounce
                `}>
                  <Heart 
                    size={64} 
                    className="text-neon-pink mx-auto mb-4 animate-pulse" 
                    fill="currentColor"
                  />
                  <p 
                    className="font-display font-bold"
                    style={{ fontSize: `${config.fontSize}px`, color: config.textColor }}
                  >
                    {config.customMessage.replace('{name}', 'CoolViewer')}
                  </p>
                </div>
              ) : (
                <p className="text-text-muted text-sm">
                  Klicke auf &quot;Test Alert&quot; für eine Vorschau
                </p>
              )}
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
            <p className="text-sm text-text-secondary mb-4">
              Füge diese URL als Browser-Quelle in OBS hinzu
            </p>
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
            <div className="mt-4 p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
              <p className="text-xs text-neon-cyan">
                💡 Tipp: Setze in OBS die Größe auf 800x600px und aktiviere &quot;Lokale Dateien&quot; für Sounds.
              </p>
            </div>
          </Card>

          {/* Save Button */}
          <Button variant="primary" glow className="w-full">
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

