'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'

interface BatteryIndicatorProps {
  level?: number // 0-100
  className?: string
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  level,
  className,
}) => {
  const [batteryLevel, setBatteryLevel] = useState(level ?? 100)

  useEffect(() => {
    if (level !== undefined) {
      setBatteryLevel(level)
      return
    }

    // Try to get battery level from browser API
    if ('getBattery' in navigator) {
      ;(navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }
  }, [level])

  const getBatteryIcon = () => {
    if (batteryLevel > 75) return BatteryFull
    if (batteryLevel > 50) return BatteryMedium
    if (batteryLevel > 25) return BatteryLow
    return Battery
  }

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-neon-green'
    if (batteryLevel > 25) return 'text-neon-orange'
    return 'text-red-500'
  }

  const Icon = getBatteryIcon()
  const colorClass = getBatteryColor()

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Icon size={32} className={colorClass} />
      <div>
        <div className="text-xs text-text-secondary uppercase">Battery</div>
        <div className={cn('text-2xl font-display font-bold', colorClass)}>
          {batteryLevel}%
        </div>
      </div>
    </div>
  )
}

