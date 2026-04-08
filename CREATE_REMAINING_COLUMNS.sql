-- Agregar columnas de contenido restantes
ALTER TABLE guides ADD COLUMN IF NOT EXISTS key_structures jsonb DEFAULT '[]'::jsonb;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS common_expressions jsonb DEFAULT '[]'::jsonb;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS real_life_examples jsonb DEFAULT '[]'::jsonb;
