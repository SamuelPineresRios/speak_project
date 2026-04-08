'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { MissionScreen } from '@/components/MissionScreen'

export default function MissionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const search = useSearchParams()
  const groupId = search.get('group_id')

  useEffect(() => {
    fetch(`/api/missions/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setMission(d.mission)
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

