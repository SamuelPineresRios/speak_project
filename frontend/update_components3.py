# -*- coding: utf-8 -*-
with open('components/StoryDialogueIntro.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '<span className="text-cyan-300 underline decoration-dotted decoration-cyan-400 hover:text-cyan-100 transition-colors font-semibold">',
    '<span className={"underline decoration-dotted transition-colors font-semibold " + (isPlayerTalking ? "text-red-400 decoration-red-500 hover:text-red-200" : "text-blue-400 decoration-blue-500 hover:text-blue-200")}>'
)

text = text.replace(
    '<p className="text-cyan-200 font-bold text-lg">{definition.word.toUpperCase()}</p>',
    '<p className={"font-bold text-lg " + (isPlayerTalking ? "text-red-200" : "text-blue-200")}>{definition.word.toUpperCase()}</p>'
)

text = text.replace(
    '<div className="absolute left-1/2 -ml-40 bottom-full mb-3 z-[100] w-80 p-6 bg-slate-900 border border-cyan-500/80 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-fade-in backdrop-blur-xl pointer-events-none">',
    '<div className={"absolute left-1/2 -ml-40 bottom-full mb-3 z-[100] w-80 p-6 bg-slate-900 border rounded-xl animate-fade-in backdrop-blur-xl pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.3)] " + (isPlayerTalking ? "border-red-500/80" : "border-blue-500/80")}>'
)

text = text.replace(
    '<span className="text-xs px-3 py-1 bg-cyan-600/60 border border-cyan-400/80 rounded-full text-cyan-50 font-mono tracking-wider whitespace-nowrap">',
    '<span className={"text-xs px-3 py-1 border rounded-full font-mono tracking-wider whitespace-nowrap " + (isPlayerTalking ? "bg-red-900/60 border-red-500/80 text-red-50" : "bg-blue-900/60 border-blue-500/80 text-blue-50")}>'
)

text = text.replace(
    '<div className="border-b border-cyan-500/40" />',
    '<div className={"border-b " + (isPlayerTalking ? "border-red-500/40" : "border-blue-500/40")} />'
)

text = text.replace(
    '<p className="text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">Significado:</p>',
    '<p className={"text-xs font-mono uppercase tracking-wider mb-2 " + (isPlayerTalking ? "text-red-300" : "text-blue-300")}>Significado:</p>'
)

text = text.replace(
    '<p className="text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">Ejemplo:</p>',
    '<p className={"text-xs font-mono uppercase tracking-wider mb-2 " + (isPlayerTalking ? "text-red-300" : "text-blue-300")}>Ejemplo:</p>'
)

with open('components/StoryDialogueIntro.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('done tooltip replacements')
