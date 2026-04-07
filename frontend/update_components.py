with open('components/StoryDialogueIntro.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    'className="relative bg-slate-900/80 backdrop-blur-xl border-t rounded-xl  p-8 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"',
    'className={"relative bg-slate-900/80 backdrop-blur-xl border-t rounded-xl p-8 pt-10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] " + (isPlayerTalking ? "border-red-500/50" : "border-blue-500/50")}'
)

text = text.replace(
    'className="inline-block w-3 h-7 bg-cyan-400 ml-1 animate-pulse align-middle"',
    'className={"inline-block w-3 h-7 ml-1 animate-pulse align-middle " + (isPlayerTalking ? "bg-red-400" : "bg-blue-400")}'
)

with open('components/StoryDialogueIntro.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('done string replacement')
