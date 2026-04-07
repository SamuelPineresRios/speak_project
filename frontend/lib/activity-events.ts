/**
 * Helper para enviar eventos de actividades completadas a n8n
 */

interface ActivityEventPayload {
  activityType: 'mission' | 'story' | 'guide'
  activityId: string
  activityName: string
  studentId: string
  studentEmail: string
  studentName: string
  studentLevel: string
  groupId: string
  groupName: string
  completedAt: string
  duration_seconds: number
  studentResponses: string[]
  aiResponses: string[]
  feedbacks: string[]
  ratings: number[]
  averageRating: number
  progressPercentage: number
  isCompleted: boolean
  comprehensibilityScore?: number
  grammarScore?: number
  lexicalRichnessScore?: number
  xpAwarded?: number
}

export async function sendActivityCompletedEvent(payload: ActivityEventPayload) {
  try {
    const response = await fetch('/api/events/activity-completed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('Failed to send activity event:', await response.json())
      return false
    }

    console.log('✅ Activity event sent successfully')
    return true
  } catch (error) {
    console.error('Error sending activity event:', error)
    // Don't throw - let the app continue even if event fails
    return false
  }
}

/**
 * Extract activity data from MissionScreen state
 */
export function buildActivityEventFromMessages(
  messages: Array<{ role: string; content: string; rating?: number; feedback?: string }>,
  mission: { id: string; title: string; cefr_level: string },
  user: { id: string; email: string; full_name: string; cefr_level?: string },
  group: { id: string; name: string },
  startTime: number,
  progressPercentage: number
): ActivityEventPayload {
  const userResponses = messages.filter(m => m.role === 'user').map(m => m.content)
  const aiResponses = messages.filter(m => m.role === 'assistant').map(m => m.content)
  const feedbacks = messages.filter(m => m.feedback).map(m => m.feedback || '')
  const ratings = messages.filter(m => m.rating).map(m => m.rating || 0)
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

  return {
    activityType: 'mission',
    activityId: mission.id,
    activityName: mission.title,
    studentId: user.id,
    studentEmail: user.email,
    studentName: user.full_name || 'Student',
    studentLevel: user.cefr_level || mission.cefr_level,
    groupId: group.id,
    groupName: group.name,
    completedAt: new Date().toISOString(),
    duration_seconds: Math.floor((Date.now() - startTime) / 1000),
    studentResponses: userResponses,
    aiResponses: aiResponses,
    feedbacks: feedbacks,
    ratings: ratings,
    averageRating: avgRating,
    progressPercentage: progressPercentage,
    isCompleted: true
  }
}
