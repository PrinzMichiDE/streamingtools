import { notFound } from 'next/navigation'
import { OverlayType } from '@/lib/generated/prisma/enums'

interface OverlayPageProps {
  params: Promise<{
    type: string
    userId: string
  }>
}

// Map URL params to OverlayType enum
const overlayTypeMap: Record<string, OverlayType> = {
  chat: 'CHAT',
  alerts: 'ALERTS',
  goals: 'GOALS',
  countdown: 'COUNTDOWN',
  viewer: 'VIEWER_COUNTER',
  health: 'STREAM_HEALTH',
  'hype-train': 'HYPE_TRAIN',
  schedule: 'SCHEDULE',
  'game-info': 'GAME_INFO',
  'death-counter': 'DEATH_COUNTER',
  'kill-counter': 'KILL_COUNTER',
  'health-bar': 'HEALTH_BAR',
  speedrun: 'SPEEDRUN_TIMER',
  'score-tracker': 'SCORE_TRACKER',
  location: 'LOCATION',
  speed: 'SPEED',
  altitude: 'ALTITUDE',
  compass: 'COMPASS',
  weather: 'WEATHER',
  battery: 'BATTERY',
  'trip-stats': 'TRIP_STATS',
  topic: 'TOPIC',
  'question-queue': 'QUESTION_QUEUE',
  'drawing-canvas': 'DRAWING_CANVAS',
  'color-palette': 'COLOR_PALETTE',
  'art-progress': 'ART_PROGRESS',
  'now-playing': 'NOW_PLAYING',
  'song-queue': 'SONG_QUEUE',
  bpm: 'BPM',
  waveform: 'WAVEFORM',
}

export default async function OverlayPage({ params }: OverlayPageProps) {
  const { type, userId } = await params
  const overlayType = overlayTypeMap[type.toLowerCase()]
  
  if (!overlayType) {
    notFound()
  }

  // This will be replaced with actual overlay components
  return (
    <div className="w-full h-full bg-transparent">
      <div className="text-white p-4">
        <p>Overlay: {overlayType}</p>
        <p>User ID: {userId}</p>
        <p className="text-xs text-gray-400 mt-2">
          Overlay-Komponente wird geladen...
        </p>
      </div>
    </div>
  )
}

