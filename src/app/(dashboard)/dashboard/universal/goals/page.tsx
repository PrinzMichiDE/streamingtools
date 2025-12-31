'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  Target,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Users,
  Star,
  DollarSign,
  ExternalLink,
  Save,
} from 'lucide-react'
import Link from 'next/link'

interface Goal {
  id: string
  title: string
  type: 'followers' | 'subs' | 'donations' | 'custom'
  currentValue: number
  targetValue: number
  color: string
}

const goalTypeIcons = {
  followers: Users,
  subs: Star,
  donations: DollarSign,
  custom: Target,
}

const goalTypeLabels = {
  followers: 'Follower',
  subs: 'Subscriber',
  donations: 'Donations',
  custom: 'Benutzerdefiniert',
}

/**
 * Goals management page.
 * Allows users to create and manage stream goals.
 */
export default function GoalsPage() {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [newGoal, setNewGoal] = useState<{
    title: string
    type: Goal['type']
    currentValue: number
    targetValue: number
    color: string
  }>({
    title: '',
    type: 'followers',
    currentValue: 0,
    targetValue: 100,
    color: '#9333ea',
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      const data = await res.json()
      if (data.success) {
        setGoals(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async () => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      })
      const data = await res.json()
      if (data.success) {
        setGoals([...goals, data.data])
        setNewGoal({ title: '', type: 'followers', currentValue: 0, targetValue: 100, color: '#9333ea' })
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      setGoals(goals.filter(g => g.id !== id))
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/goals/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
            <Target size={20} className="text-neon-green" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Goals
            </h1>
            <p className="text-sm text-text-secondary">
              Erstelle und verwalte deine Stream-Ziele
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          icon={<Plus size={16} />}
        >
          Neues Ziel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          {isCreating && (
            <Card className="border-2 border-neon-purple/40 animate-fade-in">
              <h3 className="text-lg font-display font-bold text-text-primary mb-4">
                Neues Ziel erstellen
              </h3>
              <div className="space-y-4">
                <Input
                  label="Titel"
                  placeholder="z.B. Follower-Ziel"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Typ
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal['type'] })}
                    className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                  >
                    <option value="followers">Follower</option>
                    <option value="subs">Subscriber</option>
                    <option value="donations">Donations</option>
                    <option value="custom">Benutzerdefiniert</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Aktueller Wert"
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({ ...newGoal, currentValue: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Zielwert"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Input
                  label="Farbe"
                  type="color"
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button variant="primary" onClick={createGoal} className="flex-1">
                    Erstellen
                  </Button>
                  <Button variant="secondary" onClick={() => setIsCreating(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {loading ? (
            <Card>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-bg-secondary rounded w-1/3"></div>
                <div className="h-8 bg-bg-secondary rounded"></div>
              </div>
            </Card>
          ) : goals.length === 0 ? (
            <Card className="text-center py-12">
              <Target size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                Keine Ziele vorhanden
              </h3>
              <p className="text-text-secondary mb-4">
                Erstelle dein erstes Ziel, um es im Stream anzuzeigen
              </p>
              <Button variant="primary" onClick={() => setIsCreating(true)}>
                Erstes Ziel erstellen
              </Button>
            </Card>
          ) : (
            goals.map((goal) => {
              const Icon = goalTypeIcons[goal.type]
              const percentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100)

              return (
                <Card key={goal.id} hover className="group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Icon size={20} style={{ color: goal.color }} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-text-primary">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {goalTypeLabels[goal.type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingGoal(goal)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Fortschritt</span>
                      <span className="text-text-primary font-medium">
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                    </div>
                    <ProgressBar 
                      value={percentage} 
                      color={goal.color}
                      showLabel={false}
                    />
                    <p className="text-xs text-text-muted text-right">
                      {percentage.toFixed(1)}% erreicht
                    </p>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overlay URL */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink size={18} className="text-neon-purple" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Overlay URL
              </h2>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Zeige deine Ziele im Stream an
            </p>
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

          {/* Stats */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Statistik
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Aktive Ziele</span>
                <Badge variant="purple">{goals.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Erreichte Ziele</span>
                <Badge variant="green">
                  {goals.filter(g => g.currentValue >= g.targetValue).length}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10">
            <h3 className="text-sm font-bold text-text-primary mb-2">💡 Tipps</h3>
            <ul className="text-xs text-text-secondary space-y-2">
              <li>• Setze realistische Ziele für deine Community</li>
              <li>• Aktualisiere den Fortschritt regelmäßig</li>
              <li>• Feiere erreichte Ziele mit deinen Zuschauern</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

