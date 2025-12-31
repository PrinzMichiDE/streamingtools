'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('twitch', { callbackUrl, redirect: true })
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Authentifizierungskonfiguration fehlerhaft. Bitte kontaktiere den Support.'
      case 'AccessDenied':
        return 'Zugriff verweigert. Bitte überprüfe deine Berechtigungen.'
      case 'Verification':
        return 'Verifizierung fehlgeschlagen. Bitte versuche es erneut.'
      default:
        return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
    }
  }

  return (
    <PageWrapper className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-2xl mb-4 shadow-glow-purple">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-3">
            Twitch Streamer Tools
          </h1>
          <p className="text-text-secondary text-lg">
            Professionelle Overlays und Tools für deinen Stream
          </p>
        </div>

        <Card glow className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 mb-1">Anmeldung fehlgeschlagen</p>
                <p className="text-xs text-red-300">{getErrorMessage(error)}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
                Mit Twitch anmelden
              </h2>
              <p className="text-sm text-text-secondary">
                Melde dich mit deinem Twitch-Account an, um auf alle Features zuzugreifen.
              </p>
            </div>

            <Button 
              size="lg" 
              glow 
              loading={isLoading}
              className="w-full"
              onClick={handleSignIn}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V9.429h3.428V24h5.143V4.286L11.143 0z"/>
                </svg>
              }
              iconPosition="left"
            >
              Mit Twitch anmelden
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-neon-purple/20">
            <p className="text-xs text-text-muted text-center leading-relaxed">
              Durch die Anmeldung stimmst du unseren{' '}
              <a href="/terms" className="text-neon-purple hover:text-neon-cyan transition-colors">
                Nutzungsbedingungen
              </a>{' '}
              und der{' '}
              <a href="/privacy" className="text-neon-purple hover:text-neon-cyan transition-colors">
                Datenschutzerklärung
              </a>{' '}
              zu.
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Benötigst du Hilfe?{' '}
            <a href="/support" className="text-neon-cyan hover:text-neon-purple transition-colors">
              Kontaktiere den Support
            </a>
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <PageWrapper className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Lade...</p>
        </div>
      </PageWrapper>
    }>
      <LoginForm />
    </Suspense>
  )
}

