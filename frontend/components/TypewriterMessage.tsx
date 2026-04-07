'use client'

import { useState, useEffect } from 'react'

interface TypewriterMessageProps {
  text: string
  isActive: boolean // Whether this is the current message being typed
  speed?: number // milliseconds per character (default 30)
}

export function TypewriterMessage({ text, isActive, speed = 30 }: TypewriterMessageProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // If not active or already complete, show full text
    if (!isActive || isComplete) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    let i = 0
    let timeout: NodeJS.Timeout

    const typeNextCharacter = () => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i))
        i++
        timeout = setTimeout(typeNextCharacter, speed + Math.random() * 10)
      } else {
        setIsComplete(true)
      }
    }

    typeNextCharacter()

    return () => clearTimeout(timeout)
  }, [text, isActive, speed, isComplete])

  return (
    <>
      {displayedText}
      {isActive && !isComplete && <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />}
    </>
  )
}
