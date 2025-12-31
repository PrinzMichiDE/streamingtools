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
  Battery,
  ArrowLeft,
  Copy,
  Check,
  BatteryCharging,
  BatteryLow,
  BatteryWarning,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Battery status overlay configuration page.
 * Shows device battery level and remaining time.
 */
export default function BatteryPage() {
  const [copied, setCopied] = useState(false)
  const [config, setConfig] = useState({
    showPercentage: true,
    showIcon: true,
    showRemainingTime: true,
    showCharging: true,
    lowBatteryWarning: 20,
    criticalWarning: 10,
    fontSize: 18,
    warningColor: '#ff8800',
    criticalColor: '#ff4444',
  })

  // Demo data
  const batteryInfo = {
    level: 67,
    isCharging: false,
    remainingTime: '2h 34m',
  }

  const getBatteryColor = (level: number) => {
    if (level <= config.criticalWarning) return config.criticalColor
    if (level <= config.lowBatteryWarning) return config.warningColor
    return '#00ff88'
  }

  const getBatteryIcon = (level: number, isCharging: boolean) => {
    if (isCharging) return BatteryCharging
    if (level <= config.criticalWarning) return BatteryLow
    if (level <= config.lowBatteryWarning) return BatteryWarning
    return Battery
  }

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/battery/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const BatteryIcon = getBatteryIcon(batteryInfo.level, batteryInfo.isCharging)
  const batteryColor = getBatteryColor(batteryInfo.level)

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
        <div className="w-10 h-10 rounded-xl bg-neon-orange/20 flex items-center justify-center">
          <Battery size={20} className="text-neon-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Battery Status
          </h1>
          <p className="text-sm text-text-secondary">
            Zeige den Akkustand deines Streaming-Geräts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Display Options */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Anzeige
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Prozent anzeigen"
                checked={config.showPercentage}
                onChange={(checked) => setConfig({ ...config, showPercentage: checked })}
              />
              <Toggle
                label="Icon anzeigen"
                checked={config.showIcon}
                onChange={(checked) => setConfig({ ...config, showIcon: checked })}
              />
              <Toggle
                label="Restzeit anzeigen"
                description="Geschätzte verbleibende Akkulaufzeit"
                checked={config.showRemainingTime}
                onChange={(checked) => setConfig({ ...config, showRemainingTime: checked })}
              />
              <Toggle
                label="Ladestatus anzeigen"
                checked={config.showCharging}
                onChange={(checked) => setConfig({ ...config, showCharging: checked })}
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

          {/* Warning Thresholds */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-neon-orange" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Warnungen
              </h2>
            </div>
            <div className="space-y-4">
              <Slider
                label="Niedrig-Warnung (%)"
                min={10}
                max={50}
                step={5}
                value={config.lowBatteryWarning}
                onChange={(value) => setConfig({ ...config, lowBatteryWarning: value })}
                showValue
              />
              <Input
                label="Warnfarbe"
                type="color"
                value={config.warningColor}
                onChange={(e) => setConfig({ ...config, warningColor: e.target.value })}
              />
              <Slider
                label="Kritisch-Warnung (%)"
                min={5}
                max={20}
                step={5}
                value={config.criticalWarning}
                onChange={(value) => setConfig({ ...config, criticalWarning: value })}
                showValue
              />
              <Input
                label="Kritisch-Farbe"
                type="color"
                value={config.criticalColor}
                onChange={(e) => setConfig({ ...config, criticalColor: e.target.value })}
              />
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
              <Badge 
                variant={batteryInfo.isCharging ? 'green' : batteryInfo.level <= config.lowBatteryWarning ? 'orange' : 'cyan'}
                glow
              >
                {batteryInfo.isCharging ? 'Lädt' : 'Aktiv'}
              </Badge>
            </div>
            <div className="bg-bg-primary/50 rounded-lg h-40 flex flex-col items-center justify-center">
              <div className="flex items-center gap-4">
                {config.showIcon && (
                  <BatteryIcon 
                    size={48} 
                    style={{ color: batteryColor }}
                    className={batteryInfo.isCharging ? 'animate-pulse' : ''}
                  />
                )}
                {config.showPercentage && (
                  <p 
                    className="font-display font-bold"
                    style={{ fontSize: `${config.fontSize * 2}px`, color: batteryColor }}
                  >
                    {batteryInfo.level}%
                  </p>
                )}
              </div>
              {config.showRemainingTime && (
                <div className="flex items-center gap-2 mt-3 text-text-secondary">
                  <Clock size={14} />
                  <span className="text-sm">{batteryInfo.remainingTime} verbleibend</span>
                </div>
              )}
              <div className="w-48 mt-4">
                <ProgressBar 
                  value={batteryInfo.level} 
                  color={batteryColor}
                  showLabel={false}
                />
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

          {/* Info */}
          <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10">
            <h3 className="text-sm font-bold text-text-primary mb-2">📱 Geräte-Info</h3>
            <p className="text-sm text-text-secondary mb-3">
              Der Akkustand wird automatisch vom Streaming-Gerät abgerufen.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Aktueller Stand</span>
                <span className="text-text-primary font-medium">{batteryInfo.level}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="text-text-primary font-medium">
                  {batteryInfo.isCharging ? 'Wird geladen' : 'Entlädt'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Restzeit</span>
                <span className="text-text-primary font-medium">{batteryInfo.remainingTime}</span>
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

