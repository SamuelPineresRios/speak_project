import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mission, userLevel } = await req.json()

    if (!mission) {
      return NextResponse.json(
        { error: 'Mission required' },
        { status: 400 }
      )
    }

    // Generate briefing content based on mission and user level
    const briefing = {
      key_verbs: generateKeyVerbs(mission.cefr_level),
      useful_phrases: generateUsefulPhrases(mission.cefr_level),
      grammar_tips: generateGrammarTips(mission.cefr_level),
      estimated_duration_minutes: Math.ceil(mission.base_duration_seconds / 60),
    }

    console.log('[Briefing API] Generated briefing for mission:', mission.id)
    return NextResponse.json(briefing)
  } catch (e) {
    console.error('[Briefing API] Error:', e)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateKeyVerbs(cefrLevel: string): string[] {
  const verbsByLevel: Record<string, string[]> = {
    A1: ['want', 'need', 'go', 'see', 'do', 'make'],
    A2: ['help', 'understand', 'ask', 'know', 'think', 'tell'],
    B1: ['suggest', 'recommend', 'prefer', 'require', 'improve', 'confirm'],
    B2: ['facilitate', 'negotiate', 'elaborate', 'emphasize', 'clarify', 'address'],
  }
  return verbsByLevel[cefrLevel] || verbsByLevel['A2']
}

function generateUsefulPhrases(cefrLevel: string): string[] {
  const phrasesByLevel: Record<string, string[]> = {
    A1: ['I want...', 'I need...', 'Can you help?', 'Thank you', 'Please...'],
    A2: ['Could you...?', 'I understand', 'I would like...', 'How can I...?', 'What do you mean?'],
    B1: ['I was wondering if...', 'That makes sense', 'In that case...', 'Let me think about it', 'Could you elaborate?'],
    B2: ['I appreciate that perspective', 'To put it another way...', 'Given that...', 'In retrospect...', 'That\'s a compelling point'],
  }
  return phrasesByLevel[cefrLevel] || phrasesByLevel['A2']
}

function generateGrammarTips(cefrLevel: string): string {
  const tipsByLevel: Record<string, string> = {
    A1: 'Focus on present tense and basic questions (Do you...? Can you...?)',
    A2: 'Practice past tense (did, was/were) and polite requests with "could"',
    B1: 'Use present perfect (have/has) and second conditional (If I..., I would...)',
    B2: 'Focus on passive voice and complex sentence structures with dependent clauses',
  }
  return tipsByLevel[cefrLevel] || tipsByLevel['A2']
}
