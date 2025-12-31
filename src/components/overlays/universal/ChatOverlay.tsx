'use client'

import React, { useEffect, useRef, useState } from 'react'
import tmi from 'tmi.js'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  username: string
  message: string
  color?: string
  timestamp: Date
}

interface ChatOverlayProps {
  channel: string
  maxMessages?: number
  className?: string
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  channel,
  maxMessages = 10,
  className,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const clientRef = useRef<tmi.Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const client = new tmi.Client({
      channels: [channel],
    })

    client.on('message', (channel, tags, message, self) => {
      const chatMessage: ChatMessage = {
        id: tags.id || `${Date.now()}-${Math.random()}`,
        username: tags['display-name'] || tags.username || 'Anonymous',
        message: message,
        color: tags.color || '#9146ff',
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const newMessages = [...prev, chatMessage]
        return newMessages.slice(-maxMessages)
      })
    })

    client.connect().catch(console.error)
    clientRef.current = client

    return () => {
      client.disconnect()
    }
  }, [channel, maxMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={cn('w-full h-full overflow-hidden bg-transparent', className)}>
      <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 animate-in fade-in-0 slide-in-from-right-4 duration-300"
          >
            <span
              className="font-bold text-sm"
              style={{ color: msg.color }}
            >
              {msg.username}:
            </span>
            <span className="text-white text-sm break-words">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

