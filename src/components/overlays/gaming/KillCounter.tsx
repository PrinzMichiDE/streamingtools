'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Target } from 'lucide-react'

interface KillCounterProps {
  count: number
  className?: string
  label?: string
}

export const KillCounter: React.FC<KillCounterProps> = ({
  count,
  className,
  label = 'Kills',
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center border border-neon-green/50">
        <Target size={24} className="text-neon-green" />
      </div>
      <div>
        <div className="text-xs text-text-secondary uppercase">{label}</div>
        <div className="text-3xl font-display font-bold text-neon-green text-glow-green">
          {count}
        </div>
      </div>
    </div>
  )
}

