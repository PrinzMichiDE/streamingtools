'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface ViewerCounterProps {
  channel: string
  className?: string
}

export const ViewerCounter: React.FC<ViewerCounterProps> = ({
  channel,
  className,
}) => {
  const [viewers, setViewers] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // TODO: Fetch actual viewer count from Twitch API
    // For now, using mock data
    const fetchViewers = async () => {
      // Mock implementation
      const mockViewers = Math.floor(Math.random() * 1000) + 100
      setViewers(mockViewers)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500)
    }

    fetchViewers()
    const interval = setInterval(fetchViewers, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [channel])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Eye size={24} className="text-neon-purple" />
      <div>
        <div className="text-xs text-text-secondary uppercase">Viewers</div>
        <div
          className={cn(
            'text-3xl font-display font-bold text-neon-purple text-glow-purple transition-all duration-300',
            isAnimating && 'scale-110'
          )}
        >
          {viewers.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

