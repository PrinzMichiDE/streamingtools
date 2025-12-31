'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, Square } from 'lucide-react'

interface SpeedrunTimerProps {
  startTime?: Date
  splits?: Array<{ name: string; time: number }>
  className?: string
}

export const SpeedrunTimer: React.FC<SpeedrunTimerProps> = ({
  startTime,
  splits = [],
  className,
}) => {
  const [isRunning, setIsRunning] = useState(!!startTime)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      if (startTime) {
        const now = new Date().getTime()
        const start = startTime.getTime()
        setElapsed(Math.floor((now - start) / 1000))
      } else {
        setElapsed((prev) => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className={cn('text-center', className)}>
      <div className="text-5xl font-display font-bold text-neon-purple text-glow-purple mb-4">
        {formatTime(elapsed)}
      </div>
      {splits.length > 0 && (
        <div className="space-y-2">
          {splits.map((split, index) => (
            <div key={index} className="flex justify-between text-sm text-text-secondary">
              <span>{split.name}</span>
              <span className="font-mono">{formatTime(split.time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

