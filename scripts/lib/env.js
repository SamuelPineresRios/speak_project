#!/usr/bin/env node
/**
 * Shared environment loader for repository scripts.
 *
 * Reads KEY=VALUE pairs from the first .env files found, without overriding
 * variables already present in `process.env` (real environment always wins).
 */
const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const ENV_FILES = ['.env.local', '.env', 'frontend/.env.local', 'frontend/.env']

function loadEnv({ quiet = false } = {}) {
  const loaded = {}

  for (const file of ENV_FILES) {
    const envPath = path.join(REPO_ROOT, file)
    if (!fs.existsSync(envPath)) continue
    if (!quiet) console.log(`📄 Found ${file}`)

    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separator = trimmed.indexOf('=')
      if (separator < 1) continue

      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim()
      // First file wins: `.env.local` takes precedence over `.env`.
      if (key && loaded[key] === undefined) loaded[key] = value
    }
  }

  return new Proxy(loaded, {
    get(target, prop) {
      if (typeof prop !== 'string') return target[prop]
      return process.env[prop] !== undefined ? process.env[prop] : target[prop]
    },
  })
}

module.exports = { loadEnv, REPO_ROOT }
