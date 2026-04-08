-- Agregar columnas faltantes a la tabla 'guides'
-- Copia y pega esto en el SQL Editor de Supabase

ALTER TABLE guides 
ADD COLUMN IF NOT EXISTS key_structures jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS common_expressions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS real_life_examples jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exercises jsonb DEFAULT '[]'::jsonb;

-- Verifica que se agregaron correctamente
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'guides' 
ORDER BY column_name;
