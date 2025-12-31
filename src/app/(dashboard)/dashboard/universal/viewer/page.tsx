'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Eye,
  ArrowLeft,
  Copy,
  Check,
  Users,
  TrendingUp,
  ExternalLink,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Viewer counter configuration page.
 * Displays current viewer count with customization options.
 */
export default function ViewerPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showIcon: true,
    showLabel: true,
    label: 'Zuschauer',
    fontSize: 24,
    textColor: '#ffffff',
    iconColor: '#00ff88',
    backgroundColor: 'transparent',
    animateChanges: true,
    updateInterval: 30,
  })

  // Demo viewer count
  const [viewerCount] = useState(247)

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/viewer/demo`

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
        <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
          <Eye size={20} className="text-neon-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Viewer Counter
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige die aktuelle Zuschauerzahl im Stream an
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Display Options */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} className="text-neon-cyan" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Anzeige
              </h2>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Icon anzeigen"
                checked={config.showIcon}
                onChange={(checked) => setConfig({ ...config, showIcon: checked })}
              />
              <Toggle
                label="Label anzeigen"
                checked={config.showLabel}
                onChange={(checked) => setConfig({ ...config, showLabel: checked })}
              />
              {config.showLabel && (
                <Input
                  label="Label Text"
                  value={config.label}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                />
              )}
              <Slider
                label="Schriftgröße"
                min={16}
                max={64}
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
              {config.showIcon && (
                <Input
                  label="Icon-Farbe"
                  type="color"
                  value={config.iconColor}
                  onChange={(e) => setConfig({ ...config, iconColor: e.target.value })}
                />
              )}
            </div>
          </Card>

          {/* Behavior */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-neon-green" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Verhalten
              </h2>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Änderungen animieren"
                description="Zeige Animation bei Viewer-Änderungen"
                checked={config.animateChanges}
                onChange={(checked) => setConfig({ ...config, animateChanges: checked })}
              />
              <Slider
                label="Update-Interval (Sekunden)"
                min={5}
                max={120}
                step={5}
                value={config.updateInterval}
                onChange={(value) => setConfig({ ...config, updateInterval: value })}
                showValue
              />
            </div>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="h-64">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant="green" glow>Live</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-40 flex items-center justify-center">
              <div className="flex items-center gap-3">
                {config.showIcon && (
                  <Users 
                    size={config.fontSize * 1.2} 
                    style={{ color: config.iconColor }}
                    className="animate-pulse"
                  />
                )}
                <div className="text-center">
                  <p 
                    className="font-display font-bold"
                    style={{ fontSize: `${config.fontSize}px`, color: config.textColor }}
                  >
                    {viewerCount.toLocaleString()}
                  </p>
                  {config.showLabel && (
                    <p 
                      className="text-sm opacity-75"
                      style={{ color: config.textColor }}
                    >
                      {config.label}
                    </p>
                  )}
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
          </Card>

          {/* Current Stats */}
          <Card className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/10">
            <h3 className="text-sm font-bold text-text-primary mb-3">📊 Aktuelle Statistik</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-display font-bold text-neon-green">247</p>
                <p className="text-xs text-text-muted">Zuschauer</p>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-neon-cyan">1.2k</p>
                <p className="text-xs text-text-muted">Peak heute</p>
              </div>
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

