'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  Eye,
  Palette,
  Type,
  Settings2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Chat overlay configuration page.
 * Allows users to customize and generate chat overlay URLs.
 */
export default function ChatPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showBadges: true,
    showEmotes: true,
    showTimestamps: false,
    fadeMessages: true,
    fadeDelay: 30,
    maxMessages: 15,
    fontSize: 16,
    backgroundColor: 'transparent',
    textColor: '#ffffff',
    fontFamily: 'Inter',
  })

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/chat/demo?fade=${config.fadeMessages}&fadeDelay=${config.fadeDelay}&badges=${config.showBadges}`

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
          href="/dashboard/universal" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
          <MessageSquare size={20} className="text-neon-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Chat Overlay
          </h1>
          <p className="text-sm text-text-secondary">
            Konfiguriere dein Chat-Overlay für OBS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Display Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-neon-cyan" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Anzeige
              </h2>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Badges anzeigen"
                description="Zeige Sub-, Mod- und VIP-Badges"
                checked={config.showBadges}
                onChange={(checked) => setConfig({ ...config, showBadges: checked })}
              />
              <Toggle
                label="Emotes anzeigen"
                description="Zeige Twitch und BTTV/FFZ Emotes"
                checked={config.showEmotes}
                onChange={(checked) => setConfig({ ...config, showEmotes: checked })}
              />
              <Toggle
                label="Zeitstempel"
                description="Zeige die Uhrzeit vor jeder Nachricht"
                checked={config.showTimestamps}
                onChange={(checked) => setConfig({ ...config, showTimestamps: checked })}
              />
              <Toggle
                label="Nachrichten ausblenden"
                description="Blende alte Nachrichten nach Zeit aus"
                checked={config.fadeMessages}
                onChange={(checked) => setConfig({ ...config, fadeMessages: checked })}
              />
              {config.fadeMessages && (
                <div className="pl-4 border-l-2 border-neon-purple/30">
                  <Slider
                    label="Ausblenden nach (Sekunden)"
                    min={5}
                    max={120}
                    step={5}
                    value={config.fadeDelay}
                    onChange={(value) => setConfig({ ...config, fadeDelay: value })}
                    showValue
                  />
                </div>
              )}
              <Slider
                label="Maximale Nachrichten"
                min={5}
                max={50}
                step={1}
                value={config.maxMessages}
                onChange={(value) => setConfig({ ...config, maxMessages: value })}
                showValue
              />
            </div>
          </Card>

          {/* Style Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} className="text-neon-pink" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Stil
              </h2>
            </div>
            <div className="space-y-4">
              <Slider
                label="Schriftgröße (px)"
                min={12}
                max={32}
                step={1}
                value={config.fontSize}
                onChange={(value) => setConfig({ ...config, fontSize: value })}
                showValue
              />
              <Input
                label="Schriftfarbe"
                type="color"
                value={config.textColor}
                onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Schriftart
                </label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="h-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-neon-green" />
                <h2 className="text-lg font-display font-bold text-text-primary">
                  Vorschau
                </h2>
              </div>
              <Badge variant="cyan" size="sm">Live</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg p-4 h-56 overflow-hidden">
              <div className="space-y-2" style={{ fontSize: `${config.fontSize}px`, fontFamily: config.fontFamily }}>
                <div className="flex items-start gap-2 animate-fade-in">
                  {config.showBadges && (
                    <span className="text-xs bg-neon-purple/30 text-neon-purple px-1 rounded">MOD</span>
                  )}
                  <span className="text-neon-cyan font-bold">StreamerMax:</span>
                  <span style={{ color: config.textColor }}>Hey willkommen zum Stream! 🎮</span>
                </div>
                <div className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  {config.showBadges && (
                    <span className="text-xs bg-neon-green/30 text-neon-green px-1 rounded">VIP</span>
                  )}
                  <span className="text-neon-pink font-bold">CoolViewer:</span>
                  <span style={{ color: config.textColor }}>Nice Setup! Was spielst du heute?</span>
                </div>
                <div className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <span className="text-neon-orange font-bold">NewFollower:</span>
                  <span style={{ color: config.textColor }}>Habe gerade gefolgt! 💜</span>
                </div>
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
                💡 Tipp: Setze in OBS die Breite auf 400px und die Höhe auf 600px für beste Ergebnisse.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

