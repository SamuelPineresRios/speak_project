"""
SPEAK Evaluation Service - Simplified with Direct Anthropic API
"""
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Check if dependencies are available
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
    import anthropic
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(["pip", "install", "fastapi", "uvicorn", "pydantic", "anthropic", "--quiet"])
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn
    import anthropic

# Initialize Anthropic client
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("❌ ANTHROPIC_API_KEY not found in .env")

client = anthropic.Anthropic(api_key=api_key)

# ---- Models ----

class GuideChatRequest(BaseModel):
    user_message: str
    guide_title: str
    guide_context: str
    cefr_level: str = "B1"
    language_feedback: str = "es"

class GuideChatResponse(BaseModel):
    tutor_response: str
    guide_title: str
    latency_ms: int = 0

# ---- Tutor Prompt ----

def build_tutor_system_prompt(guide_title: str, guide_context: str, cefr_level: str) -> str:
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
10. If topic is outside this guide, gently redirect

CEFR {cefr_level} GUIDANCE:
- A1/A2: Celebrate effort, accept approximations, be very encouraging
- B1: Introduce nuance, point out subtleties, expect more precision
- B2: Focus on sophistication, register, idiomatic expressions

Return ONLY a warm, natural tutor response in Spanish."""

# ---- FastAPI App ----

app = FastAPI(title="SPEAK Evaluation Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.post("/evaluate/guide-chat", response_model=GuideChatResponse)
async def evaluate_guide_chat(req: GuideChatRequest):
    """Interactive tutor powered by Claude"""
    import time
    t_start = time.time()
    
    try:
        system_prompt = build_tutor_system_prompt(
            req.guide_title,
            req.guide_context,
            req.cefr_level
        )
        
        # Call Claude API directly
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=[
                {"role": "user", "content": req.user_message}
            ]
        )
        
        tutor_response = message.content[0].text
        latency_ms = int((time.time() - t_start) * 1000)
        
        print(f"✅ guide-chat guide={req.guide_title} level={req.cefr_level} latency={latency_ms}ms")
        
        return {
            "tutor_response": tutor_response,
            "guide_title": req.guide_title,
            "latency_ms": latency_ms
        }
    
    except Exception as e:
        latency_ms = int((time.time() - t_start) * 1000)
        print(f"❌ Error: {str(e)}")
        return {
            "tutor_response": f"Disculpa, hubo un error procesando tu pregunta. Intenta de nuevo.",
            "guide_title": req.guide_title,
            "latency_ms": latency_ms
        }

@app.get("/health")
async def health():
    return {
        "status": "ok ✅",
        "service": "SPEAK Evaluation Service",
        "version": "2.0.0",
        "model": "claude-3-5-sonnet-20241022"
    }

if __name__ == "__main__":
    print("🚀 Starting SPEAK Evaluation Service on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
