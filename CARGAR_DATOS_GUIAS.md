# 📋 Pasos para Cargar Guías a Supabase

## Problema Actual
Las guías muestran "Contenido no disponible" porque los datos aún no están en Supabase.

## Solución

### 1. Verificar Credenciales Supabase
Necesitas tener tus credenciales de Supabase. Ve a tu proyecto Supabase dashboard:
- Settings → API
- Copia: **Project URL** y **Service Role Key**

### 2. Crear archivo `.env.local`
En la raíz del proyecto, crea un archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET=your-jwt-secret
OPENROUTER_API_KEY=your-openrouter-key
NODE_ENV=production
```

### 3. Ejecutar Script de Carga
Una vez que hayas creado `.env.local` con las credenciales correctas:

```bash
node load_guides_to_supabase.js
```

Deberías ver algo como:
```
📄 Found .env.local
📚 Loading 8 guides to Supabase...
✅ Guide "Conditional Sentences" loaded
✅ Guide "Passive Voice" loaded
...
✨ Complete! Loaded: 8, Errors: 0
```

### 4. Verificar que los Datos Llegaron
Después de ejecutar el script, visita en tu navegador:
- http://localhost:3000/api/debug/guides-list

Verás información sobre las guías cargadas.

## Verificar Detalles de una Guía
Para ver los datos completos de una guía específica:
- http://localhost:3000/api/debug/guides

## Si Sigue Sin Funcionar

### Opción A: Cargar via SQL Directo en Supabase
1. Ve al Supabase dashboard
2. SQL Editor
3. Ejecuta:

```sql
-- Limpiar guías existentes
DELETE FROM guides;

-- Insertar nuevas guías con contenido
INSERT INTO guides (id, title, description, cover_emoji, cefr_level, concept_tags, estimated_minutes, content, is_published)
VALUES
(
  'guide-004',
  'Conditional Sentences',
  'Learn to form and use conditional sentences for hypothetical situations',
  '❓',
  'B1',
  '["conditionals", "grammar", "verb-tenses"]',
  20,
  '{
    "introduction": "Los condicionales se usan para hablar de situaciones hipotéticas...",
    "key_structures": [...],
    "common_expressions": [...],
    "exercises": [...]
  }',
  true
);
```

### Opción B: Verificar Tabla "guides" Existe
En Supabase SQL Editor, ejecuta:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'guides';
```

Si no existe, crea la tabla:

```sql
CREATE TABLE guides (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_emoji VARCHAR(10),
  cefr_level VARCHAR(10),
  concept_tags JSONB,
  estimated_minutes INTEGER,
  content JSONB,
  mission_connection VARCHAR(50),
  story_connection VARCHAR(50),
  scene_concepts JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## URL útiles de Debug
- Listar todas las guías: `/api/debug/guides-list`
- Ver primera guía en detalle: `/api/debug/guides`
- Ver guía específica: `/api/guides/[guide-id]`
