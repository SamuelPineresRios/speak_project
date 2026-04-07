"""
SPEAK Evaluation Service — FastAPI + LangChain + Claude
Endpoint: POST /evaluate
Latency target: P95 <= 2.5s
"""
import json
import logging
import time
import hashlib
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)
logger = logging.getLogger("speak.eval")

# Optional Redis cache
try:
    import redis
    _redis = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        decode_responses=True,
        socket_connect_timeout=1,
    )
    _redis.ping()
    CACHE_AVAILABLE = True
    logger.info("Redis cache connected")
except Exception as e:
    CACHE_AVAILABLE = False
    logger.warning(f"Redis unavailable — running without cache: {e}")

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
import httpx

from prompts import build_system_prompt

# Initialize LLM for evaluations (Anthropic)
llm = ChatAnthropic(
    model="claude-sonnet-4-20250514",
    temperature=0,
    max_tokens=1000,
    timeout=8.0,
    api_key=os.getenv("ANTHROPIC_API_KEY"),
)

# OpenRouter API for conversation (audio mode)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not set — conversation endpoint will fail")

OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo-preview")
OPENROUTER_BASE_URL = "https://openrouter.io/api/v1"

# ---- Schemas ----

class EvaluationRequest(BaseModel):
    response_text: str = Field(..., min_length=1, max_length=2000)
    mission_id: str
    mission_context: str
    student_cefr_level: str = Field(default="B1", pattern="^(A1|A2|B1|B2)$")
    language_feedback: str = Field(default="es", pattern="^(es|en)$")

class EvaluationResponse(BaseModel):
    comprehensibility_score: float
    grammar_score: float
    lexical_richness_score: float
    judgment: str
    feedback_text: str
    detected_structures: list[str]
    cached: bool = False
    latency_ms: int = 0

# ---- Helpers ----

def cache_key(req: EvaluationRequest) -> str:
    h = hashlib.sha256(f"{req.mission_id}:{req.response_text}:{req.student_cefr_level}".encode()).hexdigest()[:16]
    return f"eval:v2:{h}"

def validate_and_coerce(raw: dict, cefr_level: str) -> dict:
    """Validate LLM output and enforce judgment thresholds."""
    from prompts import build_system_prompt  # just for threshold access
    
    THRESHOLDS = {"A1": 60, "A2": 70, "B1": 80, "B2": 85}
    threshold = THRESHOLDS.get(cefr_level, 70)

    cs = float(raw.get("comprehensibility_score", 50))
    gs = float(raw.get("grammar_score", 50))
    ls = float(raw.get("lexical_richness_score", 50))

    # Clamp scores
    cs = max(0.0, min(100.0, cs))
    gs = max(0.0, min(100.0, gs))
    ls = max(0.0, min(100.0, ls))

    # Override judgment based on threshold (source of truth)
    judgment = "ADVANCE" if cs >= threshold else "PAUSE"

    feedback = str(raw.get("feedback_text", "")).strip()
    if not feedback or len(feedback) < 20:
        feedback = f"Tu mensaje fue recibido. {'¡Buen trabajo!' if judgment == 'ADVANCE' else 'Intenta ser un poco más claro en tu próxima respuesta.'}"

    detected = [str(s) for s in raw.get("detected_structures", []) if s][:5]

    return {
        "comprehensibility_score": cs,
        "grammar_score": gs,
        "lexical_richness_score": ls,
        "judgment": judgment,
        "feedback_text": feedback,
        "detected_structures": detected,
    }

# ---- App ----

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SPEAK Evaluation Service starting...")
    yield
    logger.info("SPEAK Evaluation Service shutting down...")

app = FastAPI(title="SPEAK Evaluation Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type", "Authorization"],
)


class StoryEvaluationRequest(BaseModel):
    response_text: str
    mission_id: str
    mission_context: str
    objective: str
    student_cefr_level: str = "B1"

class ConversationTurn(BaseModel):
    role: str  # 'character' or 'user'
    text: str

class ConversationRequest(BaseModel):
    mission_context: str
    character_name: str
    character_role: str
    cefr_level: str = "B1"
    conversation_history: list[ConversationTurn]
    last_user_text: str
    last_judgment: str | None = None
    language_feedback: str = "en"

class ConversationEvaluation(BaseModel):
    comprehensibility_score: float
    grammar_score: float
    lexical_richness_score: float
    feedback_text: str
    detected_structures: list[str] = []

class ConversationResponse(BaseModel):
    character_response: str
    judgment: str
    evaluation: ConversationEvaluation
    is_mission_complete: bool

class PhraseCorrection(BaseModel):
    original: str
    corrected: str
    explanation: str
    is_correct: bool

class Recommendation(BaseModel):
    type: str
    original_phrase: str
    suggestion: str
    reason: str

class RetrySuggestions(BaseModel):
    sentence_starter: str = ""
    key_verbs: list[str] = []

class StoryEvaluationResponse(BaseModel):
    comprehensibility_score: int
    grammar_score: int
    lexical_richness_score: int
    judgment: str
    feedback_text: str
    detected_structures: list[str]
    phrase_correction: PhraseCorrection
    recommendations: list[Recommendation]
    retry_suggestions: RetrySuggestions = Field(default_factory=RetrySuggestions)

# ---- Guide Chat Tutor ----

class GuideChatRequest(BaseModel):
    user_message: str = Field(..., min_length=1, max_length=1000)
    guide_title: str
    guide_context: str  # JSON string with structures, examples, etc.
    cefr_level: str = "B1"
    language_feedback: str = "es"

class GuideChatResponse(BaseModel):
    tutor_response: str
    guide_title: str
    latency_ms: int = 0

def build_guide_tutor_prompt(guide_title: str, guide_context: str, cefr_level: str) -> str:
    """Build prompt for interactive guide tutor with Claude."""
    return f"""You are an expert, friendly English tutor for Spanish speakers.
Your role: Answer student questions about "{guide_title}" (CEFR {cefr_level}) in a conversational, supportive way.

GUIDE CONTEXT:
{guide_context}

INSTRUCTIONS:
1. Respond ONLY in Spanish, with warmth and encouragement
2. Reference specific examples from the guide context
3. If the student shares an English example, briefly evaluate it and provide feedback
4. Give 1-2 concrete examples specific to the topic
5. Use emojis sparingly to make conversation warm
6. Ask follow-up questions to deepen learning
7. Keep responses concise (2-3 sentences max, unless explaining deeply)
8. If student asks about grammar, use the guide structures to explain
9. If student gives an English answer, start with: "¡Buen intento! [evaluation]"
10. If topic is outside this guide, gently redirect: "Ese tema es importante, pero por ahora enfoquémonos en {cefr_level}"

CEFR {cefr_level} GUIDANCE:
- A1/A2: Celebrate effort, accept approximations, be very encouraging
- B1: Introduce nuance, point out subtleties, expect more precision
- B2: Focus on sophistication, register, idiomatic expressions

Return ONLY a warm, natural tutor response in Spanish."""

@app.post("/evaluate/guide-chat", response_model=GuideChatResponse)
async def evaluate_guide_chat(req: GuideChatRequest):
    """Interactive tutor for guide-specific questions."""
    t_start = time.perf_counter()
    
    system_prompt = build_guide_tutor_prompt(req.guide_title, req.guide_context, req.cefr_level)
    user_content = req.user_message

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_content)
        ])

        tutor_response = response.content.strip()
        
        # Ensure response is in Spanish and reasonable length
        if not tutor_response or len(tutor_response) < 10:
            tutor_response = f"👋 Buena pregunta sobre {req.guide_title}. ¿Puedes ser más específico? Estoy aquí para ayudarte."

        latency_ms = int((time.perf_counter() - t_start) * 1000)
        logger.info(f"guide-chat guide={req.guide_title} level={req.cefr_level} latency={latency_ms}ms")
        
        return {
            "tutor_response": tutor_response,
            "guide_title": req.guide_title,
            "latency_ms": latency_ms
        }

    except Exception as e:
        logger.error(f"Guide Chat Error: {e}")
        return {
            "tutor_response": f"Disculpa, tuve un problema procesando tu pregunta. Intenta de nuevo: {str(e)[:50]}",
            "guide_title": req.guide_title,
            "latency_ms": int((time.perf_counter() - t_start) * 1000)
        }

@app.post("/evaluate/story", response_model=StoryEvaluationResponse)
async def evaluate_story(req: StoryEvaluationRequest):
    from prompts import build_story_prompt
    
    start_time = time.time()
    
    system_prompt = build_story_prompt(req.mission_context, req.objective, req.student_cefr_level)
    user_message = f"STUDENT RESPONSE: \"{req.response_text}\""

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ])
        
        # Parse JSON
        content = response.content.replace("```json", "").replace("```", "").strip()
        raw_data = json.loads(content)
        
        # Basic validation
        if "phrase_correction" not in raw_data:
            raise ValueError("Missing phrase_correction")
            
        return raw_data

    except Exception as e:
        logger.error(f"Story Eval Error: {e}")
        # Fallback response
        return {
             "comprehensibility_score": 0,
             "grammar_score": 0,
             "lexical_richness_score": 0,
             "judgment": "PAUSE",
             "feedback_text": "Error de servicio de evaluación.\n\nIntentaste enviar una respuesta.\n\nIntenta de nuevo más tarde.",
             "detected_structures": [],
             "phrase_correction": {
                 "original": req.response_text,
                 "corrected": req.response_text,
                 "explanation": "No evaluation available",
                 "is_correct": False
             },
             "recommendations": [],
             "retry_suggestions": { "sentence_starter": "", "key_verbs": [] }
        }

@app.get("/health")
async def health():
    return {"status": "ok", "cache": CACHE_AVAILABLE, "model": "claude-sonnet-4-20250514"}

@app.post("/conversation", response_model=ConversationResponse)
async def conversation(payload: ConversationRequest):
    """Multi-turn conversation endpoint for audio mission mode using OpenRouter."""
    t_start = time.perf_counter()

    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="OpenRouter API key not configured")

    # Build conversation history string
    history_str = "\n".join([
        f"{'Character' if turn.role == 'character' else 'User'}: {turn.text}"
        for turn in payload.conversation_history
    ])

    # Build system prompt for conversation
    system_prompt = f"""You are {payload.character_name}, a native English speaker in a mission scenario.
    
CONTEXT: {payload.mission_context}

STUDENT LEVEL: CEFR {payload.cefr_level}

YOUR ROLE: 
- Respond in character, maintaining the narrative they established
- Keep responses SHORT (1-3 sentences max)
- If the student's response doesn't make sense, respond with confusion IN CHARACTER:
  "Sorry, I didn't quite catch that..."
  "Could you say that again? I'm not sure I understood."
  "Hmm, I'm not sure what you mean—try again?"
- If the student achieved the mission objective, end naturally in character
- Never break character
- Always respond in ENGLISH only
- Evaluate the student's English comprehensibility, grammar, and vocabulary

CONVERSATION SO FAR:
{history_str}

STUDENT'S LAST RESPONSE: {payload.last_user_text}

Return ONLY valid JSON in this format (no markdown, just raw JSON):
{{
  "character_response": "Your in-character response here",
  "judgment": "PAUSE" if confused or ADVANCE if understood, or "CONTINUE" if need more info,
  "evaluation": {{
    "comprehensibility_score": 0-100,
    "grammar_score": 0-100,
    "lexical_richness_score": 0-100,
    "feedback_text": "Brief feedback about what they said",
    "detected_structures": []
  }},
  "is_mission_complete": true or false
}}"""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://speak-english.app",
                    "X-Title": "SPEAK",
                },
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": "Process this interaction and return ONLY the JSON response."},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 800,
                }
            )

            if response.status_code != 200:
                error_text = response.text
                logger.error(f"OpenRouter API error: {response.status_code} - {error_text}")
                raise HTTPException(status_code=response.status_code, detail=f"OpenRouter error: {error_text}")

            api_response = response.json()
            raw_text = api_response["choices"][0]["message"]["content"].strip()

            # Strip markdown code blocks if present
            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
                raw_text = raw_text.strip()

            raw_json = json.loads(raw_text)

            # Validate scores
            cs = float(raw_json.get("evaluation", {}).get("comprehensibility_score", 50))
            gs = float(raw_json.get("evaluation", {}).get("grammar_score", 50))
            ls = float(raw_json.get("evaluation", {}).get("lexical_richness_score", 50))

            cs = max(0.0, min(100.0, cs))
            gs = max(0.0, min(100.0, gs))
            ls = max(0.0, min(100.0, ls))

            # Determine judgment based on comprehensibility threshold
            THRESHOLDS = {"A1": 60, "A2": 70, "B1": 80, "B2": 85}
            threshold = THRESHOLDS.get(payload.cefr_level, 70)
            judgment = "ADVANCE" if cs >= threshold else "PAUSE"

            result = {
                "character_response": raw_json.get("character_response", "I didn't quite get that."),
                "judgment": judgment,
                "evaluation": {
                    "comprehensibility_score": cs,
                    "grammar_score": gs,
                    "lexical_richness_score": ls,
                    "feedback_text": raw_json.get("evaluation", {}).get("feedback_text", ""),
                    "detected_structures": raw_json.get("evaluation", {}).get("detected_structures", [])
                },
                "is_mission_complete": raw_json.get("is_mission_complete", False)
            }

            latency_ms = int((time.perf_counter() - t_start) * 1000)
            logger.info(
                f"conversation mission={payload.mission_context[:20]} level={payload.cefr_level} "
                f"score={cs:.0f} judgment={judgment} latency={latency_ms}ms openrouter={OPENROUTER_MODEL}"
            )

            return result

    except json.JSONDecodeError as e:
        logger.error(f"Conversation JSON parse error: {e}")
        return {
            "character_response": "Sorry, I'm having trouble processing that. Could you try again?",
            "judgment": "PAUSE",
            "evaluation": {
                "comprehensibility_score": 30,
                "grammar_score": 30,
                "lexical_richness_score": 30,
                "feedback_text": "Error: Could not parse response",
                "detected_structures": []
            },
            "is_mission_complete": False
        }
    except httpx.TimeoutException:
        logger.error("OpenRouter request timeout")
        raise HTTPException(status_code=504, detail="OpenRouter request timeout - please try again")
    except Exception as e:
        logger.error(f"Conversation error: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Conversation service error: {str(e)[:100]}")

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(payload: EvaluationRequest):
    t_start = time.perf_counter()

    # Check cache
    if CACHE_AVAILABLE:
        try:
            key = cache_key(payload)
            cached = _redis.get(key)
            if cached:
                result = json.loads(cached)
                result["cached"] = True
                result["latency_ms"] = int((time.perf_counter() - t_start) * 1000)
                logger.info(f"Cache hit: mission={payload.mission_id} level={payload.student_cefr_level}")
                return result
        except Exception as e:
            logger.warning(f"Cache read error: {e}")

    # Build messages
    system_prompt = build_system_prompt(payload.student_cefr_level, payload.language_feedback)
    human_content = (
        f"Mission context: {payload.mission_context}\n\n"
        f"Student's English response: {payload.response_text}\n\n"
        f"Student level: {payload.student_cefr_level}\n\n"
        f"Evaluate this response and return ONLY valid JSON."
    )

    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_content),
        ])

        raw_text = response.content.strip()

        # Strip markdown code blocks if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        raw_json = json.loads(raw_text)
        result = validate_and_coerce(raw_json, payload.student_cefr_level)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e} | raw: {raw_text[:200]}")
        raise HTTPException(status_code=422, detail="LLM returned invalid JSON")
    except Exception as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(status_code=503, detail="Evaluation service temporarily unavailable")

    latency_ms = int((time.perf_counter() - t_start) * 1000)
    logger.info(
        f"eval mission={payload.mission_id} level={payload.student_cefr_level} "
        f"score={result['comprehensibility_score']:.0f} judgment={result['judgment']} "
        f"latency={latency_ms}ms"
    )

    # Cache result (1 hour TTL)
    if CACHE_AVAILABLE:
        try:
            _redis.setex(cache_key(payload), 3600, json.dumps(result))
        except Exception as e:
            logger.warning(f"Cache write error: {e}")

    result["cached"] = False
    result["latency_ms"] = latency_ms
    return result
