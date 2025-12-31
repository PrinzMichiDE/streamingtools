'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import {
  Settings,
  User,
  Bell,
  Palette,
  Shield,
  Key,
  Link2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

/**
 * Settings page for user account and application configuration.
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  const [profile, setProfile] = useState({
    displayName: 'StreamerPro',
    email: 'streamer@example.com',
    timezone: 'Europe/Berlin',
    language: 'de',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    browserNotifications: true,
    weeklyReport: false,
    newFeatures: true,
  })

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    accentColor: '#9333ea',
    compactMode: false,
    animations: true,
  })

  const [apiKeys] = useState([
    { id: '1', name: 'Read-Only Key', key: 'ro_sk_live_1234...5678', type: 'readonly', lastUsed: '2024-12-28' },
    { id: '2', name: 'Read-Write Key', key: 'rw_sk_live_abcd...efgh', type: 'readwrite', lastUsed: '2024-12-29' },
  ])

  const [connections] = useState([
    { id: 'twitch', name: 'Twitch', connected: true, username: 'StreamerPro' },
    { id: 'spotify', name: 'Spotify', connected: false, username: null },
    { id: 'discord', name: 'Discord', connected: true, username: 'StreamerPro#1234' },
  ])

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'appearance', label: 'Darstellung', icon: Palette },
    { id: 'connections', label: 'Verbindungen', icon: Link2 },
    { id: 'api', label: 'API-Schlüssel', icon: Key },
    { id: 'security', label: 'Sicherheit', icon: Shield },
  ]

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2">
          Einstellungen
        </h1>
        <p className="text-text-secondary">
          Verwalte dein Konto und deine Präferenzen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${activeTab === tab.id
                        ? 'bg-neon-purple/20 text-neon-purple'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                Profil-Einstellungen
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-3xl font-bold text-white">
                    {profile.displayName.charAt(0)}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Avatar ändern
                    </Button>
                    <p className="text-xs text-text-muted mt-1">JPG, PNG max. 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Anzeigename"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  />
                  <Input
                    label="E-Mail"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Zeitzone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                    >
                      <option value="Europe/Berlin">Europe/Berlin (MEZ)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Sprache
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-card border border-neon-purple/20 rounded-lg text-text-primary focus:outline-none focus:border-neon-purple"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                <Button variant="primary">Änderungen speichern</Button>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                Benachrichtigungen
              </h2>
              <div className="space-y-4">
                <Toggle
                  label="E-Mail-Benachrichtigungen"
                  description="Erhalte wichtige Updates per E-Mail"
                  checked={notifications.emailAlerts}
                  onChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
                <Toggle
                  label="Browser-Benachrichtigungen"
                  description="Push-Benachrichtigungen im Browser"
                  checked={notifications.browserNotifications}
                  onChange={(checked) => setNotifications({ ...notifications, browserNotifications: checked })}
                />
                <Toggle
                  label="Wöchentlicher Report"
                  description="Zusammenfassung deiner Stream-Statistiken"
                  checked={notifications.weeklyReport}
                  onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
                <Toggle
                  label="Neue Features"
                  description="Benachrichtigungen über neue Funktionen"
                  checked={notifications.newFeatures}
                  onChange={(checked) => setNotifications({ ...notifications, newFeatures: checked })}
                />
                <Button variant="primary" className="mt-4">Einstellungen speichern</Button>
              </div>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                Darstellung
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    {['dark', 'light', 'system'].map((theme) => (
                      <Button
                        key={theme}
                        variant={appearance.theme === theme ? 'primary' : 'secondary'}
                        onClick={() => setAppearance({ ...appearance, theme })}
                      >
                        {theme === 'dark' ? 'Dunkel' : theme === 'light' ? 'Hell' : 'System'}
                      </Button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Akzentfarbe"
                  type="color"
                  value={appearance.accentColor}
                  onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                />
                <Toggle
                  label="Kompakter Modus"
                  description="Reduzierte Abstände für mehr Inhalt"
                  checked={appearance.compactMode}
                  onChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                />
                <Toggle
                  label="Animationen"
                  description="Aktiviere UI-Animationen"
                  checked={appearance.animations}
                  onChange={(checked) => setAppearance({ ...appearance, animations: checked })}
                />
                <Button variant="primary">Einstellungen speichern</Button>
              </div>
            </Card>
          )}

          {/* Connections */}
          {activeTab === 'connections' && (
            <Card>
              <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                Verbundene Dienste
              </h2>
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div 
                    key={connection.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg
                        ${connection.connected 
                          ? 'bg-neon-purple/20 text-neon-purple' 
                          : 'bg-bg-card text-text-muted'
                        }
                      `}>
                        {connection.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{connection.name}</p>
                        {connection.connected ? (
                          <p className="text-sm text-text-secondary">
                            Verbunden als {connection.username}
                          </p>
                        ) : (
                          <p className="text-sm text-text-muted">Nicht verbunden</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={connection.connected ? 'secondary' : 'primary'}
                      size="sm"
                    >
                      {connection.connected ? 'Trennen' : 'Verbinden'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <>
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-text-primary">
                      API-Schlüssel
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Verwalte deine API-Zugangsdaten
                    </p>
                  </div>
                  <Button variant="primary" icon={<RefreshCw size={16} />}>
                    Neuen Schlüssel erstellen
                  </Button>
                </div>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div 
                      key={apiKey.id}
                      className="p-4 rounded-lg bg-bg-secondary/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{apiKey.name}</span>
                          <Badge 
                            variant={apiKey.type === 'readonly' ? 'cyan' : 'purple'}
                            size="sm"
                          >
                            {apiKey.type === 'readonly' ? 'Nur Lesen' : 'Lesen/Schreiben'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          >
                            {copiedKey === apiKey.id ? <Check size={14} /> : <Copy size={14} />}
                          </Button>
                        </div>
                      </div>
                      <code className="text-sm text-text-muted font-mono">
                        {showApiKey ? apiKey.key : '••••••••••••••••'}
                      </code>
                      <p className="text-xs text-text-muted mt-2">
                        Zuletzt verwendet: {apiKey.lastUsed}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-neon-orange/10 to-neon-pink/10 border-neon-orange/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-neon-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display font-bold text-text-primary mb-1">
                      Sicherheitshinweis
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Teile deine API-Schlüssel niemals öffentlich. Nutze Read-Only Keys wo möglich 
                      und rotiere Schlüssel regelmäßig.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <>
              <Card>
                <h2 className="text-lg font-display font-bold text-text-primary mb-6">
                  Sicherheit
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-text-primary mb-3">Passwort ändern</h3>
                    <div className="space-y-4">
                      <Input
                        label="Aktuelles Passwort"
                        type="password"
                      />
                      <Input
                        label="Neues Passwort"
                        type="password"
                      />
                      <Input
                        label="Passwort bestätigen"
                        type="password"
                      />
                      <Button variant="primary">Passwort ändern</Button>
                    </div>
                  </div>
                  <hr className="border-neon-purple/10" />
                  <div>
                    <h3 className="font-medium text-text-primary mb-3">Zwei-Faktor-Authentifizierung</h3>
                    <p className="text-sm text-text-secondary mb-3">
                      Erhöhe die Sicherheit deines Kontos mit 2FA
                    </p>
                    <Button variant="secondary">2FA aktivieren</Button>
                  </div>
                  <hr className="border-neon-purple/10" />
                  <div>
                    <h3 className="font-medium text-text-primary mb-3">Aktive Sitzungen</h3>
                    <p className="text-sm text-text-secondary mb-3">
                      Melde alle anderen Geräte ab
                    </p>
                    <Button variant="secondary" icon={<LogOut size={16} />}>
                      Alle anderen Sitzungen beenden
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className="border-red-500/20">
                <h2 className="text-lg font-display font-bold text-red-400 mb-4">
                  Gefahrenzone
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Diese Aktionen sind unwiderruflich. Bitte sei vorsichtig.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary">
                    Daten exportieren
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    icon={<Trash2 size={16} />}
                  >
                    Konto löschen
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

