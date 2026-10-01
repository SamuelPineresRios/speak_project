import { useEffect, useMemo, useState } from 'react'

interface TypewriterMessageProps {
  text: string
  isActive: boolean // Whether this is the current message being typed
  /** Milisegundos por unidad revelada. */
  speed?: number
  /** Revela palabra a palabra en lugar de carácter a carácter (escenas). */
  byWords?: boolean
}

/**
 * Revela un texto progresivamente.
 *
 * En modo palabra se conservan los espacios para que el texto no baile, y el
 * ritmo es más pausado (una palabra por tick) porque leer palabra a palabra es
 * más natural en una escena narrada que ver aparecer letras sueltas.
 */
export function TypewriterMessage({
  text,
  isActive,
  speed,
  byWords = false,
}: TypewriterMessageProps) {
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  const step = speed ?? (byWords ? 190 : 30)
  const tokens = useMemo(
    () => (byWords ? text.split(/(\s+)/) : text.split('')),
    [text, byWords],
  )

  useEffect(() => {
    if (!isActive || isComplete) {
      setDisplayed(text)
      setIsComplete(true)
      return
    }

    let index = 0
    let timeout: ReturnType<typeof setTimeout>

    const revealNext = () => {
      if (index <= tokens.length) {
        setDisplayed(tokens.slice(0, index).join(''))
        index++
        timeout = setTimeout(revealNext, step)
      } else {
        setIsComplete(true)
      }
    }

    revealNext()

    return () => clearTimeout(timeout)
  }, [text, tokens, isActive, step, isComplete])

  return (
    <>
      {displayed}
      {isActive && !isComplete && (
        <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
      )}
    </>
  )
}
