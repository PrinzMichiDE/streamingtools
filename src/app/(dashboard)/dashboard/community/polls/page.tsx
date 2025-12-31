'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  BarChart3,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Trash2,
  Play,
  Square,
  ExternalLink,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  isActive: boolean
  duration: number
  timeRemaining: number
}

/**
 * Polls configuration page.
 * Create and manage interactive polls.
 */
export default function PollsPage() {
  const [copied, setCopied] = useState(false)
  const [activePoll, setActivePoll] = useState<Poll | null>({
    id: '1',
    question: 'Was sollen wir als nächstes spielen?',
    options: [
      { id: '1', text: 'Elden Ring', votes: 45 },
      { id: '2', text: 'Cyberpunk 2077', votes: 32 },
      { id: '3', text: 'Baldurs Gate 3', votes: 28 },
    ],
    isActive: true,
    duration: 300,
    timeRemaining: 180,
  })
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    duration: 5,
  })
  const [config, setConfig] = useState({
    showVoteCount: true,
    showPercentage: true,
    allowMultipleVotes: false,
    subscriberOnly: false,
    fontSize: 16,
  })

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })
    }
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index),
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    const options = [...newPoll.options]
    options[index] = value
    setNewPoll({ ...newPoll, options })
  }

  const startPoll = () => {
    if (newPoll.question && newPoll.options.every(o => o.trim())) {
      setActivePoll({
        id: Date.now().toString(),
        question: newPoll.question,
        options: newPoll.options.map((text, i) => ({ id: i.toString(), text, votes: 0 })),
        isActive: true,
        duration: newPoll.duration * 60,
        timeRemaining: newPoll.duration * 60,
      })
      setNewPoll({ question: '', options: ['', ''], duration: 5 })
    }
  }

  const endPoll = () => {
    if (activePoll) {
      setActivePoll({ ...activePoll, isActive: false })
    }
  }

  const totalVotes = activePoll?.options.reduce((sum, o) => sum + o.votes, 0) || 0

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/poll/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/community" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
          <BarChart3 size={20} className="text-neon-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Polls
          </h1>
          <p className="text-sm text-text-secondary">
            Erstelle interaktive Umfragen
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create/Active Poll */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Poll */}
          {activePoll && activePoll.isActive && (
            <Card className="border-2 border-neon-cyan/40">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="green" glow>Aktiv</Badge>
                  <span className="text-sm text-text-muted flex items-center gap-1">
                    <Clock size={14} />
                    {formatTime(activePoll.timeRemaining)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={endPoll}
                  icon={<Square size={14} />}
                >
                  Beenden
                </Button>
              </div>
              <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                {activePoll.question}
              </h3>
              <div className="space-y-3">
                {activePoll.options.map((option) => {
                  const percentage = totalVotes > 0 
                    ? (option.votes / totalVotes) * 100 
                    : 0
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-primary">{option.text}</span>
                        <span className="text-text-secondary">
                          {config.showVoteCount && `${option.votes} Stimmen`}
                          {config.showVoteCount && config.showPercentage && ' · '}
                          {config.showPercentage && `${percentage.toFixed(1)}%`}
                        </span>
                      </div>
                      <ProgressBar value={percentage} showLabel={false} />
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-text-muted mt-4 text-center">
                Gesamt: {totalVotes} Stimmen
              </p>
            </Card>
          )}

          {/* Create New Poll */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Neue Umfrage erstellen
            </h2>
            <div className="space-y-4">
              <Input
                label="Frage"
                placeholder="Was sollen wir als nächstes spielen?"
                value={newPoll.question}
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Optionen
                </label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1"
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {newPoll.options.length < 6 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={addOption}
                    icon={<Plus size={14} />}
                  >
                    Option hinzufügen
                  </Button>
                )}
              </div>
              <Slider
                label="Dauer (Minuten)"
                min={1}
                max={30}
                step={1}
                value={newPoll.duration}
                onChange={(value) => setNewPoll({ ...newPoll, duration: value })}
                showValue
              />
              <Button
                variant="primary"
                glow
                className="w-full"
                onClick={startPoll}
                disabled={!newPoll.question || !newPoll.options.every(o => o.trim())}
                icon={<Play size={16} />}
              >
                Umfrage starten
              </Button>
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
                label="Stimmenzahl anzeigen"
                checked={config.showVoteCount}
                onChange={(checked) => setConfig({ ...config, showVoteCount: checked })}
              />
              <Toggle
                label="Prozente anzeigen"
                checked={config.showPercentage}
                onChange={(checked) => setConfig({ ...config, showPercentage: checked })}
              />
              <Toggle
                label="Mehrfache Stimmen"
                description="Zuschauer können mehrfach abstimmen"
                checked={config.allowMultipleVotes}
                onChange={(checked) => setConfig({ ...config, allowMultipleVotes: checked })}
              />
              <Toggle
                label="Nur Abonnenten"
                checked={config.subscriberOnly}
                onChange={(checked) => setConfig({ ...config, subscriberOnly: checked })}
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

          {/* Tips */}
          <Card className="bg-gradient-to-br from-neon-cyan/10 to-neon-green/10">
            <h3 className="text-sm font-bold text-text-primary mb-2">💡 Tipps</h3>
            <ul className="text-xs text-text-secondary space-y-2">
              <li>• Halte Fragen kurz und eindeutig</li>
              <li>• 2-4 Optionen funktionieren am besten</li>
              <li>• Nutze Umfragen für Spielentscheidungen</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

