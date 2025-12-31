'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import {
  Terminal,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  MessageSquare,
  Users,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

interface Command {
  id: string
  name: string
  response: string
  cooldown: number
  enabled: boolean
  usageCount: number
  permission: 'everyone' | 'subscriber' | 'vip' | 'moderator'
}

/**
 * Commands configuration page.
 * Manage chat commands and responses.
 */
export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([
    { id: '1', name: '!discord', response: 'Tritt unserem Discord bei: discord.gg/example', cooldown: 30, enabled: true, usageCount: 245, permission: 'everyone' },
    { id: '2', name: '!social', response: 'Twitter: @example | Instagram: @example', cooldown: 30, enabled: true, usageCount: 189, permission: 'everyone' },
    { id: '3', name: '!specs', response: 'CPU: Ryzen 9 5900X | GPU: RTX 4080 | RAM: 32GB', cooldown: 60, enabled: true, usageCount: 78, permission: 'everyone' },
    { id: '4', name: '!so', response: 'Schaut bei {target} vorbei: twitch.tv/{target}', cooldown: 0, enabled: true, usageCount: 34, permission: 'moderator' },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCommand, setNewCommand] = useState({
    name: '',
    response: '',
    cooldown: 30,
    permission: 'everyone' as Command['permission'],
  })
  const [isCreating, setIsCreating] = useState(false)

  const permissionLabels = {
    everyone: 'Alle',
    subscriber: 'Abonnenten',
    vip: 'VIPs',
    moderator: 'Moderatoren',
  }

  const permissionColors = {
    everyone: 'green',
    subscriber: 'purple',
    vip: 'pink',
    moderator: 'cyan',
  }

  const addCommand = () => {
    if (newCommand.name && newCommand.response) {
      const command: Command = {
        id: Date.now().toString(),
        name: newCommand.name.startsWith('!') ? newCommand.name : `!${newCommand.name}`,
        response: newCommand.response,
        cooldown: newCommand.cooldown,
        enabled: true,
        usageCount: 0,
        permission: newCommand.permission,
      }
      setCommands([...commands, command])
      setNewCommand({ name: '', response: '', cooldown: 30, permission: 'everyone' })
      setIsCreating(false)
    }
  }

  const deleteCommand = (id: string) => {
    setCommands(commands.filter(c => c.id !== id))
  }

  const toggleCommand = (id: string) => {
    setCommands(commands.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/community" 
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
            <Terminal size={20} className="text-neon-green" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Commands
            </h1>
            <p className="text-sm text-text-secondary">
              Verwalte Chat-Befehle und Antworten
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          icon={<Plus size={16} />}
        >
          Neuer Befehl
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-neon-green" />
            <div>
              <p className="text-2xl font-display font-bold text-text-primary">{commands.length}</p>
              <p className="text-xs text-text-muted">Befehle</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Check size={20} className="text-neon-cyan" />
            <div>
              <p className="text-2xl font-display font-bold text-text-primary">
                {commands.filter(c => c.enabled).length}
              </p>
              <p className="text-xs text-text-muted">Aktiv</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-neon-purple" />
            <div>
              <p className="text-2xl font-display font-bold text-text-primary">
                {commands.reduce((sum, c) => sum + c.usageCount, 0)}
              </p>
              <p className="text-xs text-text-muted">Nutzungen</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-neon-orange" />
            <div>
              <p className="text-2xl font-display font-bold text-text-primary">
                {commands.filter(c => c.permission !== 'everyone').length}
              </p>
              <p className="text-xs text-text-muted">Geschützt</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create New Command */}
      {isCreating && (
        <Card className="border-2 border-neon-green/40 animate-fade-in">
          <h3 className="text-lg font-display font-bold text-text-primary mb-4">
            Neuen Befehl erstellen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Befehl"
              placeholder="!befehlname"
              value={newCommand.name}
              onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Berechtigung
              </label>
              <select
                value={newCommand.permission}
                onChange={(e) => setNewCommand({ ...newCommand, permission: e.target.value as Command['permission'] })}
                className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
              >
                <option value="everyone">Alle</option>
                <option value="subscriber">Abonnenten</option>
                <option value="vip">VIPs</option>
                <option value="moderator">Moderatoren</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Antwort"
                placeholder="Die Antwort des Befehls..."
                value={newCommand.response}
                onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
                helperText="Nutze {user} für den Benutzernamen, {target} für das Ziel"
              />
            </div>
            <Input
              label="Cooldown (Sekunden)"
              type="number"
              value={newCommand.cooldown}
              onChange={(e) => setNewCommand({ ...newCommand, cooldown: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={addCommand}>
              Erstellen
            </Button>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>
              Abbrechen
            </Button>
          </div>
        </Card>
      )}

      {/* Commands List */}
      <Card>
        <h2 className="text-lg font-display font-bold text-text-primary mb-4">
          Alle Befehle
        </h2>
        <div className="space-y-3">
          {commands.length === 0 ? (
            <p className="text-text-muted text-center py-8">
              Keine Befehle vorhanden. Erstelle deinen ersten Befehl!
            </p>
          ) : (
            commands.map((command) => (
              <div 
                key={command.id}
                className={`
                  flex items-start gap-4 p-4 rounded-lg transition-colors
                  ${command.enabled ? 'bg-bg-secondary/50' : 'bg-bg-secondary/20 opacity-60'}
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-neon-green font-mono font-bold">{command.name}</code>
                    <Badge 
                      variant={permissionColors[command.permission] as 'green' | 'purple' | 'pink' | 'cyan'}
                      size="sm"
                    >
                      {permissionLabels[command.permission]}
                    </Badge>
                    {!command.enabled && (
                      <Badge variant="orange" size="sm">Deaktiviert</Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{command.response}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {command.cooldown}s Cooldown
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {command.usageCount} Nutzungen
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={command.enabled}
                    onChange={() => toggleCommand(command.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCommand(command.id)}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/10">
        <h3 className="text-sm font-bold text-text-primary mb-2">💡 Variablen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <code className="text-neon-green">{'{user}'}</code>
            <p className="text-text-muted">Benutzername</p>
          </div>
          <div>
            <code className="text-neon-green">{'{target}'}</code>
            <p className="text-text-muted">Ziel-User</p>
          </div>
          <div>
            <code className="text-neon-green">{'{count}'}</code>
            <p className="text-text-muted">Nutzungszähler</p>
          </div>
          <div>
            <code className="text-neon-green">{'{game}'}</code>
            <p className="text-text-muted">Aktuelles Spiel</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

