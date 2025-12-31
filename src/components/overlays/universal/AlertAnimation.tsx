'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Gift, Heart, Zap, Users } from 'lucide-react'

export type AlertType = 'follow' | 'sub' | 'resub' | 'bits' | 'raid'

interface AlertAnimationProps {
  type: AlertType
  username: string
  message?: string
  amount?: number
  duration?: number
  onComplete: () => void
  className?: string
}

const alertIcons = {
  follow: Users,
  sub: Gift,
  resub: Gift,
  bits: Zap,
  raid: Users,
}

const alertColors = {
  follow: 'text-neon-cyan',
  sub: 'text-neon-purple',
  resub: 'text-neon-pink',
  bits: 'text-neon-yellow',
  raid: 'text-neon-green',
}

export const AlertAnimation: React.FC<AlertAnimationProps> = ({
  type,
  username,
  message,
  amount,
  duration = 5000,
  onComplete,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = alertIcons[type]
  const colorClass = alertColors[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500) // Wait for fade out
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center pointer-events-none z-50',
        className
      )}
    >
      <div
        className={cn(
          'glass rounded-2xl p-8 border-2 min-w-[400px]',
          'animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-10 duration-500',
          isVisible && 'animate-out fade-out-0 zoom-out-95 duration-500',
          type === 'follow' && 'border-neon-cyan shadow-[0_0_40px_rgba(0,255,255,0.5)]',
          type === 'sub' && 'border-neon-purple shadow-[0_0_40px_rgba(145,70,255,0.5)]',
          type === 'resub' && 'border-neon-pink shadow-[0_0_40px_rgba(255,0,255,0.5)]',
          type === 'bits' && 'border-neon-yellow shadow-[0_0_40px_rgba(255,255,0,0.5)]',
          type === 'raid' && 'border-neon-green shadow-[0_0_40px_rgba(0,255,136,0.5)]'
        )}
      >
        <div className="text-center">
          <div className={cn('flex justify-center mb-4', colorClass)}>
            <Icon size={64} className="animate-bounce" />
          </div>
          <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
            {type === 'follow' && 'Neuer Follower!'}
            {type === 'sub' && 'Neuer Subscriber!'}
            {type === 'resub' && 'Resub!'}
            {type === 'bits' && 'Bits gespendet!'}
            {type === 'raid' && 'Raid!'}
          </h2>
          <p className="text-2xl font-display font-semibold text-neon-purple mb-2">
            {username}
          </p>
          {message && (
            <p className="text-text-secondary mb-2">{message}</p>
          )}
          {amount && (
            <p className="text-xl font-mono text-neon-cyan">
              {amount.toLocaleString()} {type === 'bits' ? 'Bits' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

