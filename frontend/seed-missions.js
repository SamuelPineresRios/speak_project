#!/usr/bin/env node

/**
 * Script para agregar 20 misiones por cada nivel CEFR (A1, A2, B1, B2, C1)
 * Total: 100 misiones
 * 
 * Uso: node seed-missions.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Descripciones por nivel
const missionTemplates = {
  A1: [
    { title: 'Saludos Básicos', description: 'Aprende a saludar en inglés con frases simples' },
    { title: 'Números del 1 al 10', description: 'Identifica y pronuncia los números básicos' },
    { title: 'Colores Primarios', description: 'Escribe y reconoce los nombres de colores' },
    { title: 'Familia Inmediata', description: 'Aprende los nombres de miembros de la familia' },
    { title: 'Partes del Cuerpo', description: 'Identifica las partes principales del cuerpo' },
    { title: 'Comidas Básicas', description: 'Escribe nombres de alimentos simples' },
    { title: 'Animales Comunes', description: 'Aprende el nombre de animales domésticos' },
    { title: 'Prendas de Vestir', description: 'Identifica y escribe nombres de ropa' },
    { title: 'Casa y Habitaciones', description: 'Aprende vocabulario de espacios del hogar' },
    { title: 'Días de la Semana', description: 'Escribe y pronuncia los días de la semana' },
    { title: 'Meses del Año', description: 'Identifica los nombres de los meses' },
    { title: 'Verb: To Be (Simple)', description: 'Practica I am, You are, He is' },
    { title: 'Artículos A/An', description: 'Usa correctamente los artículos indefinidos' },
    { title: 'Pronombres Personales', description: 'Domina I, you, he, she, it, we, they' },
    { title: 'Preguntas Simples', description: 'Formula preguntas con What? Who? Where?' },
    { title: 'Negaciones Básicas', description: 'Forma oraciones negativas simples' },
    { title: 'Números hasta 100', description: 'Cuenta y escribe números más grandes' },
    { title: 'Mi Presentación', description: 'Escribe sobre ti en pocas palabras' },
    { title: 'Ocupaciones Simples', description: 'Aprende nombres de trabajos básicos' },
    { title: 'Acciones Cotidianas', description: 'Describe actividades diarias simples' },
  ],
  A2: [
    { title: 'Present Continuous', description: 'Describe acciones que están ocurriendo ahora' },
    { title: 'Past Simple: Was/Were', description: 'Habla sobre situaciones pasadas' },
    { title: 'Objetos de la Casa', description: 'Amplía vocabulario de muebles y objetos' },
    { title: 'Transporte Básico', description: 'Aprende nombres de medios de transporte' },
    { title: 'Ciudades y Países', description: 'Escribe sobre lugares geográficos' },
    { title: 'Estaciones del Año', description: 'Habla del clima y las estaciones' },
    { title: 'Rutina Diaria', description: 'Describe tu rutina con verbos de acción' },
    { title: 'Comidas del Día', description: 'Escribe sobre desayuno, almuerzo y cena' },
    { title: 'Deportes Populares', description: 'Aprende nombres de deportes comunes' },
    { title: 'Hobies y Pasatiempos', description: 'Describe tus actividades favoritas' },
    { title: 'Adjetivos Descriptivos', description: 'Usa adjetivos para describir cosas' },
    { title: 'Comparaciones Simples', description: 'Compara dos objetos o personas' },
    { title: 'Imperativo: Órdenes', description: 'Da instrucciones simples en inglés' },
    { title: 'There is / There are', description: 'Describe qué existe en un lugar' },
    { title: 'Preposiciones de Lugar', description: 'Ubica objetos en el espacio (in, on, under)' },
    { title: 'Can/Could para Habilidades', description: 'Expresa qué puedes o no hacer' },
    { title: 'Would Like / Want', description: 'Expresa deseos y preferencias' },
    { title: 'Direcciones y Mapas', description: 'Pide y da direcciones simples' },
    { title: 'Tiendas y Compras', description: 'Practica vocabulario de comercios' },
    { title: 'Descripciones de Personas', description: 'Describe físicamente a otras personas' },
  ],
  B1: [
    { title: 'Past Simple: Verbos Regulares', description: 'Conjugación de verbos en pasado' },
    { title: 'Past Simple: Irregulares', description: 'Memoriza verbos irregulares comunes' },
    { title: 'Present Perfect Básico', description: 'Habla de experiencias hasta ahora' },
    { title: 'Future: Going to & Will', description: 'Expresa planes y predicciones' },
    { title: 'Conditionales: If...then', description: 'Propone situaciones hipotéticas' },
    { title: 'Pronombres de Objeto', description: 'Usa me, you, him, her, us, them correctamente' },
    { title: 'Adjetivos Comparativos', description: 'Compara usando -er y more' },
    { title: 'Adjetivos Superlativos', description: 'Usa -est y most para extremos' },
    { title: 'Verbos Modales: Must/Might', description: 'Expresa obligación y posibilidad' },
    { title: 'Verbos de Percepción', description: 'See, hear, feel en contexto' },
    { title: 'Phrasal Verbs Comunes', description: 'Domina verbos con partículas' },
    { title: 'Conectores: Because/So', description: 'Vincula ideas con relaciones lógicas' },
    { title: 'Preguntas de Información', description: 'Formulas preguntas abiertas complejas' },
    { title: 'Opiniones y Acuerdos', description: 'Expressa tu punto de vista' },
    { title: 'Narración de Historias', description: 'Cuenta una anécdota en pasado' },
    { title: 'Cartas Informales', description: 'Escribe cartas a amigos' },
    { title: 'Descripciones de Películas', description: 'Analiza y comenta películas' },
    { title: 'Vocabulario de Tecnología', description: 'Aprende términos tecnológicos' },
    { title: 'Temas de Salud', description: 'Discute sobre bienestar y medicina' },
    { title: 'Viajes y Turismo', description: 'Planifica y describe un viaje' },
  ],
  B2: [
    { title: 'Present Perfect Continuous', description: 'Duración de acciones hasta ahora' },
    { title: 'Past Continuous', description: 'Acciones en curso en el pasado' },
    { title: 'Past Perfect Simple', description: 'Ordena eventos en el pasado' },
    { title: 'Reported Speech', description: 'Reporta lo que otras personas dijeron' },
    { title: 'Conditionals: Tipo 2', description: 'Situaciones hipotéticas presentes' },
    { title: 'Conditionals: Tipo 3', description: 'Situaciones hipotéticas pasadas' },
    { title: 'Voz Pasiva: Tiempos Presentes', description: 'Transforma activo a pasivo' },
    { title: 'Voz Pasiva: Tiempos Pasados', description: 'Pasivas en tiempos pasados' },
    { title: 'Gerundio e Infinitivo', description: 'Elige entre -ing y to+verb' },
    { title: 'Relativas: Who/Which/That', description: 'Construye oraciones relativas' },
    { title: 'Emphasis y Word Order', description: 'Enfatiza partes de la oración' },
    { title: 'Argumentos y Debates', description: 'Defiende tu posición en un debate' },
    { title: 'Escritura Formal', description: 'Escribe correos y documentos formales' },
    { title: 'Análisis Crítico de Textos', description: 'Interpreta y critica artículos' },
    { title: 'Presentaciones Académicas', description: 'Estructura una presentación compleja' },
    { title: 'Vocabulario de Negocios', description: 'Términos empresariales y comerciales' },
    { title: 'Expresiones Idiomáticas', description: 'Comprende expresiones coloquiales' },
    { title: 'Conversación Fluida', description: 'Mantén diálogos sin interrupciones' },
    { title: 'Nuances Lingüísticas', description: 'Distingue entre palabras similares' },
    { title: 'Ensayos Estructurados', description: 'Escribe ensayos coherentes y bien organizados' },
  ],
  C1: [
    { title: 'Advanced Tenses Integration', description: 'Combina tiempos en contextos complejos' },
    { title: 'Register y Tone', description: 'Adapta el lenguaje al contexto' },
    { title: 'Syntactic Complexity', description: 'Maneja estructuras gramaticales avanzadas' },
    { title: 'Lexical Cohesion', description: 'Vincula ideas mediante vocabulario preciso' },
    { title: 'Discourse Markers', description: 'Conectores avanzados para fluidez' },
    { title: 'Ambiguity y Precision', description: 'Evita ambigüedades en textos' },
    { title: 'Academic Writing Standards', description: 'Escribe según normas académicas' },
    { title: 'Critical Analysis', description: 'Analiza críticamente argumentos' },
    { title: 'Persuasive Techniques', description: 'Técnicas de argumentación persuasiva' },
    { title: 'Translation: Nuances', description: 'Traduce preservando matices' },
    { title: 'Semantic Precision', description: 'Elige palabras con precisión semántica' },
    { title: 'Cultural References', description: 'Entiende referencias culturales anglesas' },
    { title: 'Specialized Vocabulary', description: 'Vocabulario de campos específicos' },
    { title: 'Stylistic Analysis', description: 'Analiza estilos literarios y periodísticos' },
    { title: 'Argumentation Strategies', description: 'Estrategias avanzadas de argumentación' },
    { title: 'Formal Correspondence', description: 'Correspondencia diplomática y formal' },
    { title: 'Interpretation Skills', description: 'Interpreta matices en conversaciones' },
    { title: 'Media Literacy', description: 'Analiza críticamente medios en inglés' },
    { title: 'Linguistic Variation', description: 'Comprende variaciones del inglés global' },
    { title: 'Thesis & Research Papers', description: 'Escribe papers académicos complejos' },
  ],
};

async function seedMissions() {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  let totalInserted = 0;
  let errors = 0;

  console.log('🚀 Comenzando inserción de misiones...\n');

  for (const level of levels) {
    const templates = missionTemplates[level];
    const missionsToInsert = [];

    console.log(`📝 Preparando ${templates.length} misiones para nivel ${level}...`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const mission = {
        title: template.title,
        description: template.description,
        cefr_level: level,
        base_duration_seconds: 180 + Math.random() * 600, // 3-13 minutos
        status: 'active',
        created_at: new Date().toISOString(),
      };
      missionsToInsert.push(mission);
    }

    try {
      const { data, error } = await supabase
        .from('missions')
        .insert(missionsToInsert)
        .select();

      if (error) {
        console.error(`❌ Error insertando misiones ${level}:`, error.message);
        errors += missionsToInsert.length;
      } else {
        console.log(`✅ ${data?.length || missionsToInsert.length} misiones añadidas para ${level}`);
        totalInserted += data?.length || 0;
      }
    } catch (err) {
      console.error(`❌ Error inesperado con ${level}:`, err.message);
      errors += missionsToInsert.length;
    }

    console.log('');
  }

  console.log('\n📊 Resumen:');
  console.log(`✅ Misiones insertadas: ${totalInserted}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📈 Total esperado: 100`);

  if (totalInserted === 100) {
    console.log('\n🎉 ¡Todas las misiones se insertaron correctamente!');
  }

  process.exit(errors > 0 ? 1 : 0);
}

seedMissions();
