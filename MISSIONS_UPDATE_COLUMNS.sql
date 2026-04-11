-- Agregar columnas a missions si no existen
ALTER TABLE missions ADD COLUMN IF NOT EXISTS key_verbs TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE missions ADD COLUMN IF NOT EXISTS useful_phrases TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE missions ADD COLUMN IF NOT EXISTS grammar_tips TEXT DEFAULT '';

-- Verificar que las columnas existan y mostrar estructura actual
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'missions' 
  AND column_name IN ('key_verbs', 'useful_phrases', 'grammar_tips', 'scene_context', 'description')
ORDER BY ordinal_position;

-- Mostrar un ejemplo de misión para verificar los datos
SELECT id, title, cefr_level, key_verbs, useful_phrases, grammar_tips, scene_context, description 
FROM missions 
LIMIT 1;
