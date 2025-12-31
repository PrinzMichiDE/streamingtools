'use client'

import React from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

interface HealthBarProps {
  current: number
  max: number
  label?: string
  className?: string
  showNumbers?: boolean
}

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  label = 'Health',
  className,
  showNumbers = true,
}) => {
  const percentage = (current / max) * 100
  const colorClass = percentage > 50 ? 'from-neon-green to-neon-cyan' : percentage > 25 ? 'from-neon-orange to-neon-yellow' : 'from-red-500 to-red-600'

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          {showNumbers && (
            <span className="text-sm font-mono text-neon-purple">
              {current} / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-6 bg-bg-secondary rounded-full overflow-hidden border border-neon-purple/30">
        <div
          className={cn(
            'h-full bg-gradient-to-r transition-all duration-500 ease-out',
            `bg-gradient-to-r ${colorClass}`,
            'shadow-[0_0_20px_rgba(145,70,255,0.6)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

