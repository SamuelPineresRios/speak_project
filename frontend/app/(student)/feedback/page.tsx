'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FeedbackScreen } from '@/components/FeedbackScreen'

function FeedbackContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const evalId = params.get('evaluation_id')
    const missionId = params.get('mission_id')
    const responseId = params.get('response_id')
    if (!evalId || !missionId) { router.push('/missions'); return }

    // Fetch data directly from JSON db via API
    Promise.all([
      fetch(`/api/missions/${missionId}`).then(r => r.json()),
      fetch(`/api/evaluations/${evalId}`).then(r => r.json()),
      fetch(`/api/responses/${responseId}`).then(r => r.json()),
    ]).then(([missionData, evalData, respData]) => {
      const resp = respData.response
      setData({ 
        evaluation: evalData.evaluation, 
        missionTitle: missionData.mission?.title ?? '', 
        studentResponse: resp?.text_content ?? '',
      })
      setLoading(false)
    }).catch(() => { router.push('/missions') })
  }, [params, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin"/></div>
  if (!data) return null
  return <FeedbackScreen 
    evaluation={data.evaluation} 
    missionTitle={data.missionTitle} 
    studentResponse={data.studentResponse}
    onTryAgain={() => router.back()} 
    onNextMission={() => router.push('/missions')}
  />
}

export default function FeedbackPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin"/></div>}><FeedbackContent /></Suspense>
}
