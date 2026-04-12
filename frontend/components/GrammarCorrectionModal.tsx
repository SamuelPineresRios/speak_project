'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface GrammarCorrectionModalProps {
  isOpen: boolean
  originalText: string
  correctedText: string
  feedback: string
  onRetry: () => void
  onContinue: () => void
}

// Typewriter hook
function useTypewriter(text: string, speed: number = 30) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      return
    }
    
    setDisplayedText('')
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return displayedText
}

// Traducir feedback al español (solo si está en inglés)
function translateToSpanish(text: string): string {
  // Si ya contiene palabras españolas comunes, es probable que ya esté en español
  const spanishKeywords = ['respuesta', 'pregunta', 'estoy', 'eres', 'está', 'dijiste', 'es', 'tienes']
  const textLower = text.toLowerCase()
  const hasSpanish = spanishKeywords.some(word => textLower.includes(word))
  
  if (hasSpanish) {
    // Ya está en español, devolverlo como está
    return text
  }

  const translations: Record<string, string> = {
    "You didn't answer my question": "No respondiste mi pregunta",
    "I don't understand": "No entiendo",
    "Please answer the question": "Por favor responde la pregunta",
    "Good answer but": "Buena respuesta pero",
    "Remember to capitalize": "Recuerda capitalizar",
    "capital": "mayúscula",
    "Excellent response": "¡Respuesta excelente!",
    "Clear and engaging": "Clara y atractiva",
    "Please introduce yourself": "Por favor preséntate",
    "including your name": "incluyendo tu nombre",
    "where you are from": "de dónde eres",
    "and something you enjoy": "y algo que disfrutes",
    "did not answer": "No respondiste",
    "answer the question": "responde la pregunta",
  }

  let result = text
  for (const [english, spanish] of Object.entries(translations)) {
    result = result.replace(new RegExp(english, 'gi'), spanish)
  }

  // Si empieza con mayúscula y es una oración completa, capitalizarla
  if (result && result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1)
  }

  return result
}

// Generar ejemplo con nombres reales cuando hay placeholders
function generateExampleFromTemplate(template: string): string | null {
  if (!template) return null
  
  // Detectar si hay placeholders
  const hasPlaceholder = /\[(.+?)\]/.test(template)
  if (!hasPlaceholder) return null

  // Reemplazar placeholders comunes con ejemplos
  let example = template
    .replace(/\[Your name\]/gi, 'John')
    .replace(/\[your name\]/gi, 'John')
    .replace(/\[name\]/gi, 'John')
    .replace(/\[from where\]/gi, 'Spain')
    .replace(/\[where you are from\]/gi, 'Spain')
    .replace(/\[country\]/gi, 'Spain')
    .replace(/\[something you enjoy\]/gi, 'playing soccer')
    .replace(/\[hobby\]/gi, 'playing soccer')

  // Si cambió algo, retornar el ejemplo
  return example !== template ? example : null
}

export function GrammarCorrectionModal({
  isOpen,
  originalText,
  correctedText,
  feedback,
  onRetry,
  onContinue,
}: GrammarCorrectionModalProps) {
  const isRejected = correctedText === '[Respuesta rechazada]'
  const spanishFeedback = translateToSpanish(feedback)
  const displayedFeedback = useTypewriter(spanishFeedback, 25)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={cn(
        "rounded-xl p-6 max-w-md mx-4 space-y-4 animate-in slide-in-from-bottom-5 shadow-2xl",
        isRejected 
          ? "bg-slate-900 border border-red-500/40" 
          : "bg-slate-900 border border-yellow-500/40"
      )}>
        {/* Header */}
        <div className="space-y-1">
          <h2 className={cn("text-base font-bold flex items-center gap-2", isRejected ? "text-red-400" : "text-yellow-400")}>
            <span className="text-lg">{isRejected ? '❌' : '⚠️'}</span>
            {isRejected ? 'Respuesta Incorrecta' : 'Mejora tu Respuesta'}
          </h2>
        </div>

        {/* Feedback Message - Con Typewriter */}
        <div className={cn(
          "p-3 text-sm rounded-lg min-h-12 flex items-start",
          isRejected 
            ? "bg-red-950/30 border border-red-500/20 text-red-200" 
            : "bg-yellow-950/30 border border-yellow-500/20 text-yellow-200"
        )}>
          <span>{displayedFeedback}</span>
          <span className="animate-pulse ml-1">|</span>
        </div>

        {/* Comparison */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400">❌ Lo que dijiste:</label>
            <div className="mt-2 p-3 bg-red-950/20 border border-red-500/30 rounded-lg text-sm text-red-300">
              {`"${originalText}"`}
            </div>
          </div>

          {/* Always show corrected text, regardless of isRejected */}
          {correctedText && correctedText !== '[Respuesta rechazada]' && (
            <div>
              <label className="text-xs font-bold uppercase text-emerald-400">
                {isRejected ? '💡 Forma correcta de responder:' : '✅ Forma correcta:'}
              </label>
              <div className="mt-2 space-y-2">
                {/* Plantilla (si tiene placeholders) o Respuesta directa */}
                {(() => {
                  const hasPlaceholder = /\[(.+?)\]/.test(correctedText)
                  const example = generateExampleFromTemplate(correctedText)
                  
                  if (hasPlaceholder) {
                    return (
                      <>
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 font-semibold italic">
                          {isRejected ? '📋 Plantilla:' : '📋 Estructura:'}
                          <div className="mt-1">{`"${correctedText}"`}</div>
                        </div>
                        
                        {example && (
                          <div className="p-3 bg-emerald-900/30 border border-emerald-500/20 rounded-lg text-sm text-emerald-200">
                            <span className="text-xs text-emerald-400 font-bold">✨ Ejemplo:</span>
                            <div className="mt-1">{`"${example}"`}</div>
                          </div>
                        )}
                      </>
                    )
                  } else {
                    // Sin placeholders, mostrar directamente
                    return (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 font-semibold italic">
                        {`"${correctedText}"`}
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          )}

          {isRejected && (!correctedText || correctedText === '[Respuesta rechazada]') && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-sm text-red-300 italic">
              🔄 Intenta responder de nuevo a mi pregunta anterior.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isRejected ? (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 rounded-lg bg-red-600/30 border border-red-500/40 text-red-300 text-sm font-semibold hover:bg-red-600/40 transition-colors"
            >
              Reintentar
            </button>
          ) : (
            <button
              onClick={onContinue}
              className="w-full px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-sm font-semibold hover:bg-emerald-600/40 transition-colors"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
