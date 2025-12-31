'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import {
  Timer,
  ArrowLeft,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Plus,
  Trash2,
  ExternalLink,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'

interface Split {
  id: string
  name: string
  bestTime: number | null
  currentTime: number | null
}

/**
 * Speedrun timer configuration page.
 * Professional speedrun timer with splits support.
 */
export default function SpeedrunPage() {
  const [copied, setCopied] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [currentSplit, setCurrentSplit] = useState(0)
  const [splits, setSplits] = useState<Split[]>([
    { id: '1', name: 'Tutorial', bestTime: 125000, currentTime: null },
    { id: '2', name: 'Level 1', bestTime: 340000, currentTime: null },
    { id: '3', name: 'Boss 1', bestTime: 180000, currentTime: null },
    { id: '4', name: 'Level 2', bestTime: 420000, currentTime: null },
    { id: '5', name: 'Final Boss', bestTime: 300000, currentTime: null },
  ])
  const [config, setConfig] = useState({
    showSplits: true,
    showComparison: true,
    showBestPossible: true,
    fontSize: 32,
    textColor: '#ffffff',
    aheadColor: '#00ff88',
    behindColor: '#ff4444',
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prev => prev + 10)
      }, 10)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const split = () => {
    if (currentSplit < splits.length) {
      setSplits(splits.map((s, i) => 
        i === currentSplit ? { ...s, currentTime: time } : s
      ))
      setCurrentSplit(prev => prev + 1)
    }
  }

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setCurrentSplit(0)
    setSplits(splits.map(s => ({ ...s, currentTime: null })))
  }

  const addSplit = () => {
    setSplits([...splits, {
      id: Date.now().toString(),
      name: `Split ${splits.length + 1}`,
      bestTime: null,
      currentTime: null,
    }])
  }

  const removeSplit = (id: string) => {
    setSplits(splits.filter(s => s.id !== id))
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/speedrun/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalBestTime = splits.reduce((acc, s) => acc + (s.bestTime || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/gaming" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
          <Timer size={20} className="text-neon-green" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Speedrun Timer
          </h1>
          <p className="text-sm text-text-secondary">
            Professioneller Timer mit Splits-Support
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Timer */}
          <Card className="text-center">
            <div className="mb-6">
              <p 
                className="font-mono font-bold"
                style={{ 
                  fontSize: `${config.fontSize * 1.5}px`, 
                  color: config.textColor 
                }}
              >
                {formatTime(time)}
              </p>
              {config.showBestPossible && totalBestTime > 0 && (
                <p className="text-text-muted text-sm mt-2">
                  Best Possible: {formatTime(totalBestTime)}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={isRunning ? 'secondary' : 'primary'}
                glow={!isRunning}
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                icon={isRunning ? <Pause size={20} /> : <Play size={20} />}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={split}
                disabled={!isRunning || currentSplit >= splits.length}
                icon={<Flag size={20} />}
              >
                Split
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={reset}
                icon={<RotateCcw size={20} />}
              >
                Reset
              </Button>
            </div>
          </Card>

          {/* Splits */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Splits
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={addSplit}
                icon={<Plus size={14} />}
              >
                Hinzufügen
              </Button>
            </div>
            <div className="space-y-2">
              {splits.map((s, index) => {
                const isActive = index === currentSplit
                const isCompleted = s.currentTime !== null
                const diff = s.currentTime && s.bestTime 
                  ? s.currentTime - s.bestTime 
                  : null

                return (
                  <div 
                    key={s.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg transition-colors
                      ${isActive ? 'bg-neon-purple/20 border border-neon-purple/40' : 'bg-bg-secondary/50'}
                      ${isCompleted ? 'opacity-75' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted text-sm w-6">{index + 1}</span>
                      <Input
                        value={s.name}
                        onChange={(e) => setSplits(splits.map(split => 
                          split.id === s.id ? { ...split, name: e.target.value } : split
                        ))}
                        className="bg-transparent border-none p-0 text-text-primary w-32"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      {s.bestTime && (
                        <span className="text-text-muted text-sm font-mono">
                          {formatTime(s.bestTime)}
                        </span>
                      )}
                      {isCompleted && s.currentTime && (
                        <>
                          <span className="text-text-primary font-mono">
                            {formatTime(s.currentTime)}
                          </span>
                          {diff !== null && (
                            <span 
                              className="font-mono text-sm"
                              style={{ color: diff > 0 ? config.behindColor : config.aheadColor }}
                            >
                              {diff > 0 ? '+' : ''}{formatTime(Math.abs(diff))}
                            </span>
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSplit(s.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Einstellungen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Splits anzeigen"
                checked={config.showSplits}
                onChange={(checked) => setConfig({ ...config, showSplits: checked })}
              />
              <Toggle
                label="Vergleich anzeigen"
                checked={config.showComparison}
                onChange={(checked) => setConfig({ ...config, showComparison: checked })}
              />
              <Toggle
                label="Best Possible Time"
                checked={config.showBestPossible}
                onChange={(checked) => setConfig({ ...config, showBestPossible: checked })}
              />
              <Input
                label="Voraus-Farbe"
                type="color"
                value={config.aheadColor}
                onChange={(e) => setConfig({ ...config, aheadColor: e.target.value })}
              />
              <Input
                label="Zurück-Farbe"
                type="color"
                value={config.behindColor}
                onChange={(e) => setConfig({ ...config, behindColor: e.target.value })}
              />
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
                className="flex-1 text-xs font-mono"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={copyToClipboard}
                icon={copied ? <Check size={14} /> : <Copy size={14} />}
              />
            </div>
          </Card>

          {/* Personal Best */}
          <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-neon-orange" />
              <h3 className="font-display font-bold text-text-primary">Personal Best</h3>
            </div>
            <p className="text-2xl font-mono font-bold text-neon-orange">
              {formatTime(totalBestTime)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Letzte Verbesserung: vor 3 Tagen
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

