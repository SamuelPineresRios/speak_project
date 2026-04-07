import re

filepath = 'components/StoryDialogueIntro.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

old_func = """function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <>{displayedText}</>
}"""

new_func = """function TypewriterText({ text, speed = 15, forceComplete, onComplete }: { text: string; speed?: number; forceComplete: boolean; onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (forceComplete) {
      setDisplayedText(text)
      onComplete()
      return
    }

    let i = 0
    interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
        onComplete()
      }
    }, speed)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, forceComplete])

  return <>{displayedText}</>
}"""

content = content.replace(old_func, new_func)

open(filepath, 'w', encoding='utf-8').write(content)
print("Updated TypewriterText")
