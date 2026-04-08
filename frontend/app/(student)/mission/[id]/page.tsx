'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { MissionScreen } from '@/components/MissionScreen'

export default function MissionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [mission, setMission] = useState<any>(null)
  const [error, setError] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const search = useSearchParams()
  const groupId = search.get('group_id')

  useEffect(() => {
    console.log('[Mission Page] Loading mission:', params.id)
    fetch(`/api/missions/${params.id}`)
      .then((r) => {
        console.log('[Mission Page] Response status:', r.status)
        return r.json()
      })
      .then((d) => {
        console.log('[Mission Page] Response data:', d)
        if (d.error) {
          setError(d.error)
        } else {
          setMission(d.mission)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('[Mission Page] Fetch error:', err)
        setError('Failed to load mission: ' + err.message)
        setLoading(false)
      })
  }, [params.id])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-coral font-bold">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-cyan/20 text-cyan rounded hover:bg-cyan/30"
        >
          Volver
        </button>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-light">Misión no encontrada</p>
      </div>
    )
  }

  return (
    <MissionScreen
      mission={mission}
      studentId={user.id}
      groupId={groupId ?? undefined}
    />
  )
}

