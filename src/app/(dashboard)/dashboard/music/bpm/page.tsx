'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Activity,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  ExternalLink,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

/**
 * BPM display overlay configuration page.
 * Real-time BPM display for DJ streams.
 */
export default function BpmPage() {
  const [copied, setCopied] = useState(false)
  const [bpm, setBpm] = useState(128)
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [config, setConfig] = useState({
    showLabel: true,
    showVisualization: true,
    autoDetect: false,
    fontSize: 48,
    textColor: '#00ff88',
    pulseAnimation: true,
  })

  // Simulate BPM changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBpm(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleTap = () => {
    const now = Date.now()
    const newTaps = [...tapTimes, now].slice(-4)
    setTapTimes(newTaps)

    if (newTaps.length >= 2) {
      const intervals = []
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      if (calculatedBpm >= 40 && calculatedBpm <= 200) {
        setBpm(calculatedBpm)
      }
    }
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/bpm/demo`

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
          href="/dashboard/music" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
          <Activity size={20} className="text-neon-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            BPM Display
          </h1>
          <p className="text-sm text-text-secondary">
            Echtzeit-BPM-Anzeige für DJ-Streams
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* BPM Input */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              BPM Steuerung
            </h2>
            <div className="space-y-6">
              {/* Manual Input */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Manueller BPM-Wert
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setBpm(Math.max(40, bpm - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                    className="text-center text-xl font-mono flex-1"
                    min={40}
                    max={200}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setBpm(Math.min(200, bpm + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Tap Tempo */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tap Tempo
                </label>
                <Button
                  variant="primary"
                  glow
                  className="w-full h-16 text-lg"
                  onClick={handleTap}
                  icon={<Zap size={24} />}
                >
                  TAP
                </Button>
                <p className="text-xs text-text-muted mt-2 text-center">
                  Tippe im Rhythmus der Musik
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Schnellauswahl
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[90, 120, 128, 140].map((preset) => (
                    <Button
                      key={preset}
                      variant={bpm === preset ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setBpm(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

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
                label="Label anzeigen"
                description="Zeige 'BPM' neben der Zahl"
                checked={config.showLabel}
                onChange={(checked) => setConfig({ ...config, showLabel: checked })}
              />
              <Toggle
                label="Visualisierung"
                description="Animierte Balken im Takt"
                checked={config.showVisualization}
                onChange={(checked) => setConfig({ ...config, showVisualization: checked })}
              />
              <Toggle
                label="Puls-Animation"
                description="Pulsiert im Takt"
                checked={config.pulseAnimation}
                onChange={(checked) => setConfig({ ...config, pulseAnimation: checked })}
              />
              <Slider
                label="Schriftgröße"
                min={32}
                max={96}
                step={4}
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
            </div>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="h-72">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant="green" glow>Live</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-48 flex flex-col items-center justify-center">
              {/* BPM Display */}
              <div className="text-center">
                <p 
                  className={`font-display font-bold ${config.pulseAnimation ? 'animate-pulse' : ''}`}
                  style={{ fontSize: `${config.fontSize}px`, color: config.textColor }}
                >
                  {bpm}
                </p>
                {config.showLabel && (
                  <p className="text-text-muted text-lg mt-1">BPM</p>
                )}
              </div>

              {/* Visualization */}
              {config.showVisualization && (
                <div className="flex items-end gap-1 h-12 mt-4">
                  {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3].map((height, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-full animate-pulse"
                      style={{
                        height: `${height * 100}%`,
                        backgroundColor: config.textColor,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
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

          {/* BPM Info */}
          <Card className="bg-gradient-to-br from-neon-pink/10 to-neon-orange/10">
            <h3 className="text-sm font-bold text-text-primary mb-2">🎵 BPM Referenz</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Hip-Hop</span>
                <span className="text-text-primary">85-115</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">House</span>
                <span className="text-text-primary">120-130</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Techno</span>
                <span className="text-text-primary">130-150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Drum & Bass</span>
                <span className="text-text-primary">160-180</span>
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

