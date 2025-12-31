'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Gauge } from 'lucide-react'

interface SpeedGaugeProps {
  speed: number // in km/h
  className?: string
  maxSpeed?: number
}

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  speed,
  className,
  maxSpeed = 200,
}) => {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  const angle = (percentage / 100) * 180 - 90 // -90 to 90 degrees

  return (
    <div className={cn('relative w-48 h-48', className)}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 20 180 A 160 160 0 0 1 180 180"
          fill="none"
          stroke="rgba(145, 70, 255, 0.2)"
          strokeWidth="20"
        />
        {/* Speed arc */}
        <path
          d={`M 20 180 A 160 160 0 ${percentage > 50 ? 1 : 0} 1 ${180 + Math.sin((angle * Math.PI) / 180) * 160} ${180 - Math.cos((angle * Math.PI) / 180) * 160}`}
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9146ff" />
            <stop offset="100%" stopColor="#00ffff" />
          </linearGradient>
        </defs>
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + Math.sin((angle * Math.PI) / 180) * 80}
          y2={100 - Math.cos((angle * Math.PI) / 180) * 80}
          stroke="#00ffff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx="100" cy="100" r="8" fill="#9146ff" />
      </svg>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-3xl font-display font-bold text-neon-purple">
          {Math.round(speed)}
        </div>
        <div className="text-xs text-text-secondary">km/h</div>
      </div>
    </div>
  )
}

