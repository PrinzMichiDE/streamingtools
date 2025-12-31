import React from 'react'
import { cn } from '@/lib/utils'

/**
 * ProgressBar component for displaying progress indicators.
 * 
 * Supports multiple color variants and glow effects following the design system.
 * Also supports custom hex colors via the customColor prop.
 * 
 * @component
 */
interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  glow?: boolean
  color?: 'purple' | 'cyan' | 'green' | 'pink' | 'orange' | string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  glow = true,
  color = 'purple',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const predefinedColors = ['purple', 'cyan', 'green', 'pink', 'orange']
  const isPredefinedColor = predefinedColors.includes(color)

  const colorClasses: Record<string, string> = {
    purple: 'bg-gradient-to-r from-neon-purple to-neon-cyan',
    cyan: 'bg-gradient-to-r from-neon-cyan to-neon-purple',
    green: 'bg-gradient-to-r from-neon-green to-neon-cyan',
    pink: 'bg-gradient-to-r from-neon-pink to-neon-purple',
    orange: 'bg-gradient-to-r from-neon-orange to-neon-pink',
  }

  const glowClasses: Record<string, string> = {
    purple: 'shadow-[0_0_20px_rgba(145,70,255,0.6)]',
    cyan: 'shadow-[0_0_20px_rgba(0,255,255,0.6)]',
    green: 'shadow-[0_0_20px_rgba(0,255,136,0.6)]',
    pink: 'shadow-[0_0_20px_rgba(255,0,255,0.6)]',
    orange: 'shadow-[0_0_20px_rgba(255,107,0,0.6)]',
  }
  
  // Generate style for custom colors (hex values)
  const customStyle = !isPredefinedColor ? {
    backgroundColor: color,
    boxShadow: glow ? `0 0 20px ${color}60` : undefined,
  } : undefined
  
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className="w-full h-4 bg-bg-secondary rounded-full overflow-hidden border border-neon-purple/30">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            isPredefinedColor && colorClasses[color],
            isPredefinedColor && glow && glowClasses[color]
          )}
          style={{ 
            width: `${percentage}%`,
            ...customStyle
          }}
        />
      </div>
    </div>
  )
}
