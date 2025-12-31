'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Trophy,
  ArrowLeft,
  Copy,
  Check,
  Medal,
  Star,
  MessageSquare,
  Gift,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  username: string
  avatar: string
  score: number
  type: 'subs' | 'bits' | 'messages' | 'watch'
}

/**
 * Leaderboard configuration page.
 * Display top supporters and active chatters.
 */
export default function LeaderboardPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'subs' | 'bits' | 'messages'>('subs')
  const [config, setConfig] = useState({
    showAvatars: true,
    showScores: true,
    animateChanges: true,
    maxEntries: 10,
    fontSize: 14,
    refreshInterval: 60,
  })

  // Demo data
  const leaderboards: Record<string, LeaderboardEntry[]> = {
    subs: [
      { rank: 1, username: 'TopSupporter', avatar: '', score: 24, type: 'subs' },
      { rank: 2, username: 'StreamFan42', avatar: '', score: 18, type: 'subs' },
      { rank: 3, username: 'LoyalViewer', avatar: '', score: 12, type: 'subs' },
      { rank: 4, username: 'NiceGifter', avatar: '', score: 8, type: 'subs' },
      { rank: 5, username: 'CoolDude99', avatar: '', score: 5, type: 'subs' },
    ],
    bits: [
      { rank: 1, username: 'BitKing', avatar: '', score: 15000, type: 'bits' },
      { rank: 2, username: 'CheerMaster', avatar: '', score: 8500, type: 'bits' },
      { rank: 3, username: 'GenerosPerson', avatar: '', score: 5000, type: 'bits' },
      { rank: 4, username: 'BitDonor', avatar: '', score: 2500, type: 'bits' },
      { rank: 5, username: 'SmallCheerer', avatar: '', score: 1000, type: 'bits' },
    ],
    messages: [
      { rank: 1, username: 'ChattyKathy', avatar: '', score: 2456, type: 'messages' },
      { rank: 2, username: 'TalkativeTom', avatar: '', score: 1823, type: 'messages' },
      { rank: 3, username: 'MessageMike', avatar: '', score: 1456, type: 'messages' },
      { rank: 4, username: 'SpeakySam', avatar: '', score: 987, type: 'messages' },
      { rank: 5, username: 'WordyWendy', avatar: '', score: 654, type: 'messages' },
    ],
  }

  const currentLeaderboard = leaderboards[activeTab]

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="text-yellow-400" size={20} />
    if (rank === 2) return <Medal className="text-gray-400" size={20} />
    if (rank === 3) return <Medal className="text-orange-400" size={20} />
    return <span className="text-text-muted w-5 text-center">{rank}</span>
  }

  const getScoreLabel = (type: string) => {
    switch (type) {
      case 'subs': return 'Gifted Subs'
      case 'bits': return 'Bits'
      case 'messages': return 'Messages'
      default: return 'Score'
    }
  }

  const formatScore = (score: number, type: string) => {
    if (type === 'bits') return score.toLocaleString()
    return score.toString()
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/leaderboard/demo`

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
          href="/dashboard/community" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
          <Trophy size={20} className="text-neon-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Leaderboard
          </h1>
          <p className="text-sm text-text-secondary">
            Top-Supporter und aktivste Chatter
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selection */}
          <div className="flex gap-2">
            {[
              { id: 'subs', label: 'Gifted Subs', icon: Gift },
              { id: 'bits', label: 'Bits', icon: Star },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  icon={<Icon size={16} />}
                >
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Leaderboard */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Top {config.maxEntries} - {getScoreLabel(activeTab)}
              </h2>
              <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />}>
                Aktualisieren
              </Button>
            </div>
            <div className="space-y-2">
              {currentLeaderboard.slice(0, config.maxEntries).map((entry, index) => (
                <div 
                  key={entry.username}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg transition-colors
                    ${entry.rank <= 3 ? 'bg-neon-orange/10' : 'bg-bg-secondary/50'}
                    animate-fade-in
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  {config.showAvatars && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-white font-bold">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Username */}
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{entry.username}</p>
                  </div>

                  {/* Score */}
                  {config.showScores && (
                    <div className="text-right">
                      <p className="font-display font-bold text-neon-orange">
                        {formatScore(entry.score, activeTab)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {activeTab === 'bits' ? 'Bits' : activeTab === 'subs' ? 'Subs' : 'Msgs'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
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
                label="Avatare anzeigen"
                checked={config.showAvatars}
                onChange={(checked) => setConfig({ ...config, showAvatars: checked })}
              />
              <Toggle
                label="Punktestand anzeigen"
                checked={config.showScores}
                onChange={(checked) => setConfig({ ...config, showScores: checked })}
              />
              <Toggle
                label="Änderungen animieren"
                checked={config.animateChanges}
                onChange={(checked) => setConfig({ ...config, animateChanges: checked })}
              />
              <Slider
                label="Max. Einträge"
                min={3}
                max={20}
                step={1}
                value={config.maxEntries}
                onChange={(value) => setConfig({ ...config, maxEntries: value })}
                showValue
              />
              <Slider
                label="Update-Interval (Sek)"
                min={30}
                max={300}
                step={30}
                value={config.refreshInterval}
                onChange={(value) => setConfig({ ...config, refreshInterval: value })}
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

          {/* Current Session */}
          <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10">
            <h3 className="text-sm font-bold text-text-primary mb-3">📊 Diese Session</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Gifted Subs</span>
                <span className="text-text-primary font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bits gespendet</span>
                <span className="text-text-primary font-medium">32.5k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Chat-Nachrichten</span>
                <span className="text-text-primary font-medium">8.376</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

