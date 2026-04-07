import json

stories = [
  {
    "id": "story-001",
    "title": "El Vuelo Perdido",
    "description": "Perdiste tu vuelo de conexión en un aeropuerto extranjero. Tienes 2 horas para resolver todo antes de que cierren el último vuelo.",
    "cover_emoji": "✈️",
    "cefr_level": "A2",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-002",
    "title": "La Entrevista",
    "description": "Tienes una entrevista de trabajo en una empresa tech internacional. Todo sale diferente a lo planeado.",
    "cover_emoji": "💼",
    "cefr_level": "B1",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-003",
    "title": "La Ciudad Oscura",
    "description": "Llegas a una ciudad desconocida de noche. Algo no está bien. Cada persona que encuentras sabe más de lo que dice.",
    "cover_emoji": "🌃",
    "cefr_level": "B2",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-004",
    "title": "Cita Médica",
    "description": "Estás de viaje y te sientes mal. Debes navegar el sistema de salud en un país desconocido para conseguir medicina.",
    "cover_emoji": "🏥",
    "cefr_level": "B1",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-005",
    "title": "El Mercado Nocturno",
    "description": "Visitas un famoso mercado nocturno. El reto es probar comida exótica y regatear souvenirs sin ofender a nadie.",
    "cover_emoji": "🏮",
    "cefr_level": "A2",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-006",
    "title": "Primera Cita",
    "description": "Conociste a alguien interesante en una app. Hoy es la primera cita en un restaurante elegante. ¡No lo arruines!",
    "cover_emoji": "🍷",
    "cefr_level": "B1",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-007",
    "title": "Buscando Piso",
    "description": "Te acabas de mudar y necesitas alquilar un apartamento. Tienes una cita con el dueño para verlo.",
    "cover_emoji": "🔑",
    "cefr_level": "A1",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-008",
    "title": "Misterio en el Expreso",
    "description": "Un collar de diamantes ha desaparecido en el tren nocturno a París. Tú eres el único detective a bordo.",
    "cover_emoji": "🚂",
    "cefr_level": "C1",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "story-009",
    "title": "Festival de Verano",
    "description": "Estás en un enorme festival de música. Perdiste a tus amigos y tu teléfono murió. ¡Sobrevive la noche!",
    "cover_emoji": "🎪",
    "cefr_level": "B2",
    "total_scenes": 10,
    "estimated_minutes": 50,
    "created_at": "2026-03-18T10:00:00Z"
  }
]

scenes = [
  {
    "id": "scene-1-1",
    "story_id": "story-001",
    "order": 1,
    "title": "El Mostrador",
    "narrative_context": "Acabas de aterrizar y corres al mostrador de conexiones. El reloj marca 14:00.",
    "situation": "Estás frente a la agente de aerolínea. Hay una fila larga detrás de ti.",
    "objective": "Pide que te busquen alternativas y menciona tu vuelo final.",
    "character_name": "Sophie",
    "character_role": "Agente de check-in agotada",
    "character_opening_dialogue": "Next! Oh... your flight departed 20 minutes ago. I'm sorry, there's nothing I can—",
    "character_advance_dialogue": "Okay, okay. Let me check... there IS one seat left on flight 847 to Madrid. But you need to run — gate C12, NOW.",
    "character_pause_dialogue": "Sir/Ma'am, I can't help you if I don't understand what you need. Please slow down and tell me clearly.",
    "base_duration_seconds": 90,
    "atmosphere": "urgent",
    "background_description": "Busy airport terminal with red flight displays",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Miss",
        "Find",
        "Help",
        "Need"
      ],
      "tenses": [
        "Past Simple (I missed)",
        "Present Simple (I need)"
      ],
      "example_opening": "Excuse me, I missed my flight...",
      "grammar_tip": "Usa 'I missed' para el pasado."
    }
  },
  {
    "id": "scene-1-2",
    "story_id": "story-001",
    "order": 2,
    "title": "Seguridad",
    "narrative_context": "Corres hacia seguridad con tu nuevo pase de abordar en la mano.",
    "situation": "El oficial de seguridad te detiene antes de los escáneres.",
    "objective": "Explica la situación del vuelo perdido y muestra el nuevo tiquete.",
    "character_name": "Marcus",
    "character_role": "Oficial de seguridad serio",
    "character_opening_dialogue": "Stop. Your boarding pass doesn't match our system. Step aside please.",
    "character_advance_dialogue": "Alright, I see it now. Your new boarding pass just appeared in the system. You're good. But hurry.",
    "character_pause_dialogue": "I understand words, but not your situation. Start from the beginning. What. Happened.",
    "base_duration_seconds": 90,
    "atmosphere": "tense",
    "background_description": "Metal detectors and security line",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Change",
        "Show",
        "Explain",
        "Run"
      ],
      "tenses": [
        "Present Continuous (I am going)",
        "Past Simple (They changed)"
      ],
      "example_opening": "Officer, here is my new ticket...",
      "grammar_tip": "Sé directo y usa imperativos suaves."
    }
  },
  {
    "id": "scene-1-3",
    "story_id": "story-001",
    "order": 3,
    "title": "La Cafetería",
    "narrative_context": "Pasaste seguridad, pero el vuelo está retrasado 10 minutos. Te sientas un momento.",
    "situation": "Una viajera se sienta a tu lado, parece querer hablar.",
    "objective": "Cuéntale qué pasó y pregúntale de dónde es ella.",
    "character_name": "Elena",
    "character_role": "Viajera colombiana",
    "character_opening_dialogue": "¡Hey! You look lost. I'm Elena. I just missed my flight too — want some company while we wait?",
    "character_advance_dialogue": "Oh my god, same thing happened to me! I'm from Bogotá. What a coincidence — we're on the same flight to Madrid!",
    "character_pause_dialogue": "Sorry, I didn't quite catch that. My English isn't perfect either — can you say it differently?",
    "base_duration_seconds": 120,
    "atmosphere": "warm",
    "background_description": "Airport cafe with view of rainy tarmac",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Miss",
        "Wait",
        "Be (from)",
        "Happen"
      ],
      "tenses": [
        "Present Perfect (It has been)",
        "Past Simple"
      ],
      "example_opening": "Hi Elena, yes I missed my connection...",
      "grammar_tip": "Usa 'Me too' para estar de acuerdo."
    }
  },
  {
    "id": "scene-1-4",
    "story_id": "story-001",
    "order": 4,
    "title": "El Gate",
    "narrative_context": "Escuchas tu nombre por los altavoces. ¡Es la última llamada!",
    "situation": "Llegas sin aliento a la puerta de embarque.",
    "objective": "Confirma los asientos y pregunta si hay espacio para maleta.",
    "character_name": "James",
    "character_role": "Agente de gate entusiasta",
    "character_opening_dialogue": "Last call for flight 847! Are you two together? Cutting it close, aren't we?",
    "character_advance_dialogue": "Perfect! Seats 14A and 14B — window and aisle. Your bag fits in overhead. Welcome aboard. You made it!",
    "character_pause_dialogue": "I need your boarding passes AND your bag situation sorted before I can let you through. One thing at a time.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Board",
        "Check",
        "Sit",
        "Fit"
      ],
      "tenses": [
        "Present Simple (Does it fit?)",
        "Future (We will sit)"
      ],
      "example_opening": "Yes, we are together! Can I bring my bag?",
      "grammar_tip": "Preguntas con 'Can' para permiso."
    }
  },
  {
    "id": "scene-1-5",
    "story_id": "story-001",
    "order": 5,
    "title": "Sala de Espera",
    "narrative_context": "Llegas a la C12, pero el avión aún no ha llegado.",
    "situation": "Una auxiliar te pide revisar tu pasaporte de nuevo.",
    "objective": "Muestra tu pasaporte y pregunta por qué hay más retrasos.",
    "character_name": "Auxiliar",
    "character_role": "Personaje",
    "character_opening_dialogue": "Before you sit down, I need to verify your passport again.",
    "character_advance_dialogue": "Thank you, everything in order. The captain is just finishing some checks.",
    "character_pause_dialogue": "Passport? Your ID, I need to see it please.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Verify",
        "Show",
        "Understand"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Here is my ID...",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-1-6",
    "story_id": "story-001",
    "order": 6,
    "title": "Anuncio Confuso",
    "narrative_context": "Suena un anuncio por los altavoces apenas ininteligible.",
    "situation": "Le preguntas a otro pasajero qué acaban de decir.",
    "objective": "Pregunta si entendieron el anuncio sobre el vuelo.",
    "character_name": "Pasajero",
    "character_role": "Personaje",
    "character_opening_dialogue": "Did you catch that? I think they said our flight is changing gates... again?",
    "character_advance_dialogue": "Oh, no! Gate C15? Let's hurry up then.",
    "character_pause_dialogue": "Sorry, I can't hear you over the noise.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Change",
        "Hurry",
        "Ask"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "Did they say gate C15?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-1-7",
    "story_id": "story-001",
    "order": 7,
    "title": "Comprando Agua",
    "narrative_context": "Tienes mucha sed y vas a una tienda cercana pequeña.",
    "situation": "Quieres comprar agua rápido.",
    "objective": "Pide una botella de agua y rápido, tienes prisa.",
    "character_name": "Cajero",
    "character_role": "Personaje",
    "character_opening_dialogue": "Hello, that will be 5 dollars for the water.",
    "character_advance_dialogue": "Here is your change! Have a good flight.",
    "character_pause_dialogue": "Are you buying this or not?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Buy",
        "Pay",
        "Drink"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Can I get a water quickly?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-1-8",
    "story_id": "story-001",
    "order": 8,
    "title": "Nuevo Control",
    "narrative_context": "A medio camino de la nueva puerta, hay otro chequeo.",
    "situation": "Un oficial revisa el tamaño de tu maleta de mano.",
    "objective": "Asegura que tu maleta cumple con las medidas correctas.",
    "character_name": "Oficial",
    "character_role": "Personaje",
    "character_opening_dialogue": "Excuse me, your bag looks too big to be a carry-on.",
    "character_advance_dialogue": "It fits the sizer perfectly. You can proceed.",
    "character_pause_dialogue": "I need you to place it in the sizer, please.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Measure",
        "Fit",
        "Put"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "It fits perfectly, see?",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-1-9",
    "story_id": "story-001",
    "order": 9,
    "title": "Abordaje Final",
    "narrative_context": "Por fin llegas a la puerta correcta y están abordando.",
    "situation": "Le entregas tu pase a la recepcionista principal.",
    "objective": "Pregunta si este es el vuelo correcto a Madrid.",
    "character_name": "Recepcionista",
    "character_role": "Personaje",
    "character_opening_dialogue": "Boarding pass ready, please. Is this your final destination?",
    "character_advance_dialogue": "Yes, direct to Madrid. Welcome aboard.",
    "character_pause_dialogue": "Have your pass ready before talking to me.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Confirm",
        "Board",
        "Ticket"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Yes, Madrid is my final destination.",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-1-10",
    "story_id": "story-001",
    "order": 10,
    "title": "Dentro del Avión",
    "narrative_context": "Has logrado subir al avión y buscar tu asiento.",
    "situation": "Alguien está sentado en tu lugar asignado.",
    "objective": "Pide cortésmente a la persona que revise su número de asiento.",
    "character_name": "Pasajero Distraído",
    "character_role": "Pasajero Distraído",
    "character_opening_dialogue": "Oh, hi! I think I'm sitting here. 14A, right?",
    "character_advance_dialogue": "Oh my bad! My seat was 14C. Let me move.",
    "character_pause_dialogue": "I don't know what you mean, this is my seat.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Departure gate with plane visible",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Excuse",
        "Move",
        "Check"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Excuse me, I think you're in my seat...",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-2-1",
    "story_id": "story-002",
    "order": 1,
    "title": "Recepción",
    "narrative_context": "Entras al edificio de vidrio de TechCorp. Tienes 5 minutos.",
    "situation": "Te acercas al mostrador principal.",
    "objective": "Preséntate y di para qué vienes.",
    "character_name": "Priya",
    "character_role": "Recepcionista profesional",
    "character_opening_dialogue": "Good morning, welcome to TechCorp. How can I direct you?",
    "character_advance_dialogue": "Ah yes, for the Senior Developer role. Please take a seat in the waiting area. They'll be with you shortly.",
    "character_pause_dialogue": "I'm sorry, I don't see any appointment under that name. Can you repeat the purpose of your visit?",
    "base_duration_seconds": 60,
    "atmosphere": "neutral",
    "background_description": "Modern corporate lobby, bright and airy",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Have",
        "Be",
        "Meet",
        "Arrive"
      ],
      "tenses": [
        "Present Continuous (I am meeting)",
        "Present Simple"
      ],
      "example_opening": "Good morning, I have an interview at...",
      "grammar_tip": "Usa 'at' para horas (at 10am)."
    }
  },
  {
    "id": "scene-2-2",
    "story_id": "story-002",
    "order": 2,
    "title": "La Sala de Espera",
    "narrative_context": "Te sientas. Hay otra persona esperando, moviendo el pie nerviosamente.",
    "situation": "El otro candidato te mira.",
    "objective": "Rompe el hielo y pregunta sobre la empresa.",
    "character_name": "Tom",
    "character_role": "Candidato nervioso",
    "character_opening_dialogue": "Man, this place is intense. Usually I don't get nervous, but... are you here for the interview too?",
    "character_advance_dialogue": "Yeah, I heard they have amazing benefits. But the coding test is supposed to be brutal. Good luck to us both.",
    "character_pause_dialogue": "Huh? Sorry, I'm too focused on my prep notes. What did you ask?",
    "base_duration_seconds": 90,
    "atmosphere": "tense",
    "background_description": "Minimalist waiting room with abstract art",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Interview",
        "Apply",
        "Know",
        "Think"
      ],
      "tenses": [
        "Present Perfect (Have you heard?)",
        "Present Simple"
      ],
      "example_opening": "Yes, I am nervous too. What role applied for?",
      "grammar_tip": "Preguntas indirectas son más suaves."
    }
  },
  {
    "id": "scene-2-3",
    "story_id": "story-002",
    "order": 3,
    "title": "La Entrevista",
    "narrative_context": "Te llaman a la oficina principal. La directora te espera.",
    "situation": "La entrevistadora te da la mano firmemente.",
    "objective": "Responde por qué quieres el trabajo y da un ejemplo de logro.",
    "character_name": "Dr. Chen",
    "character_role": "Entrevistadora directa",
    "character_opening_dialogue": "Let's get straight to it. Your CV is interesting, but why TechCorp? And give me a concrete example of a challenge you solved.",
    "character_advance_dialogue": "Impressive. That's exactly the kind of problem-solving we need on the backend team.",
    "character_pause_dialogue": "That's a bit generic. I need specifics. Tell me about a real situation, not hypothetical.",
    "base_duration_seconds": 120,
    "atmosphere": "urgent",
    "background_description": "Glass office with city view",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Solve",
        "Manage",
        "Create",
        "Improve"
      ],
      "tenses": [
        "Past Simple (I solved)",
        "Present Perfect (I have built)"
      ],
      "example_opening": "I chose TechCorp because...",
      "grammar_tip": "Usa conectores: First, Then, Finally."
    }
  },
  {
    "id": "scene-2-4",
    "story_id": "story-002",
    "order": 4,
    "title": "El Resultado",
    "narrative_context": "La entrevista termina. Dr. Chen revisa unos papeles y te mira.",
    "situation": "Hay un silencio de unos segundos.",
    "objective": "Reacciona a la oferta e indica tu disponibilidad.",
    "character_name": "Dr. Chen",
    "character_role": "Entrevistadora directa",
    "character_opening_dialogue": "Well, we usually wait to decide, but... I'm offering you the position. Can you start next Monday?",
    "character_advance_dialogue": "Excellent. Welcome to the team. HR will email you the contract in an hour.",
    "character_pause_dialogue": "I need a clear 'yes' or 'no' regarding the start date before I can proceed with the offer.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Accept",
        "Start",
        "Thank",
        "Look forward"
      ],
      "tenses": [
        "Future with Will (I will start)",
        "Present Simple"
      ],
      "example_opening": "Thank you! I accept the offer.",
      "grammar_tip": "Muestra entusiasmo: 'I am excited to...'."
    }
  },
  {
    "id": "scene-2-5",
    "story_id": "story-002",
    "order": 5,
    "title": "Prueba de Pizarra",
    "narrative_context": "Te llevan a una sala de juntas.",
    "situation": "Te piden que escribas un algoritmo simple.",
    "objective": "Explica tu enfoque antes de escribir código.",
    "character_name": "Entrevistador Técnico",
    "character_role": "Entrevistador Técnico",
    "character_opening_dialogue": "Let's do some whiteboard coding. Can you reverse a string efficiently?",
    "character_advance_dialogue": "Good approach. I like the use of two pointers.",
    "character_pause_dialogue": "I need more details on how you would solve it conceptually.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Explain",
        "Write",
        "Approach"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "My approach is to...",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-2-6",
    "story_id": "story-002",
    "order": 6,
    "title": "Preguntas de Diseño",
    "narrative_context": "Pasan a preguntas de arquitectura de sistemas.",
    "situation": "Quieren saber cómo escalarías la aplicación.",
    "objective": "Propón usar una base de datos distribuida o caché.",
    "character_name": "Líder de Backend",
    "character_role": "Líder de Backend",
    "character_opening_dialogue": "How would you handle one million concurrent users?",
    "character_advance_dialogue": "Load balancers and caching. Solid choice.",
    "character_pause_dialogue": "Can you elaborate? That answer was too brief.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Scale",
        "Use",
        "Design"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "I would use a cache...",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-2-7",
    "story_id": "story-002",
    "order": 7,
    "title": "Cultura de Equipo",
    "narrative_context": "Llega el gerente de producto para ver tu encaje en el equipo.",
    "situation": "Te pregunta sobre conflictos con compañeros.",
    "objective": "Describe cómo manejas desacuerdos de forma profesional.",
    "character_name": "Product Manager",
    "character_role": "Product Manager",
    "character_opening_dialogue": "Tell me about a time you disagreed with a coworker.",
    "character_advance_dialogue": "Communication is key, I appreciate your maturity.",
    "character_pause_dialogue": "Could you give a specific example?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Disagree",
        "Resolve",
        "Listen"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "One time I disagreed and we...",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-2-8",
    "story_id": "story-002",
    "order": 8,
    "title": "Beneficios",
    "narrative_context": "Se toman un descanso y hablas de recursos humanos.",
    "situation": "Te preguntan si tienes dudas sobre el paquete.",
    "objective": "Pregunta sobre el trabajo remoto y horario flexible.",
    "character_name": "Asistente de RRHH",
    "character_role": "Asistente de RRHH",
    "character_opening_dialogue": "Do you have any questions about the benefits, perks, or holidays?",
    "character_advance_dialogue": "Yes, we offer fully remote options and flexible hours.",
    "character_pause_dialogue": "What exactly do you mean by flexible?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Ask",
        "Offer",
        "Mean"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "Are the hours flexible?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-2-9",
    "story_id": "story-002",
    "order": 9,
    "title": "Charla con el CEO",
    "narrative_context": "Sorpresivamente, el CEO entra a saludarte.",
    "situation": "Quiere saber por qué quieres unirte a la empresa.",
    "objective": "Menciona su impacto en la industria y su visión.",
    "character_name": "CEO",
    "character_role": "Personaje",
    "character_opening_dialogue": "Hi! Nice to meet you. Why us and not our competitors?",
    "character_advance_dialogue": "I love that passion. We are definitely changing the market.",
    "character_pause_dialogue": "Is that your only reason?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Admire",
        "Believe",
        "Impact"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Your vision for the industry...",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-2-10",
    "story_id": "story-002",
    "order": 10,
    "title": "Despedida",
    "narrative_context": "La entrevista concluye tras todo el recorrido.",
    "situation": "Te acompañan a la salida del edificio.",
    "objective": "Agradece por el tiempo de todos y pregunta por los próximos pasos.",
    "character_name": "Reclutador",
    "character_role": "Personaje",
    "character_opening_dialogue": "Well, we're done for today! How do you feel?",
    "character_advance_dialogue": "We will email you our decision by Friday. Take care!",
    "character_pause_dialogue": "I'm not sure what you're asking about the next steps.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Same office, but brighter lighting",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Thank",
        "Wait",
        "Follow"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Thank you, when will I hear back?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-3-1",
    "story_id": "story-003",
    "order": 1,
    "title": "El Taxista",
    "narrative_context": "El tren llega a medianoche. La estación está vacía. Solo hay un taxi.",
    "situation": "Entras al taxi viejo y huele a cigarro.",
    "objective": "Pregunta sobre el hotel y por qué la ciudad está tan vacía.",
    "character_name": "Viktor",
    "character_role": "Taxista misterioso",
    "character_opening_dialogue": "Blackwood Hotel? No one goes there anymore. Why are you really here?",
    "character_advance_dialogue": "Curfew. That's why it's empty. But the hotel... keep your door locked. We're here.",
    "character_pause_dialogue": "You ask too many questions in a language I don't like. Be quiet or get out.",
    "base_duration_seconds": 90,
    "atmosphere": "mysterious",
    "background_description": "Dark car interior, city lights passing by",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Go",
        "Ask",
        "Arrive",
        "Be"
      ],
      "tenses": [
        "Present Simple (It is quiet)",
        "Past Simple (I arrived)"
      ],
      "example_opening": "Why is the city so empty?",
      "grammar_tip": "Usa 'Why' para pedir razones."
    }
  },
  {
    "id": "scene-3-2",
    "story_id": "story-003",
    "order": 2,
    "title": "El Hotel",
    "narrative_context": "El lobby del hotel es antiguo, con polvo en los muebles.",
    "situation": "La recepcionista te observa desde las sombras.",
    "objective": "Haz el check-in y pregunta sobre el ruido que escuchas arriba.",
    "character_name": "Mrs. Harlow",
    "character_role": "Recepcionista extraña",
    "character_opening_dialogue": "Room 204 is ready. Do not go to the third floor. Do you understand?",
    "character_advance_dialogue": "The noise? Just... pipes. Old pipes. Here represents your key. Sleep well.",
    "character_pause_dialogue": "I asked if you understood the rules. Answer me clearly.",
    "base_duration_seconds": 90,
    "atmosphere": "dark",
    "background_description": "Dimly lit gothic hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Hear",
        "Understand",
        "Sleep",
        "Stay"
      ],
      "tenses": [
        "Present Simple (I understand)",
        "Present Continuous (Who is walking?)"
      ],
      "example_opening": "Yes, I understand. But what is that noise?",
      "grammar_tip": "Usa disyuntivas: 'This OR that'."
    }
  },
  {
    "id": "scene-3-3",
    "story_id": "story-003",
    "order": 3,
    "title": "El Bar",
    "narrative_context": "No puedes dormir. Bajas al bar del hotel. Está vacío, salvo el bartender.",
    "situation": "El bartender limpia un vaso una y otra vez.",
    "objective": "Pide información sobre lo que pasó en la ciudad.",
    "character_name": "Rodrigo",
    "character_role": "Bartender informante",
    "character_opening_dialogue": "You shouldn't be wandering. People vanish like that. What do you want to drink?",
    "character_advance_dialogue": "It started a month ago. The fog came, and people changed. But Inspector Voss knows more.",
    "character_pause_dialogue": "Drink or leave. I don't have time for riddles.",
    "base_duration_seconds": 120,
    "atmosphere": "tense",
    "background_description": "Empty bar with flickering neon sign",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Know",
        "Happen",
        "Want",
        "Drink"
      ],
      "tenses": [
        "Past Simple (What happened?)",
        "Present Simple"
      ],
      "example_opening": "I want a water. Tell me about the fog.",
      "grammar_tip": "Imperativos suaves: 'Tell me about...'."
    }
  },
  {
    "id": "scene-3-4",
    "story_id": "story-003",
    "order": 4,
    "title": "La Revelación",
    "narrative_context": "Alguien toca tu hombro. Es un hombre con gabardina.",
    "situation": "El inspector te ha encontrado.",
    "objective": "Explica por qué llegaste y qué buscas exactamente.",
    "character_name": "Inspector Voss",
    "character_role": "Detective",
    "character_opening_dialogue": "I've been watching you since the station. You're asking dangerous questions. Who sent you?",
    "character_advance_dialogue": "A journalist? I see. The truth is dangerous here. You have your story, now you must leave.",
    "character_pause_dialogue": "Lies. Tell me the truth or I'll arrest you right now.",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Send",
        "Watch",
        "Ask",
        "Leave"
      ],
      "tenses": [
        "Present Perfect (Who has sent you?)",
        "Past Simple"
      ],
      "example_opening": "Nobody sent me. I am a journalist.",
      "grammar_tip": "Voz pasiva: 'I was sent by...'."
    }
  },
  {
    "id": "scene-3-5",
    "story_id": "story-003",
    "order": 5,
    "title": "El Callejón",
    "narrative_context": "Te metes en un callejón sin salida.",
    "situation": "Una sombra te bloquea el paso.",
    "objective": "Pregunta quién es y qué quiere.",
    "character_name": "Figura Misteriosa",
    "character_role": "Figura Misteriosa",
    "character_opening_dialogue": "You shouldn't wander here alone... It's dangerous.",
    "character_advance_dialogue": "I can show you a shortcut if you pay me.",
    "character_pause_dialogue": "I don't play games. Who are you looking for?",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Ask",
        "Need",
        "Find"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Who are you looking for?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-3-6",
    "story_id": "story-003",
    "order": 6,
    "title": "La Tienda de Antigüedades",
    "narrative_context": "Entras a una tienda para pedir ayuda.",
    "situation": "El dependiente te mira con desconfianza.",
    "objective": "Pide usar su teléfono o pedir indicaciones.",
    "character_name": "Dueño de Tienda",
    "character_role": "Dueño de Tienda",
    "character_opening_dialogue": "We are closed! No strangers allowed after midnight!",
    "character_advance_dialogue": "Fine, you can use the landline. But be quick.",
    "character_pause_dialogue": "Speak clearly or get out of my shop.",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Call",
        "Use",
        "Quick"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Can I just use the phone?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-3-7",
    "story_id": "story-003",
    "order": 7,
    "title": "El Teléfono Público",
    "narrative_context": "El teléfono de la tienda apenas funciona.",
    "situation": "La operadora automática te pide el destino.",
    "objective": "Habla con la operadora para contactar al hotel.",
    "character_name": "Operadora",
    "character_role": "Personaje",
    "character_opening_dialogue": "Operator. Which number are you trying to connect to?",
    "character_advance_dialogue": "Connecting to the Grand Hotel... please hold.",
    "character_pause_dialogue": "Please dictate the number slowly.",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Dial",
        "Connect",
        "Help"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Please connect me to...",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-3-8",
    "story_id": "story-003",
    "order": 8,
    "title": "El Mensaje",
    "narrative_context": "Logras contactar al hotel, pero el recepcionista suena asustado.",
    "situation": "Te dicen que tu reserva fue cancelada.",
    "objective": "Exige una explicación sobre la cancelación.",
    "character_name": "Recepcionista del Hotel",
    "character_role": "Recepcionista del Hotel",
    "character_opening_dialogue": "I'm sorry, we don't have anyone by your name tonight.",
    "character_advance_dialogue": "Someone called and cancelled it an hour ago...",
    "character_pause_dialogue": "Could you repeat your last name?",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Cancel",
        "Why",
        "Explain"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Why was it cancelled?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-3-9",
    "story_id": "story-003",
    "order": 9,
    "title": "De vuelta a la calle",
    "narrative_context": "Sales de la tienda desconcertado.",
    "situation": "Un taxista se detiene a tu lado.",
    "objective": "Pregunta si puede llevarte fuera del barrio.",
    "character_name": "Taxista Nocturno",
    "character_role": "Taxista Nocturno",
    "character_opening_dialogue": "Need a ride, friend? Looks like you've seen a ghost.",
    "character_advance_dialogue": "Hop in. I'll get you out of here quickly.",
    "character_pause_dialogue": "Where to? Speak up!",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Ride",
        "Take",
        "Go"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Can you take me to the center?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-3-10",
    "story_id": "story-003",
    "order": 10,
    "title": "El Amanecer",
    "narrative_context": "El taxi arranca y llegas cerca del centro.",
    "situation": "Empieza a amanecer y te sientes a salvo.",
    "objective": "Agradece al taxista y paga el recorrido.",
    "character_name": "Taxista Nocturno",
    "character_role": "Taxista Nocturno",
    "character_opening_dialogue": "Here we are, the central plaza. That will be 20.",
    "character_advance_dialogue": "Keep the change. Stay safe next time.",
    "character_pause_dialogue": "Do you need change for that?",
    "base_duration_seconds": 90,
    "atmosphere": "danger",
    "background_description": "Shadowy corner of the room",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Pay",
        "Keep",
        "Arrive"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Keep the change, thanks.",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-4-1",
    "story_id": "story-004",
    "order": 1,
    "title": "La Recepción",
    "narrative_context": "Entras a la clínica con fiebre. Hay una enfermera ocupada.",
    "situation": "Te acercas para registrarte.",
    "objective": "Di tus síntomas básicos y pide ver a un doctor.",
    "character_name": "Nurse Sarah",
    "character_role": "Enfermera de triaje",
    "character_opening_dialogue": "Hello. Do you have an appointment? You look pale.",
    "character_advance_dialogue": "Oh, fever and headache. I see. Since it's urgent, I can squeeze you in with Dr. Lee in 10 minutes. Fill this form.",
    "character_pause_dialogue": "I need to know your symptoms clearly. Does your head hurt? Stomach?",
    "base_duration_seconds": 60,
    "atmosphere": "sterile",
    "background_description": "Clean hospital reception area",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Have",
        "Feel",
        "Need",
        "See"
      ],
      "tenses": [
        "Present Simple (I have fever)",
        "Present Continuous (I am feeling invalid)"
      ],
      "example_opening": "I need to see a doctor. I have a fever.",
      "grammar_tip": "Usa 'I have' para síntomas (I have a headache)."
    }
  },
  {
    "id": "scene-4-2",
    "story_id": "story-004",
    "order": 2,
    "title": "La Consulta",
    "narrative_context": "El Doctor Lee entra al consultorio.",
    "situation": "El doctor te revisa y hace preguntas.",
    "objective": "Responde sobre alergias y desde cuándo te sientes mal.",
    "character_name": "Dr. Lee",
    "character_role": "Médico amable",
    "character_opening_dialogue": "So, the nurse tells me you have a high fever. How long have you felt like this?",
    "character_advance_dialogue": "Three days? Okay. And are you allergic to penicillin? I want to prescribe antibiotics.",
    "character_pause_dialogue": "It's important. Allergies. Do you have reactions to medicine?",
    "base_duration_seconds": 90,
    "atmosphere": "calm",
    "background_description": "Doctor's office",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Feel",
        "Start",
        "Be (allergic)",
        "Take"
      ],
      "tenses": [
        "Present Perfect (I have felt)",
        "Past Simple (It started)"
      ],
      "example_opening": "I have felt sick for 3 days. No allergies.",
      "grammar_tip": "Duration: 'For 3 days' o 'Since Tuesday'."
    }
  },
  {
    "id": "scene-4-3",
    "story_id": "story-004",
    "order": 3,
    "title": "La Farmacia",
    "narrative_context": "Sales con la receta. Vas a la farmacia de la esquina.",
    "situation": "El farmacéutico toma tu receta.",
    "objective": "Pregunta cómo tomar la medicina y si causa sueño.",
    "character_name": "Pharmacist",
    "character_role": "Farmacéutico",
    "character_opening_dialogue": "Let me check this prescription... Yes, we have it. Anything else?",
    "character_advance_dialogue": "Take one pill every 8 hours with food. And yes, it might make you drowsy, so don't drive.",
    "character_pause_dialogue": "One pill. Every 8 hours. Understand?",
    "base_duration_seconds": 60,
    "atmosphere": "neutral",
    "background_description": "Pharmacy counter",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Take",
        "Cause",
        "Drive",
        "Eat"
      ],
      "tenses": [
        "Present Simple (Does it cause...?)",
        "Imperative"
      ],
      "example_opening": "How do I take this? Does it cause drowsiness?",
      "grammar_tip": "Preguntas de frecuencia: 'How often?'."
    }
  },
  {
    "id": "scene-4-4",
    "story_id": "story-004",
    "order": 4,
    "title": "El Regreso",
    "narrative_context": "Regresas al hotel con tu medicina.",
    "situation": "El recepcionista te ve llegar.",
    "objective": "Pide una botella de agua y que no te molesten hasta mañana.",
    "character_name": "Receptionist",
    "character_role": "Recepcionista de hotel",
    "character_opening_dialogue": "You're back. Did you find a doctor? You look tired.",
    "character_advance_dialogue": "Of course. Here is a large water bottle. I'll put a 'Do Not Disturb' on your phone. Get some rest.",
    "character_pause_dialogue": "Water? Or food? What do you need?",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Need",
        "Disturb",
        "Rest",
        "Drink"
      ],
      "tenses": [
        "Present Simple (I need)",
        "Imperative (Do not disturb)"
      ],
      "example_opening": "Please give me water. Do not disturb me.",
      "grammar_tip": "Polite requests: 'Could you please...'."
    }
  },
  {
    "id": "scene-4-5",
    "story_id": "story-004",
    "order": 5,
    "title": "La Sala de Espera",
    "narrative_context": "Estás esperando tus medicinas en la clínica.",
    "situation": "La enfermera te pide llenar unos formularios.",
    "objective": "Pide ayuda a la enfermera porque no entiendes el formulario.",
    "character_name": "Enfermera",
    "character_role": "Personaje",
    "character_opening_dialogue": "Can you fill out this medical history form, please?",
    "character_advance_dialogue": "Oh, let me help you translate these parts.",
    "character_pause_dialogue": "Which part exactly don't you understand?",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Fill",
        "Understand",
        "Help"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "I don't understand this form.",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-4-6",
    "story_id": "story-004",
    "order": 6,
    "title": "Problemas de Seguro",
    "narrative_context": "Van a procesar tu pago en recepción.",
    "situation": "Tu seguro no parece cubrir en este país.",
    "objective": "Pregunta si puedes pagar en efectivo o de forma privada.",
    "character_name": "Recepcionista Médica",
    "character_role": "Recepcionista Médica",
    "character_opening_dialogue": "I'm afraid your insurance card is showing as invalid.",
    "character_advance_dialogue": "Yes, we accept cash. The consultation fee is $50.",
    "character_pause_dialogue": "I need an alternative payment method.",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Pay",
        "Cost",
        "Cash"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "Can I pay in cash instead?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-4-7",
    "story_id": "story-004",
    "order": 7,
    "title": "Preguntas de Farmacia",
    "narrative_context": "Cruzas a la farmacia anexa.",
    "situation": "El farmacéutico te advierte de efectos secundarios.",
    "objective": "Pregunta si el medicamento da mucha somnolencia.",
    "character_name": "Farmacéutico",
    "character_role": "Personaje",
    "character_opening_dialogue": "Here are your pills. Don't mix them with alcohol.",
    "character_advance_dialogue": "Yes, it might make you sleepy. Take it before bed.",
    "character_pause_dialogue": "I'm sorry, what symptom are you worried about?",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Effect",
        "Sleep",
        "Pill"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Does this pill make you sleepy?",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-4-8",
    "story_id": "story-004",
    "order": 8,
    "title": "Comprando Suplementos",
    "narrative_context": "Quieres llevar también unas vitaminas o algo extra.",
    "situation": "Ves a alguien acomodando productos.",
    "objective": "Pregunta por vitaminas con vitamina C.",
    "character_name": "Ayudante de Farmacia",
    "character_role": "Ayudante de Farmacia",
    "character_opening_dialogue": "Can I help you find anything else in the store?",
    "character_advance_dialogue": "Right here in aisle 3, we have standard Vitamin C.",
    "character_pause_dialogue": "What exactly are you looking for?",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Find",
        "Take",
        "Need"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Where are the vitamins?",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-4-9",
    "story_id": "story-004",
    "order": 9,
    "title": "Revisión Rápida",
    "narrative_context": "El doctor sale un momento a comprobar que estés bien antes de irte.",
    "situation": "Quiere saber si planeas viajar pronto.",
    "objective": "Explica que tienes un vuelo en dos días.",
    "character_name": "Doctor",
    "character_role": "Personaje",
    "character_opening_dialogue": "Before you leave... are you flying out this week?",
    "character_advance_dialogue": "Two days should be fine, just stay hydrated!",
    "character_pause_dialogue": "I didn't quite catch your travel plans.",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Fly",
        "Travel",
        "Stay"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "I am flying out in two days.",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-4-10",
    "story_id": "story-004",
    "order": 10,
    "title": "Saliendo de la Clínica",
    "narrative_context": "Ya con tus medicamentos, decides volver al hotel.",
    "situation": "Le pides al guardia que te llame un taxi.",
    "objective": "Pide el servicio de transporte al hotel.",
    "character_name": "Guardia",
    "character_role": "Personaje",
    "character_opening_dialogue": "Everything okay? Do you need a cab?",
    "character_advance_dialogue": "A cab is pulling up right now. Get some rest.",
    "character_pause_dialogue": "Where do you want the cab to take you?",
    "base_duration_seconds": 60,
    "atmosphere": "relief",
    "background_description": "Hotel lobby",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Call",
        "Take",
        "Drop"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "I need a cab to my hotel.",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-5-1",
    "story_id": "story-005",
    "order": 1,
    "title": "La Entrada",
    "narrative_context": "El mercado está lleno de gente, luces y olores increíbles.",
    "situation": "Te abres paso entre la multitud.",
    "objective": "Pregunta a alguien dónde están los puestos de comida.",
    "character_name": "Local Guide",
    "character_role": "Guía local",
    "character_opening_dialogue": "Step aside! Heavy cart coming through! ...Oh, sorry tourist. You looking for something?",
    "character_advance_dialogue": "Food stalls are that way, past the lanterns. The best noodles are at the blue tent.",
    "character_pause_dialogue": "Food? Eat? Over there.",
    "base_duration_seconds": 60,
    "atmosphere": "lively",
    "background_description": "Crowded market entrance with lanterns",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "scene-5-2",
    "story_id": "story-005",
    "order": 2,
    "title": "Puesto de Comida",
    "narrative_context": "Llegas al puesto azul. El chef cocina con fuego alto.",
    "situation": "Es tu turno de pedir.",
    "objective": "Pide el plato especial pero sin picante.",
    "character_name": "Chef Tao",
    "character_role": "Cocinero ocupado",
    "character_opening_dialogue": "What you want? Quickly!",
    "character_advance_dialogue": "Special noodles, no spice. Got it. That will be 50 baht. Wait here.",
    "character_pause_dialogue": "Spicy? No spicy? Be clear!",
    "base_duration_seconds": 60,
    "atmosphere": "hectic",
    "background_description": "Steam and fire from woks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z"
  },
  {
    "id": "scene-5-3",
    "story_id": "story-005",
    "order": 3,
    "title": "Souvenirs",
    "narrative_context": "Ves una estatua de madera hermosa en una tienda.",
    "situation": "El vendedor te sonríe.",
    "objective": "Pregunta el precio y trata de regatear amablemente.",
    "character_name": "Vendor",
    "character_role": "Vendedor astuto",
    "character_opening_dialogue": "Hello my friend! Beautiful craftsmanship. For you, special price.",
    "character_advance_dialogue": "It's 500 originally... but for you, 350. It is real teak wood!",
    "character_pause_dialogue": "Price? 500. Good price.",
    "base_duration_seconds": 90,
    "atmosphere": "friendly",
    "background_description": "Stall full of wooden crafts",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Buy",
        "Give",
        "Cost",
        "Like"
      ],
      "tenses": [
        "Conditional (I would buy)",
        "Present Simple"
      ],
      "example_opening": "It is beautiful but too expensive. 300?",
      "grammar_tip": "Usa 'How much' para preguntar precios."
    }
  },
  {
    "id": "scene-5-4",
    "story_id": "story-005",
    "order": 4,
    "title": "El Regreso",
    "narrative_context": "Ya es tarde y el mercado cierra. Tienes tus compras.",
    "situation": "Buscas un tuk-tuk para volver.",
    "objective": "Negocia el precio del viaje al hotel.",
    "character_name": "Driver",
    "character_role": "Conductor de Tuk-tuk",
    "character_opening_dialogue": "Taxi? Tuk-tuk? Where you go?",
    "character_advance_dialogue": "Grand Hotel? Okay, 200 baht. Hop in!",
    "character_pause_dialogue": "Where? Hotel name?",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Go",
        "Take",
        "Cost",
        "Agree"
      ],
      "tenses": [
        "Present Simple (How much is...?)",
        "Imperative (Take me to...)"
      ],
      "example_opening": "How much to the Grand Hotel?",
      "grammar_tip": "Negocia antes de subir: 'For 100?'."
    }
  },
  {
    "id": "scene-5-5",
    "story_id": "story-005",
    "order": 5,
    "title": "Bebidas Tradicionales",
    "narrative_context": "Después de comer, te da sed en el mercado.",
    "situation": "Encuentras un puesto que vende tés fríos.",
    "objective": "Pide un té, preferiblemente no muy dulce.",
    "character_name": "Vendedora de Té",
    "character_role": "Vendedora de Té",
    "character_opening_dialogue": "Thirsty? We have green tea, bubble tea, and fruit tea!",
    "character_advance_dialogue": "No sugar? No problem! Coming right up.",
    "character_pause_dialogue": "Do you want it sweet or not sweet?",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Want",
        "Try",
        "Taste"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "I want the green tea, not sweet.",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-5-6",
    "story_id": "story-005",
    "order": 6,
    "title": "Souvenirs de Madera",
    "narrative_context": "Te detienes a ver unas esculturas hermosas.",
    "situation": "El vendedor te enseña una caja tallada.",
    "objective": "Pregunta cómo está hecha y de qué material es.",
    "character_name": "Artesano",
    "character_role": "Personaje",
    "character_opening_dialogue": "Beautiful, right? Hand-carved and very traditional.",
    "character_advance_dialogue": "It is made of bamboo wood here in the local village.",
    "character_pause_dialogue": "I don't understand your question about the wood.",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Carve",
        "Make",
        "Craft"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "What kind of wood is this?",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-5-7",
    "story_id": "story-005",
    "order": 7,
    "title": "El Puesto de Especias",
    "narrative_context": "El olor te atrae a un lugar lleno de sacos de especias.",
    "situation": "Ves un polvo rojo y no sabes si es picante.",
    "objective": "Pregunta si pica mucho para poder comprarlo.",
    "character_name": "Vendedor",
    "character_role": "Personaje",
    "character_opening_dialogue": "Looking for spices to take home? Good prices!",
    "character_advance_dialogue": "It is not spicy at all! Just sweet paprika.",
    "character_pause_dialogue": "Spicy? Everything is spicy if you eat too much. Be specific!",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Spice",
        "Burn",
        "Eat"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Is this paprika spicy?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-5-8",
    "story_id": "story-005",
    "order": 8,
    "title": "La Joya",
    "narrative_context": "Un vendedor insistente te acerca collares.",
    "situation": "Intenta vendarte algo muy caro.",
    "objective": "Rechaza amablemente diciendo que es muy costoso.",
    "character_name": "Joyero Vendedor",
    "character_role": "Joyero Vendedor",
    "character_opening_dialogue": "My friend, for you, special price! Real jade stone!",
    "character_advance_dialogue": "Okay, okay, I leave you alone. No pressure.",
    "character_pause_dialogue": "What's the problem? Is it the price?",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Cost",
        "Expensive",
        "Leave"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "That's too expensive for me.",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-5-9",
    "story_id": "story-005",
    "order": 9,
    "title": "Postre de Calle",
    "narrative_context": "Sigues sintiendo un pequeño hueco en tu estómago.",
    "situation": "Ves dulces fritos.",
    "objective": "Pregunta cuántos dulces vienen por porción.",
    "character_name": "Chef Callejero",
    "character_role": "Personaje",
    "character_opening_dialogue": "Fresh out of the oil! Try the sweet dough!",
    "character_advance_dialogue": "Five pieces in one bag. Grab one!",
    "character_pause_dialogue": "How many what? Bags or pieces?",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "How many",
        "Give",
        "Buy"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "How many pieces in one bag?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-5-10",
    "story_id": "story-005",
    "order": 10,
    "title": "Regreso al Hotel",
    "narrative_context": "El mercado empieza a cerrar.",
    "situation": "Preguntas a un policía local dónde está la parada de bus.",
    "objective": "Pregunta cómo volver al centro a estas horas.",
    "character_name": "Policía Local",
    "character_role": "Personaje",
    "character_opening_dialogue": "Market is closing down, time to go home.",
    "character_advance_dialogue": "The bus stop is just past the main gate on the right.",
    "character_pause_dialogue": "Where exactly are you trying to go?",
    "base_duration_seconds": 60,
    "atmosphere": "noisy",
    "background_description": "Street corner with tuk-tuks",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Go",
        "Catch",
        "Stop"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "Where is the bus stop from here?",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-6-1",
    "story_id": "story-006",
    "order": 1,
    "title": "El Encuentro",
    "narrative_context": "Llegas al restaurante italiano. Ves a tu cita en la mesa.",
    "situation": "Te acercas a la mesa.",
    "objective": "Saluda y disimula tus nervios. Haz un cumplido.",
    "character_name": "Alex",
    "character_role": "Tu cita",
    "character_opening_dialogue": "Oh, hi! You look... exactly like your photos. Actually, better.",
    "character_advance_dialogue": "Thank you! I was worried I chose a bad table. Please, sit. I ordered some water already.",
    "character_pause_dialogue": "You okay? You look a bit pale.",
    "base_duration_seconds": 90,
    "atmosphere": "romantic",
    "background_description": "Candlelit restaurant table",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Look",
        "Meet",
        "Hope",
        "Like"
      ],
      "tenses": [
        "Present Simple (You look great)",
        "Past Simple (I hoped)"
      ],
      "example_opening": "Hi Alex! You look great too. Nice table.",
      "grammar_tip": "Cumplidos con 'You look + adjective'."
    }
  },
  {
    "id": "scene-6-2",
    "story_id": "story-006",
    "order": 2,
    "title": "La Orden",
    "narrative_context": "El mesero llega para tomar la orden.",
    "situation": "La carta está en italiano.",
    "objective": "Pide una recomendación y ordena vino para los dos.",
    "character_name": "Waiter",
    "character_role": "Mesero elegante",
    "character_opening_dialogue": "Buona sera. Are we ready to order, or would we like some wine first?",
    "character_advance_dialogue": "An excellent choice regarding the Chianti. And the Risotto is our specialty tonight.",
    "character_pause_dialogue": "Red? White? Food?",
    "base_duration_seconds": 60,
    "atmosphere": "elegant",
    "background_description": "Restaurant interior",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Recommend",
        "Order",
        "Drink",
        "Like"
      ],
      "tenses": [
        "Conditional (I would like)",
        "Present Simple"
      ],
      "example_opening": "We would like a bottle of Chianti, please.",
      "grammar_tip": "Cortesía: 'I would like...' en vez de 'I want'."
    }
  },
  {
    "id": "scene-6-3",
    "story_id": "story-006",
    "order": 3,
    "title": "La Conversación",
    "narrative_context": "Esperan la comida con las copas de vino.",
    "situation": "Alex te pregunta sobre tus hobbies.",
    "objective": "Habla de tus viajes y pregunta qué le gusta a Alex.",
    "character_name": "Alex",
    "character_role": "Tu cita",
    "character_opening_dialogue": "So, your profile said you love traveling. What's the best place you've ever been?",
    "character_advance_dialogue": "Wow, Japan? I've always wanted to go. I love photography, so that would be a dream trip.",
    "character_pause_dialogue": "Traveling? Where?",
    "base_duration_seconds": 120,
    "atmosphere": "intimate",
    "background_description": "Restaurant table, closer view",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Travel",
        "Love",
        "Go",
        "Visit"
      ],
      "tenses": [
        "Present Perfect (I have been)",
        "Past Simple (I went)"
      ],
      "example_opening": "I loved Japan. Have you been there?",
      "grammar_tip": "Usa 'Have you ever...?' para experiencias."
    }
  },
  {
    "id": "scene-6-4",
    "story_id": "story-006",
    "order": 4,
    "title": "La Despedida",
    "narrative_context": "La cena terminó. Caminan fuera del restaurante.",
    "situation": "Es el momento de decidir si habrá segunda cita.",
    "objective": "Di que la pasaste genial y sugiere vernos de nuevo.",
    "character_name": "Alex",
    "character_role": "Tu cita",
    "character_opening_dialogue": "This was... really nice. The food, the conversation. I'm glad we met.",
    "character_advance_dialogue": "I'd love to see you again. Maybe next weekend? I know a great jazz place.",
    "character_pause_dialogue": "See you? Again?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Enjoy",
        "Meet",
        "Call",
        "See"
      ],
      "tenses": [
        "Past Simple (I enjoyed)",
        "Future (I will call)"
      ],
      "example_opening": "I had a great time too. Let's do it again.",
      "grammar_tip": "Sugerencias: 'Let's...' o 'Shall we...?'."
    }
  },
  {
    "id": "scene-6-5",
    "story_id": "story-006",
    "order": 5,
    "title": "La Conversación",
    "narrative_context": "Están esperando que llegue la comida principal.",
    "situation": "Tu cita quiere saber más de tus hobbies.",
    "objective": "Cuenta qué haces en tu tiempo libre.",
    "character_name": "Cita",
    "character_role": "Personaje",
    "character_opening_dialogue": "So, what do you usually do on the weekends?",
    "character_advance_dialogue": "That sounds super interesting! I'd love to try that.",
    "character_pause_dialogue": "Can you explain a bit more about what that is?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Do",
        "Enjoy",
        "Play"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "On weekends I usually...",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-6-6",
    "story_id": "story-006",
    "order": 6,
    "title": "El Incidente del Vino",
    "narrative_context": "Llega la comida, pero derramas un poco de bebida.",
    "situation": "Pides perdón y pides servilletas a tu cita.",
    "objective": "Discúlpate tranquilamente por el pequeño derrame.",
    "character_name": "Cita",
    "character_role": "Personaje",
    "character_opening_dialogue": "Oh no! Be careful, it's spilling on the table.",
    "character_advance_dialogue": "Don't worry about it, it's just a little water!",
    "character_pause_dialogue": "Are you okay? Should I call the waiter?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Spill",
        "Sorry",
        "Accident"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "I'm so sorry, I spilled water.",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-6-7",
    "story_id": "story-006",
    "order": 7,
    "title": "El Mesero Regresa",
    "narrative_context": "El mesero nota el incidente y se acerca.",
    "situation": "Ofrece un trapo para limpiar.",
    "objective": "Agradece al mesero y dile que no ha pasado nada grave.",
    "character_name": "Mesero",
    "character_role": "Personaje",
    "character_opening_dialogue": "Sir/Madam, do you need more napkins?",
    "character_advance_dialogue": "Certainly. I'll take away the wet ones. Enjoy the food.",
    "character_pause_dialogue": "Did it stain your clothing?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Clean",
        "Fine",
        "Thanks"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "No need to worry, it's fine.",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-6-8",
    "story_id": "story-006",
    "order": 8,
    "title": "La Familia",
    "narrative_context": "El ambiente se relaja y siguen comiendo.",
    "situation": "Tu cita empieza a hablar de su familia, y te pregunta por la tuya.",
    "objective": "Describe un rasgo curioso o lindo sobre tu familia.",
    "character_name": "Cita",
    "character_role": "Personaje",
    "character_opening_dialogue": "My parents live up north... Do you have a big family?",
    "character_advance_dialogue": "Wow, large families are always so much fun!",
    "character_pause_dialogue": "I didn't hear what you said about your brother.",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Have",
        "Live",
        "Brothers"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "My family is small, just...",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-6-9",
    "story_id": "story-006",
    "order": 9,
    "title": "El Postre",
    "narrative_context": "Llega la hora de pedir postre.",
    "situation": "Hay varios dulces pero quieres compartir algo.",
    "objective": "Sugiere compartir un pastel de chocolate.",
    "character_name": "Cita",
    "character_role": "Personaje",
    "character_opening_dialogue": "I am so full! But the desserts look amazing...",
    "character_advance_dialogue": "Sharing the chocolate cake? Perfect idea.",
    "character_pause_dialogue": "Are we getting one dessert each or sharing?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Share",
        "Want",
        "Eat"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Let's share the chocolate cake!",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-6-10",
    "story_id": "story-006",
    "order": 10,
    "title": "La Despedida",
    "narrative_context": "Salen del restaurante frente al coche.",
    "situation": "Te toca despedirte y quieres volver a verla/lo.",
    "objective": "Expresa que la pasaste bien y espera otra oportunidad.",
    "character_name": "Cita",
    "character_role": "Personaje",
    "character_opening_dialogue": "Well... thanks. This was a really nice evening!",
    "character_advance_dialogue": "Me too! Let's definitely do this again soon. Bye!",
    "character_pause_dialogue": "What did you think of the restaurant?",
    "base_duration_seconds": 60,
    "atmosphere": "hopeful",
    "background_description": "Street outside restaurant under streetlamp",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "See",
        "Call",
        "Bye"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "I had a great time tonight!",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-7-1",
    "story_id": "story-007",
    "order": 1,
    "title": "El Encuentro",
    "narrative_context": "Estás frente al edificio. El dueño llega tarde.",
    "situation": "Un hombre mayor se acerca con llaves.",
    "objective": "Saluda y confirma que vienes a ver el piso.",
    "character_name": "Mr. Schmidt",
    "character_role": "Dueño del edificio",
    "character_opening_dialogue": "Hello? Are you the one for the apartment view? You're early.",
    "character_advance_dialogue": "Ah, good. Follow me. It's on the second floor. No elevator.",
    "character_pause_dialogue": "Are you the tenant? Yes or no?",
    "base_duration_seconds": 60,
    "atmosphere": "neutral",
    "background_description": "City street, brick building",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "See",
        "Come",
        "Be",
        "Start"
      ],
      "tenses": [
        "Present Continuous (I am looking for)",
        "Present Simple"
      ],
      "example_opening": "Yes, I am the one. Hello.",
      "grammar_tip": "Presentaciones: 'I am here for...'."
    }
  },
  {
    "id": "scene-7-2",
    "story_id": "story-007",
    "order": 2,
    "title": "La Cocina",
    "narrative_context": "Entras al apartamento. Es pequeño pero iluminado.",
    "situation": "Estás en la cocina inspeccionando.",
    "objective": "Pregunta si la estufa funciona y dónde está la lavadora.",
    "character_name": "Mr. Schmidt",
    "character_role": "Dueño del edificio",
    "character_opening_dialogue": "Here is the kitchen. Small, but functional. Gas stove.",
    "character_advance_dialogue": "Stove works perfectly. Washing machine is not included. You go to laundromat down the street.",
    "character_pause_dialogue": "Washing machine? No. Laundromat.",
    "base_duration_seconds": 90,
    "atmosphere": "quiet",
    "background_description": "Empty apartment kitchen",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Work",
        "Include",
        "Have",
        "Use"
      ],
      "tenses": [
        "Present Simple (Does it work?)",
        "Passive Voice (Is it included?)"
      ],
      "example_opening": "Does the stove work? Where is the washer?",
      "grammar_tip": "Preguntas de funcionalidad: 'Does X work?'."
    }
  },
  {
    "id": "scene-7-3",
    "story_id": "story-007",
    "order": 3,
    "title": "Negociación",
    "narrative_context": "Te gusta el lugar, pero el precio es alto.",
    "situation": "El dueño te mira esperando una respuesta.",
    "objective": "Pregunta si el precio incluye servicios (agua/luz).",
    "character_name": "Mr. Schmidt",
    "character_role": "Dueño del edificio",
    "character_opening_dialogue": "So? 1200 a month. Take it or leave it.",
    "character_advance_dialogue": "Water is included. Electricity is extra. That is standard.",
    "character_pause_dialogue": "Water yes. Electric no. Standard.",
    "base_duration_seconds": 90,
    "atmosphere": "tense",
    "background_description": "Living room with sunlight",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Include",
        "Cost",
        "Pay",
        "Think"
      ],
      "tenses": [
        "Present Simple (Does it include?)",
        "Future (Will I pay?)"
      ],
      "example_opening": "Does the price include water and light?",
      "grammar_tip": "Preguntas sobre contenido: 'Does it include...?'."
    }
  },
  {
    "id": "scene-7-4",
    "story_id": "story-007",
    "order": 4,
    "title": "El Contrato",
    "narrative_context": "Decides tomarlo. Él saca un papel.",
    "situation": "Firma el acuerdo verbal.",
    "objective": "Di que lo tomas y pregunta cuándo puedes mudarte.",
    "character_name": "Mr. Schmidt",
    "character_role": "Dueño del edificio",
    "character_opening_dialogue": "Good choice. I need deposit now. When do you move in?",
    "character_advance_dialogue": "Next Monday is fine. I will give you keys then. Welcome.",
    "character_pause_dialogue": "Monday? Keys? Okay.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Sign",
        "Move",
        "Pay",
        "Give"
      ],
      "tenses": [
        "Future (I will move)",
        "Present Simple"
      ],
      "example_opening": "I am happy. I will move on Monday.",
      "grammar_tip": "Confirmación de planes futuros."
    }
  },
  {
    "id": "scene-7-5",
    "story_id": "story-007",
    "order": 5,
    "title": "Negociación del Precio",
    "narrative_context": "El apartamento te gusta bastante, es momento de hablar de dinero.",
    "situation": "Preguntas sobre la renta mensual.",
    "objective": "Intenta que baje el precio ofreciendo un depósito mayor.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "Rent is $1500 a month, not including utilities.",
    "character_advance_dialogue": "If you pay a larger deposit, I can reduce it to $1400.",
    "character_pause_dialogue": "I am not lowering the price for nothing.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Lower",
        "Deposit",
        "Give"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Would you lower it if I pay more deposit?",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-7-6",
    "story_id": "story-007",
    "order": 6,
    "title": "Mascotas",
    "narrative_context": "Recuerdas que tienes un gato pequeño.",
    "situation": "El dueño dice que normalmente no permiten animales.",
    "objective": "Asegura que tu gato es muy tranquilo y no hace ruido.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "By the way, as a rule, I don't accept pets.",
    "character_advance_dialogue": "Well, if it is a quiet cat, I can make an exception.",
    "character_pause_dialogue": "What kind of pet did you say you have?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Have",
        "Quiet",
        "Cat"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "My cat is very quiet.",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-7-7",
    "story_id": "story-007",
    "order": 7,
    "title": "Reparaciones",
    "narrative_context": "Ves que la pintura de una habitación está descascarada.",
    "situation": "El dueño parece no haberlo notado.",
    "objective": "Señala la pared y pregunta si la pintarán antes de mudarte.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "Everything was recently renovated.",
    "character_advance_dialogue": "Oh, you're right. I will have that wall repainted.",
    "character_pause_dialogue": "What's wrong with the walls? Speak clearly.",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Fix",
        "Paint",
        "Wall"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Can you paint that wall?",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-7-8",
    "story_id": "story-007",
    "order": 8,
    "title": "El Contrato",
    "narrative_context": "El dueño te muestra unas hojas.",
    "situation": "Habla sobre un contrato mínimo de un año.",
    "objective": "Pide si es posible hacer un contrato de seis meses primero.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "The lease is for 12 months minimum.",
    "character_advance_dialogue": "Six months? We can negotiate that if everything checks out.",
    "character_pause_dialogue": "Are you planning to stay less than a year?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Sign",
        "Stay",
        "Months"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Can we do six months?",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-7-9",
    "story_id": "story-007",
    "order": 9,
    "title": "Vecinos",
    "narrative_context": "Caminan hacia la puerta de salida para terminar.",
    "situation": "Escuchas un poco de ruido...",
    "objective": "Pregunta de manera casual sobre cómo son los vecinos.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "It usually gets very peaceful here at night.",
    "character_advance_dialogue": "The neighbors are an older couple. Very quiet, don't worry.",
    "character_pause_dialogue": "Are you afraid of noise?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Hear",
        "Quiet",
        "Neighbors"
      ],
      "tenses": [
        "Present Simple",
        "Modals (Can/Could)"
      ],
      "example_opening": "Are the neighbors loud?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-7-10",
    "story_id": "story-007",
    "order": 10,
    "title": "La Decisión",
    "narrative_context": "Apunto de salir, necesitas darle una respuesta.",
    "situation": "El dueño te da una tarjeta y te dice que tiene otros interesados.",
    "objective": "Dile que confirmarás mañana a primera hora.",
    "character_name": "Dueño",
    "character_role": "Personaje",
    "character_opening_dialogue": "I have another showing tomorrow, so let me know.",
    "character_advance_dialogue": "Great, I'll expect your call tomorrow morning!",
    "character_pause_dialogue": "So... do you want the place or not?",
    "base_duration_seconds": 60,
    "atmosphere": "happy",
    "background_description": "Apartment hallway",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Call",
        "Think",
        "Decide"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "I will call you tomorrow.",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-8-1",
    "story_id": "story-008",
    "order": 1,
    "title": "La Víctima",
    "narrative_context": "El tren avanza en la noche. Una mujer grita en el vagón 4.",
    "situation": "La Baronesa está furiosa.",
    "objective": "Calma a la mujer y pregúntale cuándo vio el collar por última vez.",
    "character_name": "Baroness Von Rilke",
    "character_role": "Víctima dramática",
    "character_opening_dialogue": "My diamonds! Gone! Vanished into thin air! Someone on this train is a thief!",
    "character_advance_dialogue": "I had it at dinner! Then I went to the washroom, and poof! Gone! You must find it!",
    "character_pause_dialogue": "Are you deaf? My DIAMONDS!",
    "base_duration_seconds": 90,
    "atmosphere": "hysterical",
    "background_description": "Luxury train cabin",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Calm",
        "See",
        "Lose",
        "Find"
      ],
      "tenses": [
        "Past Simple (When did you see it?)",
        "Imperative (Calm down)"
      ],
      "example_opening": "Please calm down Madam. When did you see it?",
      "grammar_tip": "Imperativos para dar órdenes suaves."
    }
  },
  {
    "id": "scene-8-2",
    "story_id": "story-008",
    "order": 2,
    "title": "El Camarero",
    "narrative_context": "Interrogas al personal. El camarero servía la cena.",
    "situation": "El camarero parece esconder algo.",
    "objective": "Pregúntale quién se levantó de la mesa durante la cena.",
    "character_name": "Pierre",
    "character_role": "Camarero nervioso",
    "character_opening_dialogue": "I saw nothing, Monsieur. I was just serving the soup.",
    "character_advance_dialogue": "Well... the man in the grey suit left early. He looked... sweaty. That is all I know.",
    "character_pause_dialogue": "I serve soup. No look people.",
    "base_duration_seconds": 90,
    "atmosphere": "suspicious",
    "background_description": "Dining car",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "See",
        "Leave",
        "Notice",
        "Know"
      ],
      "tenses": [
        "Past Simple (Who left?)",
        "Past Continuous (Who was eating?)"
      ],
      "example_opening": "Pierre, who left the table early?",
      "grammar_tip": "Interrogativos: 'Who', 'What', 'Where'."
    }
  },
  {
    "id": "scene-8-3",
    "story_id": "story-008",
    "order": 3,
    "title": "El Sospechoso",
    "narrative_context": "Buscas al hombre del traje gris. Está fumando entre vagones.",
    "situation": "Te acercas a él.",
    "objective": "Confróntalo sobre por qué dejó la cena temprano.",
    "character_name": "Mr. Grey",
    "character_role": "Sospechoso defensivo",
    "character_opening_dialogue": "You got a light? What do you want? I'm trying to relax here.",
    "character_advance_dialogue": "I left because the soup was cold! That's not a crime! I was in my cabin alone!",
    "character_pause_dialogue": "Leave me alone.",
    "base_duration_seconds": 120,
    "atmosphere": "hostile",
    "background_description": "Train corridor, night view outside",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Leave",
        "Go",
        "Do",
        "Hide"
      ],
      "tenses": [
        "Past Simple (Why did you leave?)",
        "Present Continuous (What are you doing?)"
      ],
      "example_opening": "Why did you leave the dinner?",
      "grammar_tip": "Preguntas directas con 'Why'."
    }
  },
  {
    "id": "scene-8-4",
    "story_id": "story-008",
    "order": 4,
    "title": "El Revisor",
    "narrative_context": "Necesitas verificar la coartada.",
    "situation": "El revisor tiene el registro de llaves.",
    "objective": "Pregunta si alguien entró a la cabina de la Baronesa.",
    "character_name": "Conductor",
    "character_role": "Revisor meticuloso",
    "character_opening_dialogue": "Tickets, please. Oh, the detective. How can I assist?",
    "character_advance_dialogue": "Let me check the logs... Ah! Cabin 4 was accessed at 8:15 PM by... a master key. Only staff have those.",
    "character_pause_dialogue": "I need verify tickets first.",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Check",
        "Enter",
        "See",
        "Access"
      ],
      "tenses": [
        "Past Simple (Did anyone enter?)",
        "Present Perfect (Has anyone seen...?)"
      ],
      "example_opening": "Did anyone enter Cabin 4?",
      "grammar_tip": "Usa 'Anyone' en preguntas."
    }
  },
  {
    "id": "scene-8-5",
    "story_id": "story-008",
    "order": 5,
    "title": "Sospechoso 1",
    "narrative_context": "Comienzas tus entrevistas en el vagón comedor.",
    "situation": "El Conde está bebiendo té nerviosamente.",
    "objective": "Interroga al Conde sobre dónde estaba a las nueve.",
    "character_name": "El Conde",
    "character_role": "Personaje",
    "character_opening_dialogue": "Detective... I assume you want to question me about the missing jewels?",
    "character_advance_dialogue": "I was in the dining car the whole time, reading my paper!",
    "character_pause_dialogue": "What exactly are you accusing me of?",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Where",
        "See",
        "Read"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Where were you at 9 PM?",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-8-6",
    "story_id": "story-008",
    "order": 6,
    "title": "Sospechoso 2",
    "narrative_context": "Vas al vagón de carga donde la sirvienta estaba organizando.",
    "situation": "La sirvienta dice haber visto a alguien...",
    "objective": "Pídele que describa físicamente a la persona que vio correr.",
    "character_name": "La Sirvienta",
    "character_role": "Personaje",
    "character_opening_dialogue": "Sir, I... I saw someone in the hallway! Near the lady's cabin!",
    "character_advance_dialogue": "He was tall and wore a coat... I couldn't see his face.",
    "character_pause_dialogue": "He was fast. What do you want to know about him?",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Who",
        "Run",
        "Describe"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "What did the man look like?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-8-7",
    "story_id": "story-008",
    "order": 7,
    "title": "Una Pista Falsa",
    "narrative_context": "Vuelves a la escena del crimen.",
    "situation": "Encuentras un guante viejo tirado bajo la cama.",
    "objective": "Enseña el guante a la víctima y pregunta si es suyo.",
    "character_name": "Víctima",
    "character_role": "Personaje",
    "character_opening_dialogue": "Have you found my necklace, detective?! Oh, please!",
    "character_advance_dialogue": "That glove? No, it's not mine! It's too big!",
    "character_pause_dialogue": "What is that in your hand?",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Yours",
        "Drop",
        "Find"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Is this your glove?",
      "grammar_tip": "Usa palabras de transición (and, but, so, because)."
    }
  },
  {
    "id": "scene-8-8",
    "story_id": "story-008",
    "order": 8,
    "title": "Acusación, Parte 1",
    "narrative_context": "Reúnes a todos en el vagón comedor.",
    "situation": "Vas a revelar los misterios que encontraste.",
    "objective": "Comienza diciendo que sabes exactamente cómo ocurrió el robo.",
    "character_name": "El Conde",
    "character_role": "Personaje",
    "character_opening_dialogue": "Why have we all been gathered here like common criminals?!",
    "character_advance_dialogue": "Very well... explain your theory then, detective.",
    "character_pause_dialogue": "Get straight to the point!",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Gather",
        "Know",
        "Listen"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "I know exactly what happened.",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-8-9",
    "story_id": "story-008",
    "order": 9,
    "title": "Acusación, Parte 2",
    "narrative_context": "La tensión aumenta entre los pasajeros.",
    "situation": "Demuestras que la ventana estaba rota desde adentro.",
    "objective": "Exige saber quién rompió la ventana como distracción.",
    "character_name": "Víctima",
    "character_role": "Personaje",
    "character_opening_dialogue": "Broken from the inside? That means... it was one of us?!",
    "character_advance_dialogue": "You think someone faked the break-in? That's ridiculous!",
    "character_pause_dialogue": "But who would break it from the inside?",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Inside",
        "Trick",
        "Fake"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "The window was broken from inside!",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-8-10",
    "story_id": "story-008",
    "order": 10,
    "title": "El Arresto Final",
    "narrative_context": "Reúnes todas tus piezas clave apuntando a la sirvienta misma.",
    "situation": "Ella se asusta y entra en pánico.",
    "objective": "Ordena a los agentes que la detengan formalmente.",
    "character_name": "La Sirvienta",
    "character_role": "Personaje",
    "character_opening_dialogue": "No! You have it all wrong! It wasn't me!",
    "character_advance_dialogue": "Curse you, detective! It was supposed to be the perfect crime!",
    "character_pause_dialogue": "You can't prove anything!",
    "base_duration_seconds": 90,
    "atmosphere": "investigative",
    "background_description": "Conductor's booth",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Arrest",
        "Guilty",
        "Done"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Arrest her! She did it!",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-9-1",
    "story_id": "story-009",
    "order": 1,
    "title": "La Entrada",
    "narrative_context": "Bajos masivos vibran en el aire. Hay miles de personas.",
    "situation": "Seguridad te revisa la mochila.",
    "objective": "Muestra tu pulsera y pregunta dónde están los baños.",
    "character_name": "Security Guard",
    "character_role": "Guardia estricto",
    "character_opening_dialogue": "Bag open. No lass bottles. Wristband?",
    "character_advance_dialogue": "You're good. Toilets are on the left, main stage straight ahead. Keep moving.",
    "character_pause_dialogue": "Wristband. Show me wristband.",
    "base_duration_seconds": 60,
    "atmosphere": "loud",
    "background_description": "Festival gates with flashing lights",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Show",
        "Ask",
        "Have",
        "Open"
      ],
      "tenses": [
        "Present Simple (I have a ticket)",
        "Imperative (Look here)"
      ],
      "example_opening": "Here is my wristband. Where are the toilets?",
      "grammar_tip": "Direcciones: 'Where is X?'."
    }
  },
  {
    "id": "scene-9-2",
    "story_id": "story-009",
    "order": 2,
    "title": "La Barra",
    "narrative_context": "Tienes sed. La barra está llena.",
    "situation": "Gritas para pedir bebidas.",
    "objective": "Pide dos aguas y pregunta si aceptan tarjeta.",
    "character_name": "Bartender",
    "character_role": "Bartender estresado",
    "character_opening_dialogue": "WHAT? I CAN'T HEAR YOU!",
    "character_advance_dialogue": "TWO WATERS? CARD IS FINE! TAP HERE!",
    "character_pause_dialogue": "WHAT?",
    "base_duration_seconds": 60,
    "atmosphere": "chaotic",
    "background_description": "Crowded bar tent",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Want",
        "Take",
        "Pay",
        "Hear"
      ],
      "tenses": [
        "Present Simple (I want water)",
        "Modals (Can I pay...?)"
      ],
      "example_opening": "I want two waters! Can I pay with card?",
      "grammar_tip": "Gritar educadamente."
    }
  },
  {
    "id": "scene-9-3",
    "story_id": "story-009",
    "order": 3,
    "title": "Objetos Perdidos",
    "narrative_context": "Perdiste a tu grupo. La señal de celular es mala.",
    "situation": "Vas al punto de encuentro.",
    "objective": "Pide prestado un teléfono a alguien para llamar a tu amigo.",
    "character_name": "Friendly Raver",
    "character_role": "Asistente amable",
    "character_opening_dialogue": "Whoa dude, you look lost. Need help?",
    "character_advance_dialogue": "For sure, use my phone. Reception is spotty though. Hope they answer!",
    "character_pause_dialogue": "Phone? Here.",
    "base_duration_seconds": 90,
    "atmosphere": "friendly",
    "background_description": "Chill zone with bean bags",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Lose",
        "Call",
        "Use",
        "Help"
      ],
      "tenses": [
        "Past Simple (I lost my friends)",
        "Can (Can I use...?)"
      ],
      "example_opening": "I lost my friends. Can I use your phone?",
      "grammar_tip": "Pedir favores: 'Could I...?' o 'Can I...?'."
    }
  },
  {
    "id": "scene-9-4",
    "story_id": "story-009",
    "order": 4,
    "title": "El Reencuentro",
    "narrative_context": "Ves una bandera familiar cerca del escenario.",
    "situation": "Corres hacia tus amigos.",
    "objective": "Explica dónde estabas y propón ir a ver al DJ principal.",
    "character_name": "Chloe",
    "character_role": "Tu amiga preocupada",
    "character_opening_dialogue": "THERE you are! We thought you got kicked out!",
    "character_advance_dialogue": "Thank god! Yes, let's go! DJ Sol is starting in 5 minutes! Let's dance!",
    "character_pause_dialogue": "Where were you?!",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Find",
        "Go",
        "Dance",
        "Wait"
      ],
      "tenses": [
        "Past Continuous (I was looking for you)",
        "Imperative (Let's go)"
      ],
      "example_opening": "I was looking for you! Let's go dance!",
      "grammar_tip": "Explicaciones pasadas: 'I was + ing'."
    }
  },
  {
    "id": "scene-9-5",
    "story_id": "story-009",
    "order": 5,
    "title": "Batería Muerta",
    "narrative_context": "Tu celular por fin se apaga.",
    "situation": "Tratas de pedir prestado un celular a un grupo festejando.",
    "objective": "Pide cortésmente poder hacer una llamada rápida.",
    "character_name": "Chico del Festival",
    "character_role": "Chico del Festival",
    "character_opening_dialogue": "Whooooo! What an amazing concert! Did you see the lights?!",
    "character_advance_dialogue": "Sure man, here's my phone. Just make it quick.",
    "character_pause_dialogue": "I can't hear you! The bass is too loud!",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Borrow",
        "Call",
        "Quick"
      ],
      "tenses": [
        "Past Simple",
        "Present Continuous"
      ],
      "example_opening": "Can I borrow your phone for a second?",
      "grammar_tip": "Haz preguntas claras empezando con Wh- words (What, Where, Why)."
    }
  },
  {
    "id": "scene-9-6",
    "story_id": "story-009",
    "order": 6,
    "title": "La Operadora Automática",
    "narrative_context": "Marcas el número de tu amiga.",
    "situation": "Ella contesta con mucho ruido.",
    "objective": "Dile que tu teléfono murió y pregunta dónde está ella.",
    "character_name": "Voz de Amiga",
    "character_role": "Personaje",
    "character_opening_dialogue": "Hello? Who is this? It's so loud here!",
    "character_advance_dialogue": "Oh! You're alive! I'm by the big red tent!",
    "character_pause_dialogue": "I don't know who this is, text me instead!",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Dead",
        "Where",
        "Loud"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "My phone died! Where are you?",
      "grammar_tip": "Mantén un tono adecuado (formal o casual) según el personaje."
    }
  },
  {
    "id": "scene-9-7",
    "story_id": "story-009",
    "order": 7,
    "title": "Mucha Multitud",
    "narrative_context": "Caminas hacia la tienda roja.",
    "situation": "Alguien choca fuertemente contigo, derramando bebida.",
    "objective": "Avisa al despistado que te ponga cuidado.",
    "character_name": "Asistente Despistado",
    "character_role": "Asistente Despistado",
    "character_opening_dialogue": "Oh man, my bad! So sorry! The crowd is crazy!",
    "character_advance_dialogue": "Yeah, no worries, I'll watch where I step. Sorry!",
    "character_pause_dialogue": "Chill! The floor is slippery anyway.",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Careful",
        "Watch",
        "Bump"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "Oh sorry! The crowd is crazy.",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  },
  {
    "id": "scene-9-8",
    "story_id": "story-009",
    "order": 8,
    "title": "La Carpa Roja",
    "narrative_context": "Llegas a la carpa roja, pero ella no está ahí.",
    "situation": "El personal de seguridad impide el paso al VIP.",
    "objective": "Pregunta al guardia si vio a una chica de pelo azul.",
    "character_name": "Guardia de Festival",
    "character_role": "Guardia de Festival",
    "character_opening_dialogue": "VIP access only. Keep moving, folks.",
    "character_advance_dialogue": "Blue hair? Yeah, she walked towards the food trucks 10 minutes ago.",
    "character_pause_dialogue": "I see thousands of people every hour. Describe her better.",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "See",
        "Walk",
        "Hair"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Have you seen a girl with blue hair?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-9-9",
    "story_id": "story-009",
    "order": 9,
    "title": "Food Trucks",
    "narrative_context": "Sigues al área de comida. Huele genial pero estás desesperado/a.",
    "situation": "Le compras algo a un vendedor mientras buscas.",
    "objective": "Pide unas papas y pregunta si puede voltear la música.",
    "character_name": "Vendedor",
    "character_role": "Personaje",
    "character_opening_dialogue": "Hot fries! Get your festival food here! Need something?",
    "character_advance_dialogue": "Sure, one portion! And I can ask to lower the speakers!",
    "character_pause_dialogue": "Turn what down? I'm working here.",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": False,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Buy",
        "Turn down",
        "Loud"
      ],
      "tenses": [
        "Present Perfect",
        "Future (Will/Going to)"
      ],
      "example_opening": "Can you make it a bit quieter?",
      "grammar_tip": "Usa oraciones completas de Sujeto + Verbo + Predicado."
    }
  },
  {
    "id": "scene-9-10",
    "story_id": "story-009",
    "order": 10,
    "title": "El Reencuentro",
    "narrative_context": "Finalmente la ves comprando unos refrescos.",
    "situation": "Corres a abrazarla, ella está a salvo.",
    "objective": "Dile que la llevas buscando por más de dos horas.",
    "character_name": "Voz de Amiga",
    "character_role": "Personaje",
    "character_opening_dialogue": "Hey! There you are! I was getting worried!",
    "character_advance_dialogue": "Two hours? Time definitely flew! I'm glad we found each other.",
    "character_pause_dialogue": "Wait, how long have you been wandering?",
    "base_duration_seconds": 60,
    "atmosphere": "euphoric",
    "background_description": "Main stage with lasers",
    "is_final_scene": True,
    "created_at": "2026-03-18T10:00:00Z",
    "guidance": {
      "key_verbs": [
        "Look",
        "Worry",
        "Find"
      ],
      "tenses": [
        "Imperatives",
        "Polite requests (Would)"
      ],
      "example_opening": "I've been looking for you for two hours!",
      "grammar_tip": "Añade detalles para sonar más natural."
    }
  }
]

import os

def check_db():
    db_path = 'frontend/data/db.json'
    if os.path.exists(db_path):
        with open(db_path, 'r', encoding='utf-8') as f:
            try:
                db = json.load(f)
            except:
                db = {}
    else:
        db = {}
        if not os.path.exists('frontend/data'):
            os.makedirs('frontend/data')
            
    if 'stories' not in db:
        db['stories'] = []
    if 'scenes' not in db:
        db['scenes'] = []
        
    db['stories'] = stories
    db['scenes'] = scenes
    
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        
if __name__ == '__main__':
    check_db()
    print("Database seeded with stories successfully.")
