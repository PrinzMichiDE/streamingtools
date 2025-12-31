'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  FileText,
  ArrowLeft,
  Copy,
  Check,
  Edit2,
  Save,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

interface Topic {
  id: string
  title: string
  description?: string
  startTime: Date
  isActive: boolean
}

/**
 * Topic tracker configuration page.
 * Shows current topic or project in stream.
 */
export default function TopicPage() {
  const [copied, setCopied] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', title: 'React Hooks Deep Dive', description: 'useEffect, useMemo, useCallback', startTime: new Date(), isActive: true },
    { id: '2', title: 'Q&A Session', startTime: new Date(), isActive: false },
  ])
  const [config, setConfig] = useState({
    showTime: true,
    showDescription: true,
    autoRotate: false,
    rotateInterval: 30,
    fontSize: 20,
    textColor: '#ffffff',
  })
  const [newTopic, setNewTopic] = useState({ title: '', description: '' })

  const activeTopic = topics.find(t => t.isActive)

  const setActiveTopic = (id: string) => {
    setTopics(topics.map(t => ({ ...t, isActive: t.id === id })))
  }

  const addTopic = () => {
    if (!newTopic.title) return
    setTopics([...topics, {
      id: Date.now().toString(),
      title: newTopic.title,
      description: newTopic.description || undefined,
      startTime: new Date(),
      isActive: false,
    }])
    setNewTopic({ title: '', description: '' })
  }

  const deleteTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id))
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/topic/demo`

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
          href="/dashboard/creative" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
          <FileText size={20} className="text-neon-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Topic Tracker
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige das aktuelle Thema im Stream an
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add New Topic */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Neues Thema
            </h2>
            <div className="space-y-4">
              <Input
                label="Titel"
                placeholder="z.B. React Tutorial Part 3"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              />
              <Input
                label="Beschreibung (optional)"
                placeholder="Kurze Beschreibung des Themas"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
              />
              <Button
                variant="primary"
                onClick={addTopic}
                disabled={!newTopic.title}
                icon={<Plus size={16} />}
              >
                Thema hinzufügen
              </Button>
            </div>
          </Card>

          {/* Topics Queue */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Themen-Warteschlange
            </h2>
            <div className="space-y-3">
              {topics.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                  Keine Themen vorhanden. Füge ein neues Thema hinzu.
                </p>
              ) : (
                topics.map((topic) => (
                  <div 
                    key={topic.id}
                    className={`
                      flex items-center justify-between p-4 rounded-lg transition-colors
                      ${topic.isActive 
                        ? 'bg-neon-purple/20 border border-neon-purple/40' 
                        : 'bg-bg-secondary/50 hover:bg-bg-secondary'
                      }
                    `}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-text-primary">
                          {topic.title}
                        </h3>
                        {topic.isActive && (
                          <Badge variant="purple" size="sm" glow>Aktiv</Badge>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-sm text-text-muted mt-1">{topic.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!topic.isActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTopic(topic.id)}
                        >
                          Aktivieren
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTopic(topic.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant="green" glow>Live</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg p-4">
              {activeTopic ? (
                <div>
                  <p 
                    className="font-display font-bold text-text-primary mb-1"
                    style={{ fontSize: `${config.fontSize}px` }}
                  >
                    {activeTopic.title}
                  </p>
                  {config.showDescription && activeTopic.description && (
                    <p className="text-sm text-text-secondary">
                      {activeTopic.description}
                    </p>
                  )}
                  {config.showTime && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                      <Clock size={12} />
                      <span>seit 24 Min.</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-text-muted text-center py-4">
                  Kein aktives Thema
                </p>
              )}
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Einstellungen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Zeit anzeigen"
                checked={config.showTime}
                onChange={(checked) => setConfig({ ...config, showTime: checked })}
              />
              <Toggle
                label="Beschreibung anzeigen"
                checked={config.showDescription}
                onChange={(checked) => setConfig({ ...config, showDescription: checked })}
              />
              <Slider
                label="Schriftgröße"
                min={14}
                max={32}
                step={2}
                value={config.fontSize}
                onChange={(value) => setConfig({ ...config, fontSize: value })}
                showValue
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
        </div>
      </div>
    </div>
  )
}

