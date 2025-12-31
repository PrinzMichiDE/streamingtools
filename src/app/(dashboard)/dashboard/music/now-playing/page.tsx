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
  Disc,
  ArrowLeft,
  Copy,
  Check,
  Music,
  User,
  Clock,
  ExternalLink,
  Link2,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Now Playing overlay configuration page.
 * Shows currently playing song with album art.
 */
export default function NowPlayingPage() {
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [config, setConfig] = useState({
    showAlbumArt: true,
    showArtist: true,
    showProgress: true,
    showDuration: true,
    animateChanges: true,
    fontSize: 16,
    theme: 'dark',
    service: 'spotify',
  })

  // Demo song data
  const song = {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 203,
    progress: 87,
    albumArt: '/api/placeholder/120/120',
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/nowplaying/demo`

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
          href="/dashboard/music" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
          <Disc size={20} className="text-neon-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Now Playing
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige den aktuellen Song im Stream
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Service Connection */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={18} className="text-neon-green" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Musik-Dienst
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Dienst auswählen
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'spotify', name: 'Spotify', color: 'green' },
                    { id: 'soundcloud', name: 'SoundCloud', color: 'orange' },
                    { id: 'lastfm', name: 'Last.fm', color: 'red' },
                    { id: 'manual', name: 'Manuell', color: 'purple' },
                  ].map((service) => (
                    <Button
                      key={service.id}
                      variant={config.service === service.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setConfig({ ...config, service: service.id })}
                      className="justify-center"
                    >
                      {service.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                {config.service === 'spotify' ? 'Mit Spotify verbinden' : 'Verbindung einrichten'}
              </Button>
            </div>
          </Card>

          {/* Display Options */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Anzeigeoptionen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Album-Cover"
                checked={config.showAlbumArt}
                onChange={(checked) => setConfig({ ...config, showAlbumArt: checked })}
              />
              <Toggle
                label="Künstler"
                checked={config.showArtist}
                onChange={(checked) => setConfig({ ...config, showArtist: checked })}
              />
              <Toggle
                label="Fortschrittsbalken"
                checked={config.showProgress}
                onChange={(checked) => setConfig({ ...config, showProgress: checked })}
              />
              <Toggle
                label="Dauer anzeigen"
                checked={config.showDuration}
                onChange={(checked) => setConfig({ ...config, showDuration: checked })}
              />
              <Toggle
                label="Animierter Wechsel"
                description="Sanfte Animation beim Song-Wechsel"
                checked={config.animateChanges}
                onChange={(checked) => setConfig({ ...config, animateChanges: checked })}
              />
              <Slider
                label="Schriftgröße"
                min={12}
                max={24}
                step={2}
                value={config.fontSize}
                onChange={(value) => setConfig({ ...config, fontSize: value })}
                showValue
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
              <Badge variant={isPlaying ? 'green' : 'orange'} glow={isPlaying}>
                {isPlaying ? 'Spielt' : 'Pausiert'}
              </Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg p-4 h-48">
              <div className="flex items-center gap-4 h-full">
                {/* Album Art */}
                {config.showAlbumArt && (
                  <div className="w-32 h-32 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center flex-shrink-0">
                    <Disc size={48} className={`text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
                  </div>
                )}
                
                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-display font-bold text-text-primary truncate"
                    style={{ fontSize: `${config.fontSize + 4}px` }}
                  >
                    {song.title}
                  </p>
                  {config.showArtist && (
                    <p className="text-text-secondary truncate" style={{ fontSize: `${config.fontSize}px` }}>
                      {song.artist}
                    </p>
                  )}
                  
                  {/* Progress */}
                  {config.showProgress && (
                    <div className="mt-4">
                      <ProgressBar 
                        value={(song.progress / song.duration) * 100} 
                        showLabel={false}
                      />
                      {config.showDuration && (
                        <div className="flex justify-between text-xs text-text-muted mt-1">
                          <span>{formatTime(song.progress)}</span>
                          <span>{formatTime(song.duration)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Playback Controls (Demo) */}
          <Card>
            <h2 className="text-sm font-display font-bold text-text-primary mb-3">
              Test-Steuerung
            </h2>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="sm">
                <SkipForward size={16} className="rotate-180" />
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button variant="secondary" size="sm">
                <SkipForward size={16} />
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

          <Button variant="primary" glow className="w-full">
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </div>
  )
}

