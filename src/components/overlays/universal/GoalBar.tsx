'use client'

import React from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

interface GoalBarProps {
  title: string
  current: number
  target: number
  className?: string
  showNumbers?: boolean
}

export const GoalBar: React.FC<GoalBarProps> = ({
  title,
  current,
  target,
  className,
  showNumbers = true,
}) => {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-display font-bold text-text-primary">{title}</h3>
        {showNumbers && (
          <span className="text-sm font-mono text-neon-purple">
            {current} / {target}
          </span>
        )}
      </div>
      <ProgressBar value={current} max={target} glow />
      <div className="mt-1 text-xs text-text-secondary text-right">
        {percentage.toFixed(1)}% erreicht
      </div>
    </div>
  )
}

