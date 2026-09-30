#!/usr/bin/env node
/**
 * Comprueba que la clave de Anthropic funciona de verdad.
 *
 *   node scripts/test_ai_connection.js
 *
 * Lee ANTHROPIC_API_KEY y ANTHROPIC_MODEL de backend/.env.local.
 * No imprime la clave en ningún momento.
 */
const { loadEnv } = require('./lib/env')

const MODELO_POR_DEFECTO = 'claude-haiku-4-5-20251001'

async function main() {
  const env = loadEnv({ quiet: true })
  const apiKey = env.ANTHROPIC_API_KEY
  const model = env.ANTHROPIC_MODEL || MODELO_POR_DEFECTO

  console.log('\n🔍 Entorno')
  console.log('===========')
  console.log('ANTHROPIC_API_KEY configurada:', Boolean(apiKey))
  if (apiKey) console.log('  longitud:', apiKey.length)
  console.log('modelo:', model)

  if (!apiKey) {
    console.error('\n❌ Falta ANTHROPIC_API_KEY.')
    console.error('   Añádela a backend/.env.local (https://console.anthropic.com/settings/keys)')
    process.exit(1)
  }

  console.log('\n🚀 Probando la API de Anthropic...\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 64,
        messages: [{ role: 'user', content: "Say 'Connection successful' in exactly 3 words." }],
      }),
    })

    console.log('📬 Status:', response.status, response.statusText)

    if (!response.ok) {
      const detail = await response.text()
      console.error('\n❌ Error del proveedor:')
      console.error(detail.slice(0, 600))
      return false
    }

    const result = await response.json()
    const text = result.content?.find((block) => block.type === 'text')?.text

    console.log('\n✅ Conexión correcta.')
    console.log('Respuesta:', text ?? '(sin bloque de texto)')
    console.log('Tokens:', JSON.stringify(result.usage ?? {}))
    return true
  } catch (error) {
    console.error('\n❌ Fallo de conexión:', error.message)
    return false
  }
}

main().then((ok) => {
  if (ok) {
    console.log('\n✨ Todo listo.')
    process.exit(0)
  }
  console.log('\n⚠️  La conexión falló. Revisa la clave y el modelo.')
  process.exit(1)
})
