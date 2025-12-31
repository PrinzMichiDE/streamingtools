import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <div className={cn('glass rounded-lg p-4 border border-neon-purple/20', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && (
          <div className="w-8 h-8 bg-neon-purple/20 rounded-lg flex items-center justify-center">
            <Icon size={16} className="text-neon-purple" />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-display font-bold text-text-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-neon-green' : 'text-red-400'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </div>
  )
}

