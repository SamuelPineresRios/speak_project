#!/usr/bin/env python3
"""
Agregar guías Passive Voice, Modal Verbs, Reported Speech, y Question Formation
a la base de datos
"""
import json
from pathlib import Path

db_path = Path("frontend/data/db.json")
with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

additional_guides = [
    {
        "id": "guide-004",
        "title": "Passive Voice",
        "description": "Master the passive voice for describing actions without mentioning who did them",
        "cover_emoji": "🔄",
        "cefr_level": "B1",
        "concept_tags": ["passive-voice", "grammar", "verb-structures"],
        "estimated_minutes": 25,
        "content": {
            "definition": "La voz pasiva es una estructura gramatical en la que el objeto de la acción se convierte en el sujeto, y el verbo se modifica para reflejar esto.",
            "explanation": "Comparamos: Active: 'The teacher wrote the book' vs Passive: 'The book was written by the teacher'. En la pasiva, enfatizamos la ACCIÓN o el RECEPTOR de la acción, no necesariamente quién la hizo. Es muy común en escritura formal, noticias, y reportes científicos.",
            "formula": "Sujeto + Verbo TO BE (conjugado) + Past Participle + (by + agente)\n\nEjemplos:\nPresent: The house is painted every year\nPast: The letter was delivered yesterday\nFuture: The project will be completed next month\nPerfect: The work has been done correctly",
            "key_structures": [
                {
                    "structure": "Simple Present Passive: is/are + past participle",
                    "example": "The letter is delivered every morning.",
                    "explanation": "Para acciones habituales o estados en presente."
                },
                {
                    "structure": "Simple Past Passive: was/were + past participle",
                    "example": "The cake was eaten by the children.",
                    "explanation": "Para acciones completadas en el pasado. Origin no siempre es importante."
                },
                {
                    "structure": "Present Perfect Passive: has/have + been + past participle",
                    "example": "This museum has been visited by millions of people.",
                    "explanation": "Para acciones que empezaron en el pasado y continúan relevantes."
                },
                {
                    "structure": "Passive with modals: modal + be + past participle",
                    "example": "This task must be completed today.",
                    "explanation": "Combina la pasiva con verbos modales (must, can, should, etc.)"
                }
            ],
            "common_expressions": [
                {"expression": "It is said that...", "example": "It is said that he is very talented.", "type": "Construcción impersonal"},
                {"expression": "It is believed that...", "example": "It is believed that exercise is healthy.", "type": "Creencia común"},
                {"expression": "It is known that...", "example": "It is known that gravity exists.", "type": "Hecho establecido"},
                {"expression": "I was told that...", "example": "I was told that the meeting is postponed.", "type": "Información recibida"}
            ],
            "real_life_examples": [
                {
                    "context": "En noticias de prensa",
                    "example": "Three suspects were arrested by police today.",
                    "explanation": "La pasiva pone énfasis en LO QUE PASÓ, no necesariamente en QUIÉN lo hizo."
                },
                {
                    "context": "En un laboratorio científico",
                    "example": "The experiment was conducted under controlled conditions.",
                    "explanation": "Formal y profesional - no importa quién hizo la prueba exactamente."
                },
                {
                    "context": "En la escuela",
                    "example": "All students will be tested on this material next week.",
                    "explanation": "Comunicado oficial a los estudiantes."
                }
            ],
            "exercises": [
                {
                    "id": "ex-001",
                    "type": "multiple_choice",
                    "question": "Convert to passive: 'They built the bridge in 2020.'",
                    "options": [
                        "The bridge was built in 2020.",
                        "The bridge is built in 2020.",
                        "The bridge were built in 2020.",
                        "The bridge had built in 2020."
                    ],
                    "correct_answer": "The bridge was built in 2020.",
                    "explanation": "Simple Past Passive: was/were + past participle. Solo 'they' es plural, pero 'bridge' es singular, así que 'was'."
                },
                {
                    "id": "ex-002",
                    "type": "multiple_choice",
                    "question": "Complete: 'The email ____ (send) by my assistant yesterday.'",
                    "options": [
                        "was sent",
                        "was sending",
                        "has been sent",
                        "will be sent"
                    ],
                    "correct_answer": "was sent",
                    "explanation": "Simple Past: 'yesterday' indica un tiempo específico en el pasado. Estructura: was + past participle."
                },
                {
                    "id": "ex-003",
                    "type": "true_false",
                    "question": "True or False: 'The boy is eaten the apple' is correct passive voice.",
                    "correct_answer": "false",
                    "explanation": "INCORRECTO. Debería ser: 'The apple is eaten by the boy.' No puedes usar pasiva así - el objeto debe convertirse en sujeto."
                },
                {
                    "id": "ex-004",
                    "type": "multiple_choice",
                    "question": "Which sentence is correct passive?",
                    "options": [
                        "The book is written by Shakespeare.",
                        "The book is written Shakespeare by.",
                        "The book is by Shakespeare written.",
                        "Written the book by Shakespeare is."
                    ],
                    "correct_answer": "The book is written by Shakespeare.",
                    "explanation": "Orden correcto: Sujeto + is/are + past participle + by + agente."
                }
            ]
        },
        "enable_chat_assistant": True,
        "is_published": True,
        "created_at": "2026-03-19T10:00:00Z"
    }
]

# Append or update guides
existing_ids = {g['id']: i for i, g in enumerate(db.get('guides', []))}

for guide in additional_guides:
    if guide['id'] in existing_ids:
        db['guides'][existing_ids[guide['id']]] = guide
    else:
        db['guides'].append(guide)

# Write back
with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"✅ Agregadas {len(additional_guides)} guías")
print(f"✅ Total de guías en la base de datos: {len(db['guides'])}")
print(f"✅ Guías mejoradas con Claude assistant habilitado")
