'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const styles = {
    success: 'bg-neon-green/20 border-neon-green text-neon-green',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    info: 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan',
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        'glass border rounded-lg p-4 flex items-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.5)]',
        'animate-in slide-in-from-top-5 fade-in-0 duration-300',
        styles[type]
      )}
    >
      <Icon size={20} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}

