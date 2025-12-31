'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-12 h-6 rounded-full transition-all duration-300',
            checked
              ? 'bg-neon-purple shadow-[0_0_15px_rgba(145,70,255,0.6)]'
              : 'bg-bg-secondary border border-neon-purple/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300',
              checked && 'translate-x-6'
            )}
          />
        </div>
      </div>
      <div className="flex flex-col">
        {label && (
          <span className="text-sm text-text-secondary">{label}</span>
        )}
        {description && (
          <span className="text-xs text-text-muted mt-0.5">{description}</span>
        )}
      </div>
    </label>
  )
}
