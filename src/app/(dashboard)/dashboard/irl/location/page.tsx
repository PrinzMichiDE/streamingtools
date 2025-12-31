'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Slider } from '@/components/ui/Slider'
import { Badge } from '@/components/ui/Badge'
import {
  Map,
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Navigation,
  Eye,
  EyeOff,
  ExternalLink,
  Settings2,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Location map overlay configuration page.
 * Shows current location on an interactive map.
 */
export default function LocationPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showMap: true,
    mapStyle: 'dark',
    showMarker: true,
    showPath: true,
    showAddress: false,
    privacyRadius: 0,
    delay: 0,
    zoomLevel: 14,
    mapSize: 'medium',
  })

  // Demo location
  const demoLocation = {
    lat: 52.52,
    lng: 13.405,
    address: 'Berlin, Deutschland',
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/location/demo`

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
          href="/dashboard/irl" 
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-neon-green/20 flex items-center justify-center">
          <Map size={20} className="text-neon-green" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Location Map
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige deinen Standort auf einer Karte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Map Settings */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Settings2 size={18} className="text-neon-cyan" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Karteneinstellungen
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Kartenstil
                </label>
                <select
                  value={config.mapStyle}
                  onChange={(e) => setConfig({ ...config, mapStyle: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                  <option value="satellite">Satellit</option>
                  <option value="terrain">Terrain</option>
                </select>
              </div>
              <Slider
                label="Zoom-Level"
                min={8}
                max={18}
                step={1}
                value={config.zoomLevel}
                onChange={(value) => setConfig({ ...config, zoomLevel: value })}
                showValue
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Kartengröße
                </label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <Button
                      key={size}
                      variant={config.mapSize === size ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setConfig({ ...config, mapSize: size })}
                    >
                      {size === 'small' ? 'Klein' : size === 'medium' ? 'Mittel' : 'Groß'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Display Options */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-neon-pink" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Anzeige
              </h2>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Marker anzeigen"
                description="Zeige einen Pin an deinem Standort"
                checked={config.showMarker}
                onChange={(checked) => setConfig({ ...config, showMarker: checked })}
              />
              <Toggle
                label="Route anzeigen"
                description="Zeige den zurückgelegten Weg"
                checked={config.showPath}
                onChange={(checked) => setConfig({ ...config, showPath: checked })}
              />
              <Toggle
                label="Adresse anzeigen"
                description="Zeige die aktuelle Adresse"
                checked={config.showAddress}
                onChange={(checked) => setConfig({ ...config, showAddress: checked })}
              />
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-neon-orange/20">
            <div className="flex items-center gap-2 mb-4">
              <EyeOff size={18} className="text-neon-orange" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Privatsphäre
              </h2>
            </div>
            <div className="space-y-4">
              <Slider
                label="Unschärferadius (Meter)"
                min={0}
                max={500}
                step={50}
                value={config.privacyRadius}
                onChange={(value) => setConfig({ ...config, privacyRadius: value })}
                showValue
              />
              <p className="text-xs text-text-muted">
                Versteckt deinen genauen Standort in einem Radius
              </p>
              <Slider
                label="Verzögerung (Minuten)"
                min={0}
                max={30}
                step={5}
                value={config.delay}
                onChange={(value) => setConfig({ ...config, delay: value })}
                showValue
              />
              <p className="text-xs text-text-muted">
                Zeigt deinen Standort mit Verzögerung an
              </p>
            </div>
          </Card>
        </div>

        {/* Preview & URL */}
        <div className="space-y-6">
          {/* Map Preview */}
          <Card className="h-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">
                Vorschau
              </h2>
              <Badge variant="green" glow>
                <Navigation size={12} className="mr-1" />
                Live
              </Badge>
            </div>
            <div className="bg-bg-primary rounded-lg h-52 relative overflow-hidden">
              {/* Simulated Map */}
              <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary to-bg-card">
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neon-purple"/>
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>
                {/* Location Marker */}
                {config.showMarker && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <MapPin size={32} className="text-neon-green animate-bounce" fill="currentColor" />
                      {config.privacyRadius > 0 && (
                        <div 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon-green/30 bg-neon-green/10"
                          style={{ width: '80px', height: '80px' }}
                        />
                      )}
                    </div>
                  </div>
                )}
                {/* Path */}
                {config.showPath && (
                  <svg className="absolute inset-0 w-full h-full">
                    <path 
                      d="M 20 60 Q 40 40 60 50 T 100 30" 
                      fill="none" 
                      stroke="#00ff88" 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}
              </div>
              {/* Address */}
              {config.showAddress && (
                <div className="absolute bottom-2 left-2 bg-bg-card/90 px-3 py-1.5 rounded-lg">
                  <p className="text-sm text-text-primary">{demoLocation.address}</p>
                </div>
              )}
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

          {/* Current Location */}
          <Card className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/10">
            <h3 className="text-sm font-bold text-text-primary mb-3">📍 Aktueller Standort</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Latitude</span>
                <span className="text-text-primary font-mono">{demoLocation.lat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Longitude</span>
                <span className="text-text-primary font-mono">{demoLocation.lng}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Adresse</span>
                <span className="text-text-primary">{demoLocation.address}</span>
              </div>
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

