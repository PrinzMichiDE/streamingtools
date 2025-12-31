'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  MapPin,
  Gamepad2,
  Music,
  Palette,
  Users,
  Settings,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Universal', href: '/dashboard/universal', icon: MessageSquare, children: [
    { name: 'Chat', href: '/dashboard/universal/chat' },
    { name: 'Alerts', href: '/dashboard/universal/alerts' },
    { name: 'Goals', href: '/dashboard/universal/goals' },
    { name: 'Countdown', href: '/dashboard/universal/countdown' },
    { name: 'Viewer Counter', href: '/dashboard/universal/viewer' },
  ]},
  { name: 'Gaming', href: '/dashboard/gaming', icon: Gamepad2, children: [
    { name: 'Game Info', href: '/dashboard/gaming/game-info' },
    { name: 'Counters', href: '/dashboard/gaming/counters' },
    { name: 'Speedrun Timer', href: '/dashboard/gaming/speedrun' },
  ]},
  { name: 'IRL', href: '/dashboard/irl', icon: MapPin, children: [
    { name: 'Location Map', href: '/dashboard/irl/location' },
    { name: 'Speed & Altitude', href: '/dashboard/irl/speed' },
    { name: 'Battery Status', href: '/dashboard/irl/battery' },
  ]},
  { name: 'Creative', href: '/dashboard/creative', icon: Palette, children: [
    { name: 'Topic Tracker', href: '/dashboard/creative/topic' },
    { name: 'Question Queue', href: '/dashboard/creative/questions' },
  ]},
  { name: 'Music', href: '/dashboard/music', icon: Music, children: [
    { name: 'Now Playing', href: '/dashboard/music/now-playing' },
    { name: 'BPM Display', href: '/dashboard/music/bpm' },
  ]},
  { name: 'Community', href: '/dashboard/community', icon: Users, children: [
    { name: 'Polls', href: '/dashboard/community/polls' },
    { name: 'Leaderboard', href: '/dashboard/community/leaderboard' },
    { name: 'Commands', href: '/dashboard/community/commands' },
  ]},
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

/**
 * Sidebar navigation component with responsive mobile menu.
 * 
 * Provides navigation for dashboard sections with collapsible
 * submenus and mobile-friendly design.
 * 
 * @component
 */
export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isItemExpanded = (itemName: string) => {
    return expandedItems.includes(itemName)
  }

  const NavContent = () => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        const Icon = item.icon
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = hasChildren && isItemExpanded(item.name)

        return (
          <div key={item.name}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(item.name)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-neon-purple/20 text-neon-purple border-l-2 border-neon-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={cn(
                    'transition-transform duration-200',
                    isExpanded && 'rotate-90'
                  )}
                />
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-neon-purple/20 text-neon-purple border-l-2 border-neon-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )}
            {hasChildren && isExpanded && (
              <div className="ml-8 mt-1 space-y-1 animate-slide-down">
                {item.children?.map((child) => {
                  const isChildActive = pathname === child.href
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'block px-3 py-1.5 text-sm rounded transition-colors',
                        isChildActive
                          ? 'text-neon-cyan bg-neon-cyan/10'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-card/50'
                      )}
                    >
                      {child.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 bg-bg-secondary/95 backdrop-blur-md border-r border-neon-purple/20 h-screen sticky top-0 overflow-y-auto transition-transform duration-300 z-40',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 mb-8"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-lg flex items-center justify-center shadow-glow-purple">
              <span className="text-white font-display font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-display font-bold gradient-text">Twitch Tools</span>
          </Link>
          
          <NavContent />
        </div>
      </aside>
    </>
  )
}

