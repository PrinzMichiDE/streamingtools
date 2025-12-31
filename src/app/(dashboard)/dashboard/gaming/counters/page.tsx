'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Hash,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Skull,
  Swords,
  Heart,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

interface Counter {
  id: string
  name: string
  value: number
  icon: 'skull' | 'swords' | 'heart' | 'hash'
  color: string
}

/**
 * Gaming counters configuration page.
 * Manage death counters, kill counters, and custom counters.
 */
export default function CountersPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [counters, setCounters] = useState<Counter[]>([
    { id: '1', name: 'Deaths', value: 47, icon: 'skull', color: '#ef4444' },
    { id: '2', name: 'Kills', value: 156, icon: 'swords', color: '#00d4ff' },
    { id: '3', name: 'Lives', value: 3, icon: 'heart', color: '#ec4899' },
  ])

  const iconMap = {
    skull: Skull,
    swords: Swords,
    heart: Heart,
    hash: Hash,
  }

  const updateCounter = (id: string, delta: number) => {
    setCounters(counters.map(c => 
      c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c
    ))
  }

  const resetCounter = (id: string) => {
    setCounters(counters.map(c => 
      c.id === id ? { ...c, value: 0 } : c
    ))
  }

  const deleteCounter = (id: string) => {
    setCounters(counters.filter(c => c.id !== id))
  }

  const addCounter = () => {
    const newCounter: Counter = {
      id: Date.now().toString(),
      name: 'Neuer Counter',
      value: 0,
      icon: 'hash',
      color: '#9333ea',
    }
    setCounters([...counters, newCounter])
  }

  const copyToClipboard = (id: string) => {
    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/counter/${id}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/gaming" 
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
            <Hash size={20} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Counters
            </h1>
            <p className="text-sm text-text-secondary">
              Deaths, Kills, und benutzerdefinierte Counter
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={addCounter}
          icon={<Plus size={16} />}
        >
          Neuer Counter
        </Button>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counters.map((counter) => {
          const Icon = iconMap[counter.icon]
          
          return (
            <Card key={counter.id} className="group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${counter.color}20` }}
                  >
                    <Icon size={20} style={{ color: counter.color }} />
                  </div>
                  <Input
                    value={counter.name}
                    onChange={(e) => setCounters(counters.map(c => 
                      c.id === counter.id ? { ...c, name: e.target.value } : c
                    ))}
                    className="bg-transparent border-none p-0 font-display font-bold text-text-primary w-32"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteCounter(counter.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} className="text-red-400" />
                </Button>
              </div>

              {/* Counter Display */}
              <div className="bg-bg-primary/50 rounded-lg p-6 mb-4">
                <p 
                  className="text-5xl font-display font-bold text-center"
                  style={{ color: counter.color }}
                >
                  {counter.value}
                </p>
              </div>

              {/* Controls */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => updateCounter(counter.id, -1)}
                >
                  <Minus size={18} />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => resetCounter(counter.id)}
                >
                  <RotateCcw size={18} />
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => updateCounter(counter.id, 1)}
                >
                  <Plus size={18} />
                </Button>
              </div>

              {/* Overlay URL */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => copyToClipboard(counter.id)}
                  icon={copied === counter.id ? <Check size={12} /> : <Copy size={12} />}
                >
                  {copied === counter.id ? 'Kopiert!' : 'URL kopieren'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10">
        <h3 className="text-lg font-display font-bold text-text-primary mb-4">
          ⌨️ Tastenkürzel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="purple">Numpad +</Badge>
            <span className="text-text-secondary">Counter erhöhen</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Numpad -</Badge>
            <span className="text-text-secondary">Counter verringern</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Numpad 0</Badge>
            <span className="text-text-secondary">Counter zurücksetzen</span>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">
          💡 Konfiguriere Hotkeys in den Einstellungen für schnellen Zugriff während des Streams
        </p>
      </Card>
    </div>
  )
}

