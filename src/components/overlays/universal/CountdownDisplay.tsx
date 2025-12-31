'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownDisplayProps {
  targetTime: Date
  className?: string
  onComplete?: () => void
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  targetTime,
  className,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetTime.getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        onComplete?.()
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetTime, onComplete])

  if (!timeLeft) {
    return <div className={cn('text-white', className)}>Loading...</div>
  }

  const { days, hours, minutes, seconds } = timeLeft

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {days > 0 && (
        <div className="text-center">
          <div className="text-4xl font-display font-bold text-neon-purple text-glow-purple">
            {String(days).padStart(2, '0')}
          </div>
          <div className="text-xs text-text-secondary uppercase">Days</div>
        </div>
      )}
      <div className="text-center">
        <div className="text-4xl font-display font-bold text-neon-purple text-glow-purple">
          {String(hours).padStart(2, '0')}
        </div>
        <div className="text-xs text-text-secondary uppercase">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-display font-bold text-neon-purple text-glow-purple">
          {String(minutes).padStart(2, '0')}
        </div>
        <div className="text-xs text-text-secondary uppercase">Minutes</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-display font-bold text-neon-purple text-glow-purple">
          {String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xs text-text-secondary uppercase">Seconds</div>
      </div>
    </div>
  )
}

