'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  showValue?: boolean
  onChange?: (value: number) => void
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = false, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(Number(e.target.value))
    }

    return (
      <div className="w-full">
        {label && (
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-text-secondary">{label}</label>
            {showValue && props.value !== undefined && (
              <span className="text-sm text-neon-purple font-mono">{props.value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          className={cn(
            'w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer',
            'accent-neon-purple',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-purple',
            '[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(145,70,255,0.6)]',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-neon-purple [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
