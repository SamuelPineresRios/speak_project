# 📋 ENVIRONMENT VARIABLES - Complete Reference

## Overview

All environment variables used in the SPEAK MVP project, organized by category, with descriptions, security level, and usage.

---

## 🔐 API KEYS & CREDENTIALS (SENSITIVE)

### ANTHROPIC_API_KEY
- **Type:** API Key
- **Security Level:** CRITICAL
- **Required:** Yes
- **Where to Get:** https://console.anthropic.com/
- **Used In:**
  - `evaluation_service/main.py`
  - `evaluation_service/main_simple.py`
  - `evaluation_service/service.py`
- **Default:** None (must be provided)
- **Example:** `sk-ant-***REDACTED***`

```env
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
```

---

### OPENROUTER_API_KEY
- **Type:** API Key
- **Security Level:** CRITICAL
- **Required:** Yes (if using OpenRouter)
- **Where to Get:** https://openrouter.ai/
- **Used In:**
  - `frontend/app/api/chat/route.ts`
  - `frontend/app/api/guides/[id]/tutor/route.ts`
  - `frontend/app/api/guides/[id]/chat/route.ts`
  - `frontend/app/api/missions/[id]/submit/route.ts`
  - `STORY_MODE_API_ROUTES.ts`
- **Default:** None (must be provided after code fix)
- **Example:** `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key
```

---

### JWT_SECRET
- **Type:** Authentication Secret
- **Security Level:** CRITICAL
- **Required:** Yes
- **Where to Get:** Generate with `openssl rand -hex 32`
- **Used In:**
  - `frontend/lib/auth.ts`
  - All session token generation/verification
- **Default:** ~~`speak-dev-secret-change-in-production-32chars`~~ (REMOVED - must be provided)
- **Minimum Length:** 32 characters
- **Generation:**
  ```bash
  # Linux/Mac
  openssl rand -hex 32
  
  # Windows PowerShell
  [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  ```

```env
JWT_SECRET=a3f8e9c2d5b1f6a9e3c7d2a1b4f9e8d1c5b2a9z7y4x3w0v
```

---

## 🗄️ DATABASE & CACHE (INFRASTRUCTURE)

### REDIS_HOST
- **Type:** Hostname/IP
- **Security Level:** LOW
- **Required:** Yes
- **Used In:**
  - `evaluation_service/main.py`
  - Cache operations
- **Default:** `localhost`
- **Examples:**
  - Local: `localhost` or `127.0.0.1`
  - Docker: `redis` (service name)
  - Remote: `redis.example.com` or `redis-instance-12345.c1.us-east-1.rds.amazonaws.com`

```env
REDIS_HOST=localhost
```

---

### REDIS_PORT
- **Type:** Port Number
- **Security Level:** LOW
- **Required:** Yes
- **Used In:**
  - `evaluation_service/main.py`
  - Cache connections
- **Default:** `6379`
- **Standard Values:** `6379` (default Redis port)
- **Range:** 1-65535

```env
REDIS_PORT=6379
```

---

### REDIS_PASSWORD
- **Type:** Password (if Redis requires auth)
- **Security Level:** HIGH
- **Required:** No (leave empty for local dev)
- **Used In:**
  - `evaluation_service/main.py`
  - Redis authentication
- **Default:** Empty (no auth)
- **Production:** Must be strong password

```env
REDIS_PASSWORD=
# or for production:
REDIS_PASSWORD=your-redis-password-here
```

---

### REDIS_DB
- **Type:** Database Number
- **Security Level:** LOW
- **Required:** No
- **Used In:**
  - Cache operations
- **Default:** `0`
- **Valid Range:** 0-15 (typical Redis configs)

```env
REDIS_DB=0
```

---

## 🌐 API & SERVICE CONFIGURATION

### NEXT_PUBLIC_API_BASE_URL
- **Type:** URL
- **Security Level:** LOW
- **Visibility:** PUBLIC (sent to frontend)
- **Required:** Yes
- **Used In:**
  - Frontend API calls
  - Client-side routing
- **Format:** `http://` or `https://` URL
- **Examples:**
  - Development: `http://localhost:3000`
  - Staging: `https://staging.speak.app`
  - Production: `https://speak.app`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

### EVALUATION_SERVICE_URL
- **Type:** URL
- **Security Level:** LOW
- **Required:** Yes
- **Used In:**
  - `frontend/app/api/**/*` (routes that call backend)
  - `evaluation_service/main.py` (for identification)
- **Format:** `http://` or `https://` URL
- **Examples:**
  - Development: `http://localhost:8000`
  - Docker: `http://evaluation-service:8000`
  - Production: `https://eval.speak.app` or `http://127.0.0.1:8000`

```env
EVALUATION_SERVICE_URL=http://localhost:8000
```

---

### ALLOWED_ORIGIN
- **Type:** URL (CORS setting)
- **Security Level:** LOW
- **Required:** Yes
- **Used In:**
  - `evaluation_service/main.py` (CORS configuration)
  - Cross-origin request validation
- **Format:** `http://` or `https://` URL
- **Examples:**
  - Development: `http://localhost:3000`
  - Production: `https://speak.app`
- **Note:** Controls which domains can access the backend API

```env
ALLOWED_ORIGIN=http://localhost:3000
```

---

### N8N_WEBHOOK_URL
- **Type:** Webhook URL
- **Security Level:** MEDIUM
- **Required:** No (if not using N8N integrations)
- **Used In:**
  - `frontend/app/api/events/activity-completed/route.ts`
  - External integration events
- **Format:** Full webhook URL from N8N
- **Example:** `https://n8n.example.com/webhook/activity-completed`

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/activity-completed
```

---

## ⚙️ APPLICATION CONFIGURATION

### NODE_ENV
- **Type:** Environment Name
- **Security Level:** LOW
- **Used In:**
  - Frontend (Next.js)
  - Determines behavior (logging, error handling, etc.)
- **Valid Values:** `development`, `staging`, `production`
- **Default:** `development`
- **Impact:**
  - `development`: Verbose logging, hot reload, source maps
  - `production`: Optimized, minimal logging, errors hidden
  - `staging`: Production-like with more logging

```env
NODE_ENV=development
```

---

### LOG_LEVEL
- **Type:** Log Level
- **Security Level:** LOW
- **Required:** No
- **Used In:**
  - Application logging configuration
  - Error and debug output control
- **Valid Values:** `debug`, `info`, `warn`, `error`, `fatal`
- **Default:** `info`
- **Recommendation:**
  - Development: `debug`
  - Production: `warn` or `error`

```env
LOG_LEVEL=info
```

---

## 👤 USER & ADMIN CONFIGURATION

### ADMIN_EMAILS
- **Type:** Email Address(es)
- **Security Level:** LOW
- **Required:** No
- **Used In:**
  - Admin user identification
  - Permission checking
  - Notifications
- **Format:** Single email or comma-separated emails
- **Examples:**
  - Single: `admin@speak.app`
  - Multiple: `admin@speak.app,support@speak.app,ops@company.com`

```env
ADMIN_EMAILS=admin@speak.app,support@speak.app
```

---

## 🗺️ ENVIRONMENT-SPECIFIC CONFIGURATIONS

### Development (.env.local)
```env
# Copy from .env.local.example

# API Keys - Use test keys or local stubs
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Authentication
JWT_SECRET=dev-secret-32-chars-minimum-required

# Services
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EVALUATION_SERVICE_URL=http://localhost:8000
ALLOWED_ORIGIN=http://localhost:3000

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging
LOG_LEVEL=debug
NODE_ENV=development

# Admin
ADMIN_EMAILS=yourdevmail@example.com
```

### Staging (.env.staging)
```env
# API Keys - Use staging keys from providers
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
OPENROUTER_API_KEY=sk-or-v1-staging-key

# Authentication
JWT_SECRET=staging-secret-32-chars-minimum-required

# Services
NEXT_PUBLIC_API_BASE_URL=https://staging.speak.app
EVALUATION_SERVICE_URL=https://api-staging.speak.app
ALLOWED_ORIGIN=https://staging.speak.app

# Cache
REDIS_HOST=redis-staging.example.com
REDIS_PORT=6379
REDIS_PASSWORD=strong-password-here

# Logging
LOG_LEVEL=info
NODE_ENV=staging

# Admin & External
ADMIN_EMAILS=admin@speak.app
N8N_WEBHOOK_URL=https://staging-n8n.example.com/webhook
```

### Production (.env.production)
```env
# API Keys - Use production keys, managed securely
ANTHROPIC_API_KEY=<FROM_SECRETS_MANAGER>
OPENROUTER_API_KEY=<FROM_SECRETS_MANAGER>

# Authentication
JWT_SECRET=<FROM_SECRETS_MANAGER>

# Services
NEXT_PUBLIC_API_BASE_URL=https://speak.app
EVALUATION_SERVICE_URL=https://api.speak.app
ALLOWED_ORIGIN=https://speak.app

# Cache
REDIS_HOST=redis.prod.internal
REDIS_PORT=6379
REDIS_PASSWORD=<FROM_SECRETS_MANAGER>
REDIS_DB=0

# Logging
LOG_LEVEL=error
NODE_ENV=production

# Admin & External
ADMIN_EMAILS=admin@speak.app,ops@speak.app
N8N_WEBHOOK_URL=https://n8n.prod.example.com/webhook
```

---

## 🔄 MIGRATION GUIDE

### Updating Environment Variables

**When changing an environment variable:**

1. **For Development:**
   - Update `.env.local`
   - Restart development server

2. **For Staging/Production:**
   - Update secrets manager (AWS Secrets Manager, Vercel, Railway, etc.)
   - Restart application
   - Monitor for errors

---

## 📊 VARIABLE CHECKLIST

Copy this checklist and mark ✅ when each variable is set:

```
🔐 CRITICAL (Must have)
[ ] ANTHROPIC_API_KEY
[ ] OPENROUTER_API_KEY
[ ] JWT_SECRET

🗄️ DATABASE (Must have)
[ ] REDIS_HOST
[ ] REDIS_PORT
[ ] REDIS_DB

🌐 SERVICES (Must have)
[ ] NEXT_PUBLIC_API_BASE_URL
[ ] EVALUATION_SERVICE_URL
[ ] ALLOWED_ORIGIN

⚙️ CONFIGURATION (Optional)
[ ] NODE_ENV
[ ] LOG_LEVEL
[ ] ADMIN_EMAILS
[ ] N8N_WEBHOOK_URL
[ ] REDIS_PASSWORD
```

---

## 🛡️ SECURITY BEST PRACTICES

1. **Never hardcode credentials** - Always use environment variables
2. **Rotate secrets regularly** - At least every 90 days
3. **Use strong secrets** - Minimum 32 characters for JWT_SECRET
4. **Restrict access** - Only share secrets with those who need them
5. **Monitor usage** - Watch for unusual API activity
6. **Version control** - Never commit `.env` files
7. **Secure transmission** - Use HTTPS/TLS for all APIs
8. **Audit logs** - Enable and monitor access logs
9. **Principle of least privilege** - Grant minimum required permissions
10. **Backup & recovery** - Document secret rotation procedures

---

## 🔗 REFERENCES

- [12-Factor App - Config](https://12factor.net/config)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Node.js - process.env](https://nodejs.org/en/knowledge/file-system/security/introduction/)
- [python-dotenv](https://python-dotenv.readthedocs.io/)

---

**Last Updated:** 2024
**Status:** Complete Reference
