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
      onComplete={async (evaluation, transcript) => {
        try {
          const res = await fetch(`/api/missions/${mission.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              response_text: transcript,
              student_id: user.id,
              group_id: groupId ?? null,
              time_taken_seconds: null,
            }),
          })

          const data = await res.json()

          if (!res.ok) {
            console.error('Submission error', data)
            alert('Submission failed: ' + (data?.error || 'Unknown error'))
            return
          }

          const p = new URLSearchParams({
            mission_id: mission.id,
            response_id: data.response_id,
            evaluation_id: data.evaluation_id,
          })
          await router.push(`/feedback?${p}`)
        } catch (err) {
          console.error('Error submitting mission:', err)
          alert('Error submitting mission. Please try again.')
        }
      }}
    />
  )
}

