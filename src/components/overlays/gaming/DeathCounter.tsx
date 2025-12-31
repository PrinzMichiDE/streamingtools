'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skull } from 'lucide-react'

interface DeathCounterProps {
  count: number
  className?: string
  label?: string
}

export const DeathCounter: React.FC<DeathCounterProps> = ({
  count,
  className,
  label = 'Deaths',
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/50">
        <Skull size={24} className="text-red-400" />
      </div>
      <div>
        <div className="text-xs text-text-secondary uppercase">{label}</div>
        <div className="text-3xl font-display font-bold text-red-400 text-glow-purple">
          {count}
        </div>
      </div>
    </div>
  )
}

