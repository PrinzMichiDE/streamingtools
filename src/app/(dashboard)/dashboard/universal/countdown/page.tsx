'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Timer,
  ArrowLeft,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  ExternalLink,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Countdown timer configuration page.
 * Allows users to create and customize countdown timers.
 */
export default function CountdownPage() {
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes default
  const [config, setConfig] = useState({
    hours: 0,
    minutes: 5,
    seconds: 0,
    showHours: true,
    showSeconds: true,
    title: 'Stream startet in...',
    endMessage: 'Es geht los! 🎉',
    fontSize: 48,
    textColor: '#ffffff',
    backgroundColor: 'transparent',
    showProgress: true,
  })

  const totalSeconds = config.hours * 3600 + config.minutes * 60 + config.seconds

  useEffect(() => {
    setTimeLeft(totalSeconds)
  }, [config.hours, config.minutes, config.seconds, totalSeconds])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const parts = []
    if (config.showHours || h > 0) {
      parts.push(h.toString().padStart(2, '0'))
    }
    parts.push(m.toString().padStart(2, '0'))
    if (config.showSeconds) {
      parts.push(s.toString().padStart(2, '0'))
    }
    return parts.join(':')
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/countdown/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const adjustTime = (field: 'hours' | 'minutes' | 'seconds', delta: number) => {
    const maxValues = { hours: 23, minutes: 59, seconds: 59 }
    const newValue = Math.max(0, Math.min(maxValues[field], config[field] + delta))
    setConfig({ ...config, [field]: newValue })
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(totalSeconds)
  }

  const progressPercentage = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0

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
        <div className="w-10 h-10 rounded-xl bg-neon-pink/20 flex items-center justify-center">
          <Timer size={20} className="text-neon-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Countdown Timer
          </h1>
          <p className="text-sm text-text-secondary">
            Erstelle Countdowns für Stream-Start oder Events
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Controls */}
        <div className="space-y-6">
          {/* Time Picker */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Zeit einstellen
            </h2>
            <div className="flex justify-center gap-4 mb-6">
              {['hours', 'minutes', 'seconds'].map((field) => {
                if (field === 'hours' && !config.showHours) return null
                if (field === 'seconds' && !config.showSeconds) return null
                
                return (
                  <div key={field} className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustTime(field as 'hours' | 'minutes' | 'seconds', 1)}
                      className="mb-2"
                    >
                      <Plus size={16} />
                    </Button>
                    <div className="w-16 h-16 bg-bg-card border border-neon-purple/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-text-primary">
                        {config[field as keyof typeof config].toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustTime(field as 'hours' | 'minutes' | 'seconds', -1)}
                      className="mt-2"
                    >
                      <Minus size={16} />
                    </Button>
                    <p className="text-xs text-text-muted mt-1 capitalize">
                      {field === 'hours' ? 'Std' : field === 'minutes' ? 'Min' : 'Sek'}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: '5 Min', h: 0, m: 5, s: 0 },
                { label: '10 Min', h: 0, m: 10, s: 0 },
                { label: '15 Min', h: 0, m: 15, s: 0 },
                { label: '30 Min', h: 0, m: 30, s: 0 },
                { label: '1 Std', h: 1, m: 0, s: 0 },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfig({ ...config, hours: preset.h, minutes: preset.m, seconds: preset.s })}
                >
                  {preset.label}
                </Button>
              ))}
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
                label="Stunden anzeigen"
                checked={config.showHours}
                onChange={(checked) => setConfig({ ...config, showHours: checked })}
              />
              <Toggle
                label="Sekunden anzeigen"
                checked={config.showSeconds}
                onChange={(checked) => setConfig({ ...config, showSeconds: checked })}
              />
              <Toggle
                label="Fortschrittsbalken"
                checked={config.showProgress}
                onChange={(checked) => setConfig({ ...config, showProgress: checked })}
              />
              <Input
                label="Titel"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
              />
              <Input
                label="End-Nachricht"
                value={config.endMessage}
                onChange={(e) => setConfig({ ...config, endMessage: e.target.value })}
              />
              <Slider
                label="Schriftgröße"
                min={24}
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

        {/* Preview & Controls */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card className="h-72">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant={isRunning ? 'green' : 'purple'} glow={isRunning}>
                {isRunning ? 'Läuft' : 'Gestoppt'}
              </Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-48 flex flex-col items-center justify-center">
              {config.title && (
                <p className="text-text-secondary text-sm mb-2">{config.title}</p>
              )}
              {timeLeft === 0 ? (
                <p 
                  className="font-display font-bold animate-pulse"
                  style={{ fontSize: `${config.fontSize * 0.6}px`, color: config.textColor }}
                >
                  {config.endMessage}
                </p>
              ) : (
                <>
                  <p 
                    className="font-display font-bold"
                    style={{ fontSize: `${config.fontSize}px`, color: config.textColor }}
                  >
                    {formatTime(timeLeft)}
                  </p>
                  {config.showProgress && (
                    <div className="w-48 h-2 bg-bg-secondary rounded-full mt-4 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-1000"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Timer Controls */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Steuerung
            </h2>
            <div className="flex gap-3">
              <Button
                variant={isRunning ? 'secondary' : 'primary'}
                glow={!isRunning}
                className="flex-1"
                onClick={() => setIsRunning(!isRunning)}
                icon={isRunning ? <Pause size={18} /> : <Play size={18} />}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="secondary"
                onClick={resetTimer}
                icon={<RotateCcw size={18} />}
              >
                Reset
              </Button>
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
        </div>
      </div>
    </div>
  )
}

