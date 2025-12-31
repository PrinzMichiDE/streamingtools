'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import {
  Info,
  ArrowLeft,
  Copy,
  Check,
  Gamepad2,
  Clock,
  Trophy,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Game info overlay configuration page.
 * Displays current game information from Twitch.
 */
export default function GameInfoPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showGameName: true,
    showPlaytime: true,
    showCategory: true,
    showRank: false,
    autoSync: true,
    manualGame: '',
    fontSize: 18,
    textColor: '#ffffff',
  })

  // Demo data
  const gameInfo = {
    name: 'Elden Ring',
    category: 'Action RPG',
    playtime: '127 Stunden',
    rank: 'Diamond III',
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/gameinfo/demo`

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
          href="/dashboard/gaming" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
          <Info size={20} className="text-neon-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Game Info
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige aktuelle Spielinformationen an
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Anzeigeoptionen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Spielname anzeigen"
                checked={config.showGameName}
                onChange={(checked) => setConfig({ ...config, showGameName: checked })}
              />
              <Toggle
                label="Spielzeit anzeigen"
                checked={config.showPlaytime}
                onChange={(checked) => setConfig({ ...config, showPlaytime: checked })}
              />
              <Toggle
                label="Kategorie anzeigen"
                checked={config.showCategory}
                onChange={(checked) => setConfig({ ...config, showCategory: checked })}
              />
              <Toggle
                label="Rang/Skill anzeigen"
                description="Zeige deinen Rang in kompetitiven Spielen"
                checked={config.showRank}
                onChange={(checked) => setConfig({ ...config, showRank: checked })}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Datenquelle
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Automatisch von Twitch"
                description="Synchronisiere automatisch mit deiner Twitch-Kategorie"
                checked={config.autoSync}
                onChange={(checked) => setConfig({ ...config, autoSync: checked })}
              />
              {!config.autoSync && (
                <Input
                  label="Manueller Spielname"
                  value={config.manualGame}
                  onChange={(e) => setConfig({ ...config, manualGame: e.target.value })}
                  placeholder="z.B. Elden Ring"
                />
              )}
              <Button variant="secondary" className="w-full" icon={<RefreshCw size={16} />}>
                Jetzt synchronisieren
              </Button>
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
              <Badge variant="green" glow>Synced</Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-40 p-4">
              <div className="space-y-3">
                {config.showGameName && (
                  <div className="flex items-center gap-2">
                    <Gamepad2 size={18} className="text-neon-purple" />
                    <span className="font-display font-bold text-text-primary" style={{ fontSize: `${config.fontSize}px` }}>
                      {gameInfo.name}
                    </span>
                  </div>
                )}
                {config.showCategory && (
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{gameInfo.category}</Badge>
                  </div>
                )}
                {config.showPlaytime && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <Clock size={14} />
                    <span>{gameInfo.playtime}</span>
                  </div>
                )}
                {config.showRank && (
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-neon-orange" />
                    <span className="text-text-primary font-medium">{gameInfo.rank}</span>
                  </div>
                )}
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

          <Button variant="primary" glow className="w-full">
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

