'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { signOut } from 'next-auth/react'
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Bell,
  HelpCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Header component with user menu and navigation.
 * 
 * Displays user information, notifications, and provides quick access
 * to settings and logout functionality.
 * 
 * @component
 */
export const Header: React.FC = () => {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const user = session?.user

  return (
    <header className="h-16 bg-bg-secondary/95 backdrop-blur-md border-b border-neon-purple/20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-display font-bold text-text-primary hidden sm:block">
          Streamer Dashboard
        </h1>
        <h1 className="text-lg font-display font-bold text-text-primary sm:hidden">
          Dashboard
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-card transition-colors focus:outline-2 focus:outline-neon-purple focus:outline-offset-2"
            aria-label="User menu"
            aria-expanded={isMenuOpen}
          >
            {user?.image ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-neon-purple/50">
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center border border-neon-purple/50">
                <User size={18} className="text-neon-purple" />
              </div>
            )}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-text-primary">
                {user?.name || 'Streamer'}
              </span>
              <span className="text-xs text-text-secondary">
                {user?.email || ''}
              </span>
            </div>
            <ChevronDown 
              size={16} 
              className={cn(
                'text-text-secondary transition-transform',
                isMenuOpen && 'rotate-180'
              )} 
            />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-bg-card backdrop-blur-md border border-neon-purple/20 rounded-xl shadow-glow-purple overflow-hidden animate-fade-in animate-slide-down">
              <div className="p-4 border-b border-neon-purple/20">
                <p className="text-sm font-medium text-text-primary">{user?.name || 'Streamer'}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
              </div>
              
              <div className="py-2">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={16} />
                  Einstellungen
                </Link>
                <Link
                  href="/dashboard/help"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HelpCircle size={16} />
                  Hilfe & Support
                </Link>
              </div>

              <div className="border-t border-neon-purple/20 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  icon={<LogOut size={16} />}
                  iconPosition="left"
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                >
                  Abmelden
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

