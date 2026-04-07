"""
SPEAK Evaluation Service — FastAPI + Anthropic Claude
Lightweight version for guide tutoring
"""
import json
import logging
import time
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("speak.eval")

# ---- Initialize Claude ----
try:
    from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    logger.info("✅ Claude Anthropic initialized")
except ImportError:
    logger.error("❌ anthropic package not installed. Run: pip install anthropic")
    raise

# ---- Data Models ----

class GuideChatRequest(BaseModel):
    user_message: str = Field(..., min_length=1, max_length=1000)
    guide_title: str
    guide_context: str
    cefr_level: str = "B1"
    language_feedback: str = "es"

class GuideChatResponse(BaseModel):
    tutor_response: str
    guide_title: str
    latency_ms: int = 0

# ---- Tutor Prompt Builder ----

def build_guide_tutor_prompt(guide_title: str, guide_context: str, cefr_level: str) -> str:
    """Build system prompt for Claude tutor."""
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

# ---- FastAPI App ----

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 SPEAK Tutor Service starting...")
    yield
    logger.info("✅ SPEAK Tutor Service shutting down...")

app = FastAPI(
    title="SPEAK Tutor Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.post("/evaluate/guide-chat", response_model=GuideChatResponse)
async def evaluate_guide_chat(req: GuideChatRequest):
    """Interactive tutor for guide-specific questions using Claude."""
    t_start = time.perf_counter()

    try:
        system_prompt = build_guide_tutor_prompt(
            req.guide_title,
            req.guide_context,
            req.cefr_level
        )

        logger.info(f"📚 Query for {req.guide_title} (CEFR {req.cefr_level}): {req.user_message[:50]}...")

        # Call Claude API
        message = client.messages.create(
            model="claude-opus-4-1",
            max_tokens=500,
            system=system_prompt,
            messages=[
                {"role": "user", "content": req.user_message}
            ]
        )

        tutor_response = message.content[0].text.strip()

        # Fallback if response is too short
        if not tutor_response or len(tutor_response) < 10:
            tutor_response = f"👋 Buena pregunta sobre {req.guide_title}. ¿Puedes ser más específico? Estoy aquí para ayudarte."

        latency_ms = int((time.perf_counter() - t_start) * 1000)
        logger.info(f"✅ Response generated in {latency_ms}ms")

        return {
            "tutor_response": tutor_response,
            "guide_title": req.guide_title,
            "latency_ms": latency_ms
        }

    except Exception as e:
        logger.error(f"❌ Claude Error: {str(e)}")
        latency_ms = int((time.perf_counter() - t_start) * 1000)
        return {
            "tutor_response": f"Disculpa, tuve un problema. Intenta de nuevo en unos segundos.",
            "guide_title": req.guide_title,
            "latency_ms": latency_ms
        }

@app.get("/health")
async def health():
    return {
        "status": "ok ✅",
        "service": "SPEAK Tutor Service",
        "model": "claude-opus-4-1",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("❌ ANTHROPIC_API_KEY not set!")
        exit(1)

    logger.info("🚀 Starting SPEAK Tutor Service on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
