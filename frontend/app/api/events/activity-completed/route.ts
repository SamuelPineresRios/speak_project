import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook endpoint that sends completed activity data to n8n
 * n8n will forward this to Google Sheets
 */

interface ActivityCompletedEvent {
  activityType: 'mission' | 'story' | 'guide'
  activityId: string
  activityName: string
  studentId: string
  studentEmail: string
  studentName: string
  studentLevel: string // A1, A2, B1, B2, C1
  groupId: string
  groupName: string
  completedAt: string
  duration_seconds: number
  
  // Responses during activity
  studentResponses: string[] // All student messages
  aiResponses: string[] // All AI character responses
  
  // Feedback from AI
  feedbacks: string[]
  ratings: number[] // 1-5 for each turn
  averageRating: number
  
  // Progress
  progressPercentage: number
  isCompleted: boolean
  
  // Evaluation scores (if available)
  comprehensibilityScore?: number
  grammarScore?: number
  lexicalRichnessScore?: number
  xpAwarded?: number
}

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/speak-activity'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ActivityCompletedEvent

    // Validate required fields
    if (!body.studentId || !body.activityId || !body.groupId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, activityId, or groupId' },
        { status: 400 }
      )
    }

    console.log('[Activity Completed Event]', {
      student: body.studentEmail,
      activity: body.activityName,
      type: body.activityType,
      rating: body.averageRating
    })

    // Send to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        timestamp: new Date().toISOString(),
        source: 'speak-app'
      })
    }).catch(err => {
      // n8n being offline is not a blocker - still return success
      console.warn('[n8n Webhook] Could not reach webhook. Data will be captured on next sync.', err.message)
      return null
    })

    if (n8nResponse && !n8nResponse.ok) {
      console.warn(`[n8n Webhook] Returned status ${n8nResponse.status}`)
    }

    // Always return success - activity is recorded locally anyway
    return NextResponse.json({
      success: true,
      message: 'Activity recorded',
      n8nSent: n8nResponse?.ok ?? false
    })

  } catch (error: any) {
    console.error('[Activity Event Error]', error)
    return NextResponse.json(
      { error: `Event recording failed: ${error.message}` },
      { status: 500 }
    )
  }
}
