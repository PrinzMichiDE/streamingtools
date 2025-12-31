'use client'

import React from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

interface PollOption {
  id: string
  text: string
  votes: number
  color?: string
}

interface PollDisplayProps {
  question: string
  options: PollOption[]
  totalVotes: number
  className?: string
}

export const PollDisplay: React.FC<PollDisplayProps> = ({
  question,
  options,
  totalVotes,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-xl font-display font-bold text-text-primary mb-4">
        {question}
      </h3>
      <div className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-text-primary">
                  {option.text}
                </span>
                <span className="text-sm font-mono text-neon-purple">
                  {option.votes} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <ProgressBar value={option.votes} max={totalVotes} glow />
            </div>
          )
        })}
      </div>
      <div className="mt-4 text-xs text-text-secondary text-center">
        Total Votes: {totalVotes}
      </div>
    </div>
  )
}

