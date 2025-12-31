'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Page wrapper component with consistent layout and animations.
 * 
 * Provides a container with proper spacing and fade-in animations
 * following the design system.
 * 
 * @component
 */
interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  container?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className,
  container = false,
  maxWidth = 'full'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn('min-h-screen bg-bg-primary', className)}>
      <div className={cn(
        'animate-fade-in',
        container && 'mx-auto px-4 md:px-6 lg:px-8',
        container && maxWidthClasses[maxWidth]
      )}>
        {children}
      </div>
    </div>
  )
}

