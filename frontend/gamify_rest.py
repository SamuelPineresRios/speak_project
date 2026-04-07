import os
import re

def update_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f"Failed {filepath}: {e}")

# ASSIGN MISSION
update_file(
    r'C:\Users\samue\Downloads\speak\speak-mvp-json\frontend\app\(teacher)\group\[id]\assign-mission\page.tsx',
    [
        (r'min-h-screen max-w-lg mx-auto px-4 py-6', 'min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] font-sans p-6 max-w-2xl mx-auto'),
        (r'← Volver', '← ABORTAR_OPERACIÓN'),
        (r'Asignar misiones', 'DESPLIEGUE TÁCTICO DE MISIONES'),
        (r'Selecciona una o más misiones para este grupo', 'Seleccione los módulos de entrenamiento para el escuadrón activo. Se requiere autorización de mando.'),
        (r'glass rounded-xl p-4 mb-4', 'bg-slate-900/80 border border-cyan-500/30 rounded-xl p-5 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-sm'),
        (r'bg-amber border-amber text-midnight-50', 'bg-cyan-500 border-cyan-400 text-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.5)]'),
        (r'glass rounded-xl p-3\.5 text-left transition-all', 'bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-left transition-all hover:bg-slate-800 hover:border-cyan-500/50 group'),
        (r'bg-amber text-midnight-50', 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-neon-cyan border border-cyan-400'),
        (r'text-sm font-medium', 'text-sm font-tech font-bold text-slate-200 group-hover:text-cyan-400 transition-colors')
    ]
)

print('Updated assign mission')
