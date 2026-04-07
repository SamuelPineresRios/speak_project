import re

filepath = 'frontend/components/StoryDialogueIntro.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

content = content.replace(
    'Haz clic en palabras <span className="text-cyan-400 font-semibold">subrayadas</span> para ver definiciones y ejemplos', 
    'Haz clic en el panel para avanzar, y en palabras <span className="text-cyan-400 font-semibold underline decoration-dotted">subrayadas</span> para definiciones'
)

# Also let's tighten the spacing a bit and ensure smooth scroll works.
open(filepath, 'w', encoding='utf-8').write(content)
print("Updated text.")
