# ✅ INSTRUCCIONES PARA CARGAR LOS DATOS A SUPABASE

## 🎯 Problema Actual
La sección "DATABASE" muestra "Contenido no disponible" porque los datos no están en Supabase.

## ✅ Solución Rápida (5 minutos)

### Paso 1: Abrir Supabase SQL Editor
1. Ve a tu proyecto en Supabase dashboard
2. Haz clic en **SQL Editor** (lado izquierdo)
3. Haz clic en el botón **New Query**

### Paso 2: Copiar y Ejecutar SQL
1. Abre el archivo: `LOAD_GUIDES.sql`
2. **Selecciona TODO el contenido** (Ctrl+A)
3. **Cópialo** (Ctrl+C)
4. Ve a Supabase SQL Editor
5. **Pégalo** (Ctrl+V) en el editor
6. Haz clic en el botón **Run** (arriba a la derecha)

El script debería mostrar un resultado así:
```
Query successful: 8 rows affected
```

### Paso 3: Verificar que Funcionó
Vuelve a la app en tu navegador y recarga la página de guías.

---

## ❓ ¿Qué hace el SQL?

El archivo `LOAD_GUIDES.sql` carga **8 guías completas** con:
- ✅ **Definiciones** - Explicación del concepto
- ✅ **Fórmulas** - Estructuras gramaticales
- ✅ **Key Structures** - Ejemplos detallados
- ✅ **Common Expressions** - Frases comunes
- ✅ **Ejercicios** - Preguntas para practicar

Cada guía tiene toda la información que se mostrará en la sección "DATABASE".

---

## 🚨 Si Something Went Wrong

### Error: "Permission denied"
- Verifica que estés usando tu Supabase project
- Comprueba que has iniciado sesión

### Error: "Relation 'guides' does not exist"
- La tabla `guides` aún no existe
- Ve a **SQL Editor → New Query** y ejecuta:

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

Luego ejecuta el `LOAD_GUIDES.sql`

### Error: "Parse error"
- Asegúrate de copiar el archivo completo sin cambios
- Si algo falló, prueba copiar solo la primera guía SQL

---

## 📊 Verificar que los Datos Están en Supabase

En Supabase SQL Editor, ejecuta esto para ver si están los datos:

```sql
SELECT id, title, cefr_level, 
  content->>'definition' as definition,
  content->>'formula' as formula
FROM guides
LIMIT 1;
```

Deberías ver una fila con datos completos.

---

## 🔍 Debug en la App

Si los datos están en Supabase pero no aparecen:

1. Abre la consola del navegador (F12)
2. Ve a la URL: `http://localhost:3000/api/debug/guides-list`
3. Verifica que dice `"count": 8`
4. Si no, revisa los errores en la consola

---

## 📝 Resumen

| Paso | Acción |
|------|--------|
| 1 | Abre `LOAD_GUIDES.sql` |
| 2 | Copia TODO el contenido |
| 3 | Pega en Supabase SQL Editor |
| 4 | Haz clic en RUN |
| 5 | Recarga tu navegador |
| ✅ | ¡Listo! Verás la información |

---

**Nota:** Si algo falla, contacta al soporte técnico o revisa la consola del navegador (F12) para mensajes de error específicos.
