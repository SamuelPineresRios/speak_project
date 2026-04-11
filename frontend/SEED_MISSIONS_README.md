# Script para agregar misiones a la base de datos
# 100 misiones en total (20 por cada nivel CEFR)

## Requisitos:
- Node.js instalado
- Archivo `.env.local` en tu carpeta `frontend/` con credenciales de Supabase:
  ```
  NEXT_PUBLIC_SUPABASE_URL=tu_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
  ```

## ¿Qué hace este script?

1. Se conecta a tu base de datos Supabase
2. Crea 100 misiones nuevas:
   - 20 misiones nivel A1 (Elemental)
   - 20 misiones nivel A2 (Elementary)
   - 20 misiones nivel B1 (Intermediate)
   - 20 misiones nivel B2 (Upper Intermediate)
   - 20 misiones nivel C1 (Advanced)

3. Cada misión tiene:
   - Título único
   - Descripción
   - Nivel CEFR asignado
   - Duración variable (3-13 minutos)
   - Estado: "active"

## Instrucciones de uso:

### Opción 1: Windows (PowerShell)
```powershell
cd frontend
node seed-missions.js
```

### Opción 2: Linux/Mac (Bash)
```bash
cd frontend
node seed-missions.js
```

## ¿Qué pasa si encuentro errores?

- **"NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing"**
  → Verifica que están en tu archivo `.env.local` en la carpeta `frontend/`

- **"Database connection failed"**
  → Confirma que las credenciales son correctas en Supabase

- **"Permission denied"**
  → El usuario de Supabase necesita permisos para insertar en la tabla `missions`

## Verificación

Después de ejecutar, verifica en Supabase:
1. Ve a tu proyecto Supabase
2. Abre la tabla "missions"
3. Deberías ver 100 nuevas misiones (20 por nivel)

## Curiosidad

El script genera nombres temáticos para cada nivel:
- **A1**: Vocabulario básico (saludos, números, colores)
- **A2**: Rutina y presente (acciones, tiempo pasado simple)
- **B1**: Complejidad media (narrativas, conectores)
- **B2**: Pensamiento crítico (análisis, argumentación)
- **C1**: Dominio avanzado (sutilezas, especializaciones)

¡Listo para comenzar! 🚀
