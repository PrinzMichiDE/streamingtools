'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import {
  HelpCircle,
  ArrowLeft,
  Copy,
  Check,
  MessageSquare,
  ThumbsUp,
  Trash2,
  ExternalLink,
  ChevronUp,
  User,
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  text: string
  author: string
  votes: number
  isAnswered: boolean
  timestamp: Date
}

/**
 * Question queue configuration page.
 * Collect and display questions from chat.
 */
export default function QuestionsPage() {
  const [copied, setCopied] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: 'Welches Framework nutzt du für das Frontend?', author: 'CuriousViewer', votes: 12, isAnswered: false, timestamp: new Date() },
    { id: '2', text: 'Wie lange programmierst du schon?', author: 'NewCoder123', votes: 8, isAnswered: false, timestamp: new Date() },
    { id: '3', text: 'Kannst du das Design System erklären?', author: 'DesignFan', votes: 5, isAnswered: true, timestamp: new Date() },
  ])
  const [config, setConfig] = useState({
    showVotes: true,
    showAuthor: true,
    autoCollect: true,
    keyword: '!frage',
    maxQuestions: 10,
    fontSize: 16,
  })

  const upvoteQuestion = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, votes: q.votes + 1 } : q
    ))
  }

  const markAnswered = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isAnswered: true } : q
    ))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const sortedQuestions = [...questions].sort((a, b) => b.votes - a.votes)
  const unanswered = sortedQuestions.filter(q => !q.isAnswered)
  const answered = sortedQuestions.filter(q => q.isAnswered)

  const overlayUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/overlay/questions/demo`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/creative" 
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
            <HelpCircle size={20} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">
              Question Queue
            </h1>
            <p className="text-sm text-text-secondary">
              Sammle und zeige Fragen aus dem Chat
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="cyan">{unanswered.length} offen</Badge>
          <Badge variant="green">{answered.length} beantwortet</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unanswered Questions */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Offene Fragen
            </h2>
            <div className="space-y-3">
              {unanswered.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                  Keine offenen Fragen. Nutze {config.keyword} im Chat!
                </p>
              ) : (
                unanswered.map((question) => (
                  <div 
                    key={question.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors"
                  >
                    {/* Votes */}
                    {config.showVotes && (
                      <button
                        onClick={() => upvoteQuestion(question.id)}
                        className="flex flex-col items-center gap-1 text-text-muted hover:text-neon-cyan transition-colors"
                      >
                        <ChevronUp size={20} />
                        <span className="text-sm font-bold">{question.votes}</span>
                      </button>
                    )}
                    
                    {/* Question Content */}
                    <div className="flex-1">
                      <p className="text-text-primary">{question.text}</p>
                      {config.showAuthor && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                          <User size={12} />
                          <span>{question.author}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => markAnswered(question.id)}
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Answered Questions */}
          {answered.length > 0 && (
            <Card className="opacity-75">
              <h2 className="text-lg font-display font-bold text-text-primary mb-4">
                Beantwortete Fragen
              </h2>
              <div className="space-y-3">
                {answered.map((question) => (
                  <div 
                    key={question.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-bg-secondary/30"
                  >
                    <Check size={20} className="text-neon-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-text-secondary line-through">{question.text}</p>
                      <p className="text-xs text-text-muted mt-1">von {question.author}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <h2 className="text-lg font-display font-bold text-text-primary mb-4">
              Einstellungen
            </h2>
            <div className="space-y-4">
              <Toggle
                label="Automatisch sammeln"
                description="Fragen aus dem Chat erfassen"
                checked={config.autoCollect}
                onChange={(checked) => setConfig({ ...config, autoCollect: checked })}
              />
              {config.autoCollect && (
                <Input
                  label="Chat-Befehl"
                  value={config.keyword}
                  onChange={(e) => setConfig({ ...config, keyword: e.target.value })}
                  helperText="z.B. !frage Wie geht das?"
                />
              )}
              <Toggle
                label="Votes anzeigen"
                checked={config.showVotes}
                onChange={(checked) => setConfig({ ...config, showVotes: checked })}
              />
              <Toggle
                label="Autor anzeigen"
                checked={config.showAuthor}
                onChange={(checked) => setConfig({ ...config, showAuthor: checked })}
              />
            </div>
          </Card>

          {/* Overlay URL */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink size={18} className="text-neon-purple" />
              <h2 className="text-lg font-display font-bold text-text-primary">
                Overlay URL
              </h2>
            </div>
            <div className="flex gap-2">
              <Input
                value={overlayUrl}
                readOnly
                className="flex-1 text-xs font-mono"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={copyToClipboard}
                icon={copied ? <Check size={14} /> : <Copy size={14} />}
              />
            </div>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
            <h3 className="text-sm font-bold text-text-primary mb-2">💡 Tipps</h3>
            <ul className="text-xs text-text-secondary space-y-2">
              <li>• Zuschauer können mit {config.keyword} Fragen stellen</li>
              <li>• Fragen werden nach Votes sortiert</li>
              <li>• Markiere beantwortete Fragen als erledigt</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

