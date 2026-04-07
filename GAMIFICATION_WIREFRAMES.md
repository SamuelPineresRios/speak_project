# 📱 WIREFRAMES Y MOCKUPS - GUIDES GAMIFICADO

## 1. VISTA DE LISTADO - GuidesList (Desktop)

```
╔════════════════════════════════════════════════════════════════════════╗
║                         📚 GUIDES - Learning Academy                  ║
║                                                                        ║
║  Filter: [All] [A1] [A2] [B1] [B2]  Sort: [Progreso ▼]              ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  ┌─────────────────────────┐  ┌─────────────────────────┐              ║
║  │ 📚 Present Perfect      │  │ 🔤 Phrasal Verbs        │              ║
║  ├─────────────────────────┤  ├─────────────────────────┤              ║
║  │ [B1]   ⏱ 20 mins       │  │ [B1]   ⏱ 25 mins       │              ║
║  │                         │  │                         │              ║
║  │ The most important... │  │ Learn common phrasal... │              ║
║  │                         │  │                         │              ║
║  │ ▓▓▓▓▓░░░░ 50%          │  │ ▓▓▓▓▓▓▓▓░░ 80%         │              ║
║  │ 5/10 Exercises Done     │  │ 8/10 Exercises Done     │              ║
║  │                         │  │                         │              ║
║  │ ⏳ En Progreso    🔥 3 │  │ ✓ Completado     🔥 5   │              ║
║  │                         │  │                         │              ║
║  │ ┏─────────────────────┓ │  │ ┏─────────────────────┓ │              ║
║  │ ┃ Tipo: hover        ┃ │  │ ┃ [+150 XP] ⚡       ┃ │ ← Aparece  ║
║  │ ┃ Color: Amber       ┃ │  │ ┃ [REVISAR] [📊]    ┃ │   al hover ║
║  │ ┗─────────────────────┘ │  │ ┗─────────────────────┘ │              ║
║  └─────────────────────────┘  └─────────────────────────┘              ║
║                                                                        ║
║  ┌─────────────────────────┐  ┌─────────────────────────┐              ║
║  │ 🔄 Conditional Sent.    │  │ 🎭 Passive Voice        │              ║
║  ├─────────────────────────┤  ├─────────────────────────┤              ║
║  │ [B1]   ⏱ 22 mins       │  │ [B1]   ⏱ 18 mins       │              ║
║  │                         │  │                         │              ║
║  │ Master the grammar of.. │  │ Transform active to... │              ║
║  │                         │  │                         │              ║
║  │ ▓░░░░░░░░ 10%          │  │ ░░░░░░░░░░ 0%          │              ║
║  │ 1/10 Exercises Done     │  │ 0/5 Exercises Done      │              ║
║  │                         │  │                         │              ║
║  │ ⏳ En Progreso          │  │ 🔒 Bloqueado            │              ║
║  └─────────────────────────┘  └─────────────────────────┘              ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

COLOR SCHEME:
├─ Border Normal: cyan-500/20 → Hover: cyan-500/60 (transición 0.3s)
├─ Background: midnight-50/80 (semitransparente)
├─ Progress Bar: Coral (0-33%) → Amber (33-66%) → Emerald (66-100%)
├─ Corner brackets: cyan-500/50 → Hover: cyan-400 (full opacity)
└─ XP Badge: Aparece solo al hover con animación fade-in
```

---

## 2. VISTA DETALLE - GuideDetail (Desktop)

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  [← GUIDES]                                                            ║
║                                                                        ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ 🎯 Present Perfect - The Quest                                  │  ║
║  │                                                                 │  ║
║  │ Difficulty: [B1]  ⏱ 20 mins  🔥 3  Total: +150 XP             │  ║
║  │ ┌─────────────────────────────────────────────────────────┐    │  ║
║  │ │ ▓▓▓▓▓░░░░░ 50% Complete                                │    │  ║
║  │ │ 5/10 Exercises Done  |  Best Accuracy: 87.5%            │    │  ║
║  │ └─────────────────────────────────────────────────────────┘    │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                        ║
║  ┌─ TAB NAVIGATION ─────────────────────────────────────────────────┐  ║
║  │ [📖 CONTENT] [✏️ EJERCICIOS] [🤖 TUTOR] [📊 RESUMEN]           │  ║
║  │                                                                 │  ║
║  │ ╔═══════════════════════════════════════════════════════════╗  │  ║
║  │ ║ CONTENT TAB                                               ║  │  ║
║  │ ╠═══════════════════════════════════════════════════════════╣  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 📚 DEFINITION                                             ║  │  ║
║  │ ║ The Present Perfect is used to describe actions that     ║  │  ║
║  │ ║ started in the past and continue to the present...       ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 🔧 FORMULA                                                ║  │  ║
║  │ ║ Have/Has + Past Participle                               ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 📝 KEY STRUCTURES                                         ║  │  ║
║  │ ║ 1) Affirmative: I have studied                            ║  │  ║
║  │ ║ 2) Negative: I haven't studied                            ║  │  ║
║  │ ║ 3) Question: Have I studied?                              ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 💡 REAL-LIFE EXAMPLES                                     ║  │  ║
║  │ ║ "I have lived in Madrid for 10 years"                     ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ╚═══════════════════════════════════════════════════════════╝  │  ║
║  │                                                                 │  ║
║  │ ╔═══════════════════════════════════════════════════════════╗  │  ║
║  │ ║ EXERCISE TAB                                              ║  │  ║
║  │ ╠═══════════════════════════════════════════════════════════╣  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ EXERCISE 1/10                   ✅ CORRECT  (+10 XP)      ║  │  ║
║  │ ║ ┌───────────────────────────────────────────────────┐   ║  │  ║
║  │ ║ │ "I _____ (work) here for 5 years"                │   ║  │  ║
║  │ ║ │                                                   │   ║  │  ║
║  │ ║ │ [●] have worked  ← Selected: CORRECT              │   ║  │  ║
║  │ ║ │ [ ] work                                           │   ║  │  ║
║  │ ║ │ [ ] am working                                     │   ║  │  ║
║  │ ║ │                                                   │   ║  │  ║
║  │ ║ │ [NEXT EXERCISE] [REVIEW]                          │   ║  │  ║
║  │ ║ └───────────────────────────────────────────────────┘   ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 🎯 Accuracy: 100% | 🔥 Streak: 3 | ⚡ 50 XP earned      ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ╚═══════════════════════════════════════════════════════════╝  │  ║
║  │                                                                 │  ║
║  │ ╔═══════════════════════════════════════════════════════════╗  │  ║
║  │ ║ TUTOR TAB (IA)                                            ║  │  ║
║  │ ╠═══════════════════════════════════════════════════════════╣  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 🤖 AI Tutor | Minimax (Claude Sonnet 4)                   ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ ASSISTANT:                                                ║  │  ║
║  │ ║ "Great question! In Present Perfect, 'have' is used      ║  │  ║
║  │ ║ for I/you/we/they, while 'has' is used for he/she/it. " ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ YOU:                                                       ║  │  ║
║  │ ║ "¿Y cuándo no uso 'have'?"                               ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ ┌─────────────────────────────────────────────────┐     ║  │  ║
║  │ ║ │ [Type your question...] [SEND] ➔               │     ║  │  ║
║  │ ║ └─────────────────────────────────────────────────┘     ║  │  ║
║  │ ║ Context: Learning about Present Perfect in English      ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ╚═══════════════════════════════════════════════════════════╝  │  ║
║  │                                                                 │  ║
║  │ ╔═══════════════════════════════════════════════════════════╗  │  ║
║  │ ║ SUMMARY TAB                                               ║  │  ║
║  │ ╠═══════════════════════════════════════════════════════════╣  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 🎯 OBJECTIVES                                             ║  │  ║
║  │ ║ ✓ Learn formation rules                                   ║  │  ║
║  │ ║ ⏳ Complete 8 exercises (75% done)                        ║  │  ║
║  │ ║ ⏳ Chat with AI tutor                                     ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 📊 STATISTICS                                             ║  │  ║
║  │ ║ ╔─────────┬─────────┬─────────┬─────────╗                ║  │  ║
║  │ ║ │ Total   │Precisión│Racha    │ Días   │                ║  │  ║
║  │ ║ │ +150XP  │ 87.5%   │🔥 5    │ 12     │                ║  │  ║
║  │ ║ ╚─────────┴─────────┴─────────┴─────────╝                ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ 🏆 SKILLS GAINED                                          ║  │  ║
║  │ ║ • Present Perfect Mastery                                 ║  │  ║
║  │ ║ • Conversation fluency                                    ║  │  ║
║  │ ║ • Grammar accuracy                                        ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ║ [✓ MARK COMPLETE]  [📤 SHARE ACHIEVEMENT]                ║  │  ║
║  │ ║                                                           ║  │  ║
║  │ ╚═══════════════════════════════════════════════════════════╝  │  ║
║  │                                                                 │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

INTERACTIONS:
├─ Tab hover: Baorder color change cyan/20 → cyan/40
├─ Exercise correct: Flash emerald glow + checkmark animation
├─ XP earned: Float up animation + streak pulse
├─ Progress bar: Smooth width animation 0.5s cubic-bezier
└─ Chat messages: Fade in up from bottom
```

---

## 3. TARJETA DE LOGRO - Achievement Wall

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  🏆 LOGROS (42/100)                                    [X]             ║
║  ├─ Desbloqueados                                                      ║
║  ├─ En Progreso                                                        ║
║  └─ Bloqueados                                                         ║
║                                                                        ║
║  Filtrar: [Todos] [🏆 Hitos] [🔥 Rachas] [🎯 Precisión] [🌍 Exp.]   ║
║                                                                        ║
║  ╔═════════════════════════════════════════════════════════════════╗  ║
║  ║                                                                 ║  ║
║  ║  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                  ║  ║
║  ║  │ 🌱   │  │ 🔥   │  │ 💡   │  │ 📚   │                  ║  ║
║  ║  │Seedln│  │Streak│  │Quick │  │Know. │                  ║  ║
║  ║  │✓ Unlk│  │✓ Unlk│  │⏳ 45%│  │🔒 N/A│                  ║  ║
║  ║  └───────┘  └───────┘  └───────┘  └───────┘                  ║  ║
║  ║                                                                 ║  ║
║  ║  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐                  ║  ║
║  ║  │ 🎯   │  │ 🌍   │  │ 👑   │  │ ✨   │                  ║  ║
║  ║  │Perft │  │Polyg.│  │Master│  │???   │                  ║  ║
║  ║  │100%  │  │🔒 N/A│  │🔒 N/A│  │🔒 N/A│                  ║  ║
║  ║  └───────┘  └───────┘  └───────┘  └───────┘                  ║  ║
║  ║                                                                 ║  ║
║  ╚═════════════════════════════════════════════════════════════════╝  ║
║                                                                        ║
║  LEYENDA:                                                              ║
║  ● Desbloqueado     ◐ En progreso (xx%)    ● Bloqueado              ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

BADGE STATES:
├─ Unlocked: Emerald border + glow shadow, full color
├─ In Progress: Amber border + spinner animation, partial color
├─ Locked: Slate border faded, grayscale, on hover show "unlock hint"
└─ Hover: Scale 1.1, intensity glow increases
```

---

## 4. RESUMEN SESIÓN - Session Complete

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                         🎉🎉🎉 ¡GUÍA COMPLETADA! 🎉🎉🎉              ║
║                                                                        ║
║                        Present Perfect - The Quest                    ║
║                                                                        ║
║  ┌──────────────┬──────────────┬──────────────┐                      ║
║  │    🎯        │     ✅        │     ⚡       │                      ║
║  │             │              │              │                      ║
║  │   92.5%     │    10/10      │   +150 XP    │                      ║
║  │             │              │              │                      ║
║  │  Precisión  │  Ejercicios  │  Ganados     │                      ║
║  │             │              │              │                      ║
║  └──────────────┴──────────────┴──────────────┘                      ║
║                                                                        ║
║  ⏱ Tiempo dedicado: 18 minutos                                       ║
║                                                                        ║
║  ┏────────────────────────────────────────────────────────────────┓  ║
║  ┃ 🏆 ¡NUEVOS LOGROS DESBLOQUEADOS!                              ┃  ║
║  ┣────────────────────────────────────────────────────────────────┫  ║
║  ┃ • 🌱 First Steps - "Completa tu primera guía"                ┃  ║
║  ┃ • 🔥 Hot Streak - "Resuelve 5 en fila sin errores"           ┃  ║
║  ┃ • 💡 Quick Learner - "Acelera tu aprendizaje"                ┃  ║
║  ┗────────────────────────────────────────────────────────────────┘  ║
║                                                                        ║
║  ┏────────────────────────────────────────────────────────────────┓  ║
║  ┃ ⭐ ¡SUBISTE DE NIVEL!                                          ┃  ║
║  ┃ De Nivel 2 a Nivel 3                                           ┃  ║
║  ┃ 🔓 Desbloqueaste guías Premium                                ┃  ║
║  ┗────────────────────────────────────────────────────────────────┘  ║
║                                                                        ║
║                  [SEGUIR APRENDIENDO] [COMPARTIR]                   ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

ANIMATIONS:
├─ Celebrate emoji: bounce infinite 1s
├─ Stat cards: fade-in-up staggered 100ms each
├─ Achievement boxes: glow pulse 2s
└─ Buttons: hover scale 1.05
```

---

## 5. SIDEBAR DERECHO - Right Sidebar (Responsive)

### Desktop (1024px+)

```
┌─────────────────────────────┐
│ 🏆 TU PROGRESO              │
├─────────────────────────────┤
│ Nivel: ⭐⭐⭐ Nivel 3     │
│ Total XP: 2,340             │
│ ├─ Hoy: +150 XP             │
│ └─ Esta semana: +580 XP     │
│                             │
│ ─────────────────────────────│
│ 🔥 RACHA ACTUAL             │
│ 3 guías consecutivas        │
│ Best: 7 guías               │
│                             │
│ ─────────────────────────────│
│ 📊 STATS                    │
│ Precisión Avg: 84.3%        │
│ Guías completadas: 4        │
│ Ejercicios: 42/50           │
│                             │
│ ─────────────────────────────│
│ 🎯 PRÓXIMAS MISIONES        │
│ └─ Phrasal Verbs (B1)       │
│ └─ Passive Voice (B1)       │
│                             │
│ [VER LOGROS] [LEADERBOARD]  │
└─────────────────────────────┘
```

### Tablet (640-1024px)

```
Collapse a icons only:
┌───┐
│🏆 │ (hover -> tooltip "Progreso")
│🔥 │ (hover -> tooltip "Streak: 3")
│📊 │ (collapse/expand stats)
└───┘
```

### Mobile (<640px)

```
Bottom sheet on swipe up:
[─────────────────────────────]
│ 🏆 TU PROGRESO (Swipeable)   │
│                             │
│ Nivel 3 | 2,340 XP          │
│ Racha: 🔥 3 | Best: 7       │
│                             │
│ [RESUMEN] [LOGROS] [STATS]  │
└─────────────────────────────┘
```

---

## 6. COLOR PALETTE REFERENCE

```
ESTADOS DE PROGRESO:
0% ────────────────── 33% ────────────────── 66% ────────────────── 100%
↓                      ↓                      ↓                       ↓
#F87171            #F59E0B               #34D399             #10B981
(Coral)            (Amber)               (Emerald)           (Emerald)
"¡Comienza!"       "¡Casi!"              "¡Cerca!"           "✓ Completado"

BADGES DESBLOQUEADOS:
├─ Border: emerald-400/50
├─ Background: emerald-500/10
├─ Glow: shadow-neon-emerald (0 0 10px rgba(16, 185, 129, 0.5))
└─ Text: emerald-300

BADGES EN PROGRESO:
├─ Border: amber-400/40 (animated pulse)
├─ Background: amber-500/10
├─ Glow: subtle
└─ Ring: spinner animation

BADGES BLOQUEADOS:
├─ Border: slate-600/30
├─ Background: slate-800/10
├─ Filter: grayscale(100%) opacity(50%)
└─ Hover: opacity(75%) grayscale(0%)
```

---

## 7. RESPONSIVE BREAKPOINTS

```
Mobile (<640px):
├─ Grid: 1 columna
├─ Font size: 90% (scale down)
├─ Tabs: horizontal scroll (snap)
├─ Badges: grid 4 columns
└─ Chat: full width keyboard aware

Tablet (640-1024px):
├─ Grid: 2 columnas
├─ Sidebar: collapse a icons
├─ Tabs: visible vertical
├─ Badges: grid 4 columns
└─ Chat: adjusta para teclado

Desktop (1024px+):
├─ Grid: 3 columnas
├─ Sidebar: fijo derecha
├─ Tabs: full tabs
├─ Badges: grid 5-6 columns
└─ Chat: full screen optional
```

---

## 8. ANIMACIONES ESPECIALES

### XP Earned Float

```
START:
│ +150 XP ⚡
│ opacity: 1, transform: translateY(0)
│
     ↑
     ↑
     ↑ (250ms)
     ↑
     ↑

END:
│ +150 XP ⚡ (faded)
│ opacity: 0, transform: translateY(-40px)
│ (total duration: 500ms ease-out)
```

### Achievement Unlock Pulse

```
0%:    box-shadow: 0 0 10px rgba(6,182,212,0.5)
50%:   box-shadow: 0 0 20px rgba(6,182,212,0.8), 
                   0 0 40px rgba(6,182,212,0.5)
100%:  box-shadow: 0 0 10px rgba(6,182,212,0.5)

Duration: 2s ease-in-out infinite
```

### Progress Bar Fill

```
From: width: 0%
To:   width: 45%
Duration: 500ms cubic-bezier(0.4, 0, 0.2, 1)
Background: gradient cyan → emerald (animated)
```

---

## 9. EJEMPLO: FLOW COMPLETO DEL USUARIO

```
[1] User ve GuidesList
    ├─ Cartas con progreso visual
    ├─ Hover muestra botones CTA
    └─ Click navega a GuideDetail

[2] En GuideDetail
    ├─ Ve objetivos en tab Summary
    └─ Comienza ejercicios

[3] Resuelve ejercicio
    ├─ Correcto → Flash verde + +XP float
    ├─ Incorrecto → Flash rojo + reintentar
    └─ Streak contador actualiza

[4] Completa guía
    ├─ SessionSummary celebración
    ├─ Nuevos logros desbloqueados
    ├─ Posible level-up
    └─ Opción share o continuar

[5] Vuelve a GuidesList
    ├─ Card ahora muestra 100% completado
    ├─ Botón cambia a [REVISAR]
    └─ Achievement badges visibles
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN VISUAL

- [ ] Cards con corner brackets decorativos
- [ ] Progress bars con gradiente dinámico
- [ ] XP badges con neon glow
- [ ] Streak counter con animación
- [ ] Achievement badges con 3 estados
- [ ] Tab system responsive
- [ ] SessionSummary con celebrate animation
- [ ] Sidebar responsive desktop/mobile
- [ ] Float-up XP animation
- [ ] Achievement unlock pulse
- [ ] Hover transitions smooth (0.3s)
- [ ] Mobile bottom sheet para sidebar
- [ ] Color palette consistente
- [ ] Fonts: Orbitron (titles), Rajdhani (numbers), DM Sans (body)

---

Este es el diseño final gamificado, 100% funcional, responsivista y coherente con tu estética cyberpunk. ¿Listo para implementar?
