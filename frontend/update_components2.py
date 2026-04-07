with open('components/StoryDialogueIntro.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'className="animate-bounce flex items-center gap-2 text-cyan-400 bg-cyan-950/50 px-4 py-1.5 rounded-full border border-cyan-900/80"',
    'className={"animate-bounce flex items-center gap-2 px-4 py-1.5 rounded-full border " + (isPlayerTalking ? "text-red-400 bg-red-950/50 border-red-900/80" : "text-blue-400 bg-blue-950/50 border-blue-900/80")}'
)

with open('components/StoryDialogueIntro.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('done string replacement 2')
