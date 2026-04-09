# ⚙️ ANIMACIONES CSS Y CONFIGURACIÓN TAILWIND

## 1. CONFIGURACIÓN TAILWIND.CONFIG.TS - Actualización

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Fuentes ya configuradas (no cambiar)
      fontFamily: {
        tech: ["var(--font-orbitron)"],
        techBody: ["var(--font-rajdhani)"],
        techMono: ["var(--font-share-tech-mono)"],
        display: ["var(--font-sora)"],
        body: ["var(--font-dm-sans)"],
        mono: ["var(--font-jetbrains-mono)"],
      },

      // Colores ya configurados (no cambiar)
      colors: {
        midnight: {
          50: "#1C2430",
          DEFAULT: "#0D1117",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4", // Primary
          600: "#0891b2",
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F59E0B", // Primary
          600: "#d97706",
        },
        emerald: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10B981", // Success
          600: "#059669",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6", // Premium
          600: "#7c3aed",
        },
        coral: {
          DEFAULT: "#F87171", // Alert
        },
      },

      // NUEVA SECCIÓN: Animaciones gamificadas
      animation: {
        "float-up": "float-up 1s ease-out forwards",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "streak-pulse": "streak-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "achievement-unlock": "achievement-unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-gentle": "bounce-gentle 1s ease-in-out infinite",
      },

      // NUEVA SECCIÓN: Keyframes animaciones
      keyframes: {
        "float-up": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-40px)",
          },
        },
        "pulse-neon": {
          "0%, 100%": {
            boxShadow:
              "0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)",
          },
          "50%": {
            boxShadow:
              "0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.5)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-1000px 0",
          },
          "100%": {
            backgroundPosition: "1000px 0",
          },
        },
        "streak-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.1)",
            opacity: "0.8",
          },
        },
        "achievement-unlock": {
          "0%": {
            transform: "scale(0.5) rotateZ(-10deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.1) rotateZ(5deg)",
          },
          "100%": {
            transform: "scale(1) rotateZ(0deg)",
            opacity: "1",
          },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },

      // NUEVA SECCIÓN: Shadow personalizadas (neon)
      boxShadow: {
        "neon-cyan": "0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)",
        "neon-cyan-lg": "0 0 15px rgba(6, 182, 212, 0.7), 0 0 30px rgba(6, 182, 212, 0.4)",
        "neon-amber": "0 0 10px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3)",
        "neon-amber-lg": "0 0 15px rgba(245, 158, 11, 0.7), 0 0 30px rgba(245, 158, 11, 0.4)",
        "neon-emerald": "0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)",
        "neon-emerald-lg": "0 0 15px rgba(16, 185, 129, 0.7), 0 0 30px rgba(16, 185, 129, 0.4)",
        "neon-violet": "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)",
        "neon-coral": "0 0 10px rgba(248, 113, 113, 0.5), 0 0 20px rgba(248, 113, 113, 0.3)",
      },

      // NUEVA SECCIÓN: Transiciones personalizadas
      transitionTimingFunction: {
        "cubic-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "cubic-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "cubic-back": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 2. GLOBAL STYLES (app/globals.css)

```css
/* ========================================
   GAMIFICATION - ANIMACIONES GLOBALES
   ======================================== */

/* Float up para XP earned */
@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}

/* Pulse neon mejorado */
@keyframes pulse-neon {
  0%, 100% {
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5),
                0 0 20px rgba(6, 182, 212, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.8),
                0 0 40px rgba(6, 182, 212, 0.5);
  }
}

/* Shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Streak pulse */
@keyframes streak-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Achievement unlock bounce */
@keyframes achievement-unlock {
  0% {
    transform: scale(0.5) rotateZ(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotateZ(5deg);
  }
  100% {
    transform: scale(1) rotateZ(0deg);
    opacity: 1;
  }
}

/* Gentle bounce */
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Clase aplicable */
.animate-float-up {
  animation: float-up 1s ease-out forwards;
}

.animate-pulse-neon {
  animation: pulse-neon 2s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 3s linear infinite;
  background-size: 1000px 100%;
}

.animate-streak-pulse {
  animation: streak-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-achievement-unlock {
  animation: achievement-unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-bounce-gentle {
  animation: bounce-gentle 1s ease-in-out infinite;
}

/* ========================================
   EFECTO GRID BACKGROUND
   ======================================== */

.grid-background {
  background-image:
    linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px),
    linear-gradient(0deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 0 0;
  opacity: 0.05;
}

/* ========================================
   GLASS MORPHISM
   ======================================== */

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-effect-light {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* ========================================
   GRADIENTES DE TEXTO
   ======================================== */

.text-gradient-cyan {
  background: linear-gradient(135deg, #06b6d4, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-amber {
  background: linear-gradient(135deg, #F59E0B, #fcd34d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-emerald {
  background: linear-gradient(135deg, #10B981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-violet {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ========================================
   TRANSITIONS SUAVES
   ======================================== */

/* Smooth all para cards */
.smooth-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Rapid feedback */
.rapid-feedback {
  transition: all 0.1s ease;
}

/* Smooth entrance */
.smooth-entrance {
  animation: fade-in-up 0.5s ease-out;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   SCROLLBAR PERSONALIZADA (Gaming Feel)
   ======================================== */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #06b6d4, #F59E0B);
  border-radius: 4px;
  border: 2px solid rgba(15, 23, 42, 0.5);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #22d3ee, #fcd34d);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

/* ========================================
   FOCUS STATES (Accessibility)
   ======================================== */

button:focus,
input:focus,
[role="button"]:focus {
  outline: 2px solid #06b6d4;
  outline-offset: 2px;
}

/* ========================================
   RESPONSIVE TYPOGRAPHY
   ======================================== */

@media (max-width: 640px) {
  body {
    font-size: 14px;
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }
}

/* ========================================
   PRINT STYLES (Optional)
   ======================================== */

@media print {
  .no-print {
    display: none !important;
  }

  .glass-effect {
    background: white;
    border: 1px solid #e5e7eb;
  }
}
```

---

## 3. EJEMPLO: USO EN COMPONENTE

```tsx
// GamificationElements.tsx - XPBadge con todas las animaciones

import { cn } from "@/lib/utils";

export function XPBadge({ xp, variant = "md", animated = false }: Props) {
  return (
    <div
      className={cn(
        // Base styles
        "inline-flex items-center gap-1.5 font-mono font-semibold",
        "bg-gradient-to-r from-amber-500/20 to-amber-400/10",
        "border border-amber-400/50 rounded-lg",
        "text-amber-300",
        
        // ANIMACIONES
        animated && [
          "smooth-card", // Smooth all transitions
          "hover:shadow-neon-amber-lg", // Custom neon shadow
          "hover:border-amber-400/80", // Border animation
        ],

        // Variants
        variant === "sm" && "px-2 py-0.5 text-xs",
        variant === "md" && "px-3 py-1 text-sm shadow-neon-amber",
        variant === "lg" && "px-4 py-2 text-base shadow-neon-amber-lg",
      )}
    >
      <span>+{xp}</span>
      <span className="text-amber-400 animate-bounce-gentle">⚡</span>
    </div>
  );
}
{% endraw %}
```

---

## 4. MICROINTERACCIONES - Trigger Examples

### 4.1 Respuesta Correcta

```tsx
{% raw %}
{isCorrect && (
  <div className={cn(
    "mt-4 p-4 rounded-lg",
    "bg-emerald-500/10 border border-emerald-500/50",
    "shadow-neon-emerald", // automático glow
    "animate-achievement-unlock" // para effect bounce
  )}>
    <div className="flex justify-between items-center">
      <span className="text-emerald-300 animate-pulse">✓ ¡Excelente!</span>
      <XPBadge xp={50} variant="sm" animated />
    </div>
  </div>
)}
{% endraw %}
```

### 4.2 Desbloquear Achievement

```tsx
{% raw %}
const [justUnlocked, setJustUnlocked] = useState(false);

// Cuando logro se desbloquea:
setJustUnlocked(true);
setTimeout(() => setJustUnlocked(false), 1000);

return (
  <div className={cn(
    justUnlocked && "animate-achievement-unlock"
  )}>
    <AchievementBadge unlocked={true} {...props} />
  </div>
);
{% endraw %}
```

### 4.3 Flotar XP Ganado

```tsx
{% raw %}
// En componente padre
const floating = () => {
  return (
    <div 
      className="fixed pointer-events-none animate-float-up"
      style={{
        left: `${xCoord}px`,
        top: `${yCoord}px`,
      }}
    >
      <span className="text-lg font-bold text-emerald-400 drop-shadow-lg">
        +{xp} XP
      </span>
    </div>
  );
};
{% endraw %}
```

---

## 5. PERFORMANCE TIPS

### Evitar exceso de animaciones

❌ MALO:
```css
* {
  transition: all 0.3s; /* Todo animado */
}
```

✅ BUENO:
```css
.smooth-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button {
  transition: transform 0.2s, box-shadow 0.2s;
}
```

### Usar `will-change` con cuidado

```css
/* Solo cuando sea necesario */
.animated-element {
  will-change: transform, opacity;
  animation: float-up 1s ease-out;
}

/* Remover después */
.animated-element:not(.animating) {
  will-change: auto;
}
```

### Reducir motion para accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. CHECKLIST DE INTEGRACIÓN

- [ ] Actualizar `tailwind.config.ts` con nuevas animaciones
- [ ] Agregar estilos a `app/globals.css`
- [ ] Importar `cn` desde `@/lib/utils` en componentes
- [ ] Usar clases `animate-float-up`, `animate-pulse-neon`, etc.
- [ ] Probar en Chrome, Firefox, Safari (compatibilidad)
- [ ] Probar en mobile (performance)
- [ ] Verificar contrast ratios (WCAG AA)
- [ ] Prueba con `prefers-reduced-motion`

---

## 7. DEBUGGING

### Animación no funciona

```bash
# Check in browser DevTools:
# 1. Inspect element
# 2. Compute tab → scroll to animation
# 3. Ver si animation está applied
# 4. Ver si duration es visible (>0ms)
```

### Glow effect no visible

```tsx
// Verificar que shadow esté en elemento:
className={cn(
  "shadow-neon-cyan", // Must be present
  hover && "shadow-neon-cyan-lg", // Optional hover
)}
```

### Z-index issues con float

```tsx
{% raw %}
// Asegurar que float está en fixed/absolute con z-index alto
<div className="fixed z-50 pointer-events-none animate-float-up">
{% endraw %}
```

---

Este es el sistema completo de animaciones y estilos. Todo es reutilizable, performante y accesible. ¿Comenzamos?
