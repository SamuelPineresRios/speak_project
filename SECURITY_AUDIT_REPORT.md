# 🔐 SECURITY AUDIT REPORT - VOX

**Date:** 2024
**Status:** ⚠️ CRITICAL - Multiple exposed credentials detected
**Scope:** Complete codebase security review

---

## 📊 EXECUTIVE SUMMARY

**Finding:** Your project contains **7 critical security vulnerabilities** with exposed API keys, weak secrets, and insecure configurations.

**Risk Level:** 🔴 **CRITICAL**
- API keys exposed in source code
- Weak default secrets in code
- Environment variables not properly used
- Credentials in version control

**Recommendation:** **DO NOT PUBLISH TO GITHUB** without remediation. Follow mitigation steps immediately.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. EXPOSED OpenRouter API Keys (4 instances)

| Severity | Location | Line | Status |
|----------|----------|------|--------|
| CRITICAL | `frontend/app/api/chat/route.ts` | 3 | Hardcoded |
| CRITICAL | `frontend/app/api/guides/[id]/tutor/route.ts` | 3 | Hardcoded |
| CRITICAL | `frontend/app/api/guides/[id]/chat/route.ts` | 4 | Hardcoded |
| CRITICAL | `frontend/app/api/missions/[id]/submit/route.ts` | 5 | Hardcoded |

**Sample Key Found:**
```
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
```

**Impact:**
- ✗ Full API access with your account credentials
- ✗ Attackers can make unlimited API calls at your expense
- ✗ Potential for $1000s in charges
- ✗ Service disruption possible
- ✗ Data breach through AI model abuses

**Mitigation:** Move to environment variables immediately (see CODE_CHANGES_REQUIRED.md)

---

### 2. EXPOSED Anthropic API Key (1 instance)

| Severity | Location | Line | Status |
|----------|----------|------|--------|
| CRITICAL | `evaluation_service/.env` | 1 | Plaintext .env |

**Key Found:**
```
sk-ant-***REDACTED***
```

**Impact:**
- ✗ Full access to Anthropic API
- ✗ Ability to use Claude models with your credentials
- ✗ Potential $100s-$1000s in charges
- ✗ Access to evaluation service

**Mitigation:** 
1. Revoke this key immediately in Anthropic console
2. Generate new key
3. Store only in .env.local (not in repo)

---

### 3. WEAK JWT Secret (Hardcoded in Code)

| Severity | Location | Line | Value |
|----------|----------|------|-------|
| HIGH | `frontend/lib/auth.ts` | ~59 | Fallback to weak default |
| HIGH | `frontend/.env.example` | 2 | `speak-dev-secret-change-in-production-32chars` |
| HIGH | `README.md` | 77 | Published in docs |

**Problem:**
```typescript
// VULNERABLE - has fallback to weak secret
const JWT_SECRET = process.env.JWT_SECRET || 'speak-dev-secret-change-in-production-32chars';
```

**Impact:**
- ✗ Session tokens can be forged if JWT_SECRET is weak
- ✗ User authentication bypass possible
- ✗ Privilege escalation attacks
- ✗ Session hijacking

**Mitigation:**
1. Remove fallback weak secret
2. Generate 32+ character random string with: `openssl rand -hex 32`
3. Require environment variable to be set

---

### 4. Placeholder API Key in Code

| Severity | Location | Line | Value |
|----------|----------|------|-------|
| MEDIUM | `STORY_MODE_API_ROUTES.ts` | 11 | `'sk-or-v1-...'` |

**Current Code:**
```typescript
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-...'
```

**Problem:**
- ✗ Uses placeholder instead of throwing error
- ✗ Code might silently fail with invalid key
- ✗ Misleading error messages

---

### 5. Weak Frontend ENV Configuration

| File | Issue | Severity |
|------|-------|----------|
| `.env.example` | Contains default JWT secret | HIGH |
| `.env.example` | Shows structure but misleading | MEDIUM |
| `.env.local` | Contains actual test credentials | CRITICAL |

---

## 🟡 MEDIUM SEVERITY ISSUES

### 6. Service URLs without Validation

| File | Line | Issue |
|------|------|-------|
| `evaluation_service/main.py` | 128 | CORS origin configurable but defaults to localhost |
| `frontend/app/api/*` | Multiple | Service URLs don't validate if set |

**Fix:** Add validation and fail fast if URLs not configured.

---

### 7. Admin Emails Exposed

| File | Line | Value |
|------|------|-------|
| `.env.example` | - | `admin@speak.app` |

**Risk:** Low, but email addresses can be used for targeted attacks.

---

## 📋 CONSOLIDATED VULNERABILITY LIST

### By Credential Type:

```
Type                    Count  Severity  Files
═════════════════════════════════════════════════════════════
Anthropic API Keys      1      CRITICAL  evaluation_service/.env
OpenRouter API Keys     4      CRITICAL  frontend/app/api/*/route.ts
JWT Secrets             1      HIGH      frontend/lib/auth.ts
Service URLs            5      MEDIUM    Multiple files
Redis Config            2      MEDIUM    .env files
Admin Emails            1      LOW       .env.example
```

---

## ✅ REMEDIATION STEPS

### Immediate Actions (Do First):

1. **Revoke All Exposed Keys**
   ```bash
   # Anthropic
   # Login to https://console.anthropic.com/ → API Keys → Delete exposed key
   
   # OpenRouter  
   # Login to https://openrouter.ai/ → Settings → API Keys → Delete exposed keys
   ```

2. **Generate New Keys**
   - Create new Anthropic API key
   - Create new OpenRouter API key
   - Store temporarily in note (only for migration)

3. **Update Local Files**
   - Create `.env.local` with new keys
   - Never commit this file
   - Verify in `.gitignore`

4. **Update Code**
   - Replace 4 hardcoded OpenRouter keys with env vars (see CODE_CHANGES_REQUIRED.md)
   - Replace weak JWT fallback with error handling
   - Replace placeholder with error handling

5. **Verify Changes**
   ```bash
   # Ensure no API keys remain in code
   grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.py" frontend/ evaluation_service/ STORY_*
   # Should return: No results
   ```

### Before Publishing to GitHub:

- [ ] All exposed keys revoked
- [ ] New keys generated
- [ ] Code updated (4 API route files + auth.ts)
- [ ] Local `.env.local` configured
- [ ] `.gitignore` properly configured
- [ ] Test application runs without errors
- [ ] No API keys found in grep search
- [ ] Clean git history if committed keys

Detailed steps in: **SECURITY_SETUP.md** and **CODE_CHANGES_REQUIRED.md**

---

## 🛡️ SECURITY CONFIGURATION

### Current State: ❌
```
├── .env (HAS REAL CREDENTIALS) ← PROBLEM!
├── evaluation_service/.env (HAS REAL KEY) ← PROBLEM!
├── frontend/app/api/chat/route.ts (HARDCODED KEY) ← PROBLEM!
├── frontend/lib/auth.ts (WEAK FALLBACK) ← PROBLEM!
└── .gitignore (MISSING .env) ← PROBLEM!
```

### Target State: ✅
```
├── .env.example (TEMPLATE ONLY)
├── .env.local (IGNORED, LOCAL DEV ONLY)
├── evaluation_service/.env.example (TEMPLATE ONLY)
├── evaluation_service/.env (IGNORED, LOCAL ONLY)
├── frontend/app/api/chat/route.ts (USES ENV VARS)
├── frontend/lib/auth.ts (NO WEAK FALLBACK)
└── .gitignore (PROPERLY CONFIGURED)
```

---

## 📁 FILES CREATED FOR SECURITY

1. **`.env.example`** - Template for all environment variables
2. **`.env`** - Secure template (values are placeholders)
3. **`.env.local.example`** - Example of local development setup
4. **`evaluation_service/.env.example`** - Backend environment template
5. **`SECURITY_SETUP.md`** - Complete security setup guide
6. **`CODE_CHANGES_REQUIRED.md`** - Detailed code modification instructions
7. **`SECURITY_AUDIT_REPORT.md`** - This file

---

## 📊 ENVIRONMENT VARIABLES REQUIRED

### Frontend `.frontend/.env.local`:
```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Authentication
JWT_SECRET=secure-random-32-char-string

# Service URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EVALUATION_SERVICE_URL=http://localhost:8000

# Configuration
NODE_ENV=development
```

### Backend `evaluation_service/.env`:
```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-***REDACTED***

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
ALLOWED_ORIGIN=http://localhost:3000

# Service
EVALUATION_SERVICE_URL=http://127.0.0.1:8000
```

---

## 🔍 VERIFICATION COMMANDS

Run these after fixes to confirm security:

```bash
# 1. Check for API keys in code
grep -r "sk-or-v1-[A-Za-z0-9]\{50,\}" --include="*.ts" --include="*.tsx" .
grep -r "sk-ant-" --include="*.py" --include="*.ts" .

# 2. Check for hardcoded secrets
grep -r "Bearer " --include="*.ts" --include="*.py" .
grep -r "password" --include="*.ts" --include="*.py" .

# 3. Verify .gitignore
git check-ignore -v .env evaluation_service/.env frontend/.env.local

# 4. Test env loading
npm run dev  # Should work with .env.local
```

---

## 📚 REFERENCES & TOOLS

### Security Scanning:
- `git-secrets` - Prevent commits with secrets
- `truffleHog` - Scan git history for secrets
- `detect-secrets` - Python secret detection
- GitHub Secret Scanning - Built-in GitHub protection

### Best Practices:
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/knowledge/file-system/security/introduction/)
- [12-Factor App - Config](https://12factor.net/config)

### Generate Secrets:
```bash
# OpenSSL (Linux/Mac)
openssl rand -hex 32

# PowerShell (Windows)
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.BitConverter]::ToString($bytes).Replace("-","")
```

---

## 🎯 GITHUB PUBLICATION CHECKLIST

Before uploading to GitHub:

- [ ] All exposed API keys revoked
- [ ] New API keys generated and stored locally
- [ ] Code changes applied (4 route files + auth.ts)
- [ ] `.env` and `.env.local` added to `.gitignore`
- [ ] `.env.example` committed (template only)
- [ ] Test run with local `.env.local` succeeds
- [ ] No API keys found via grep search
- [ ] Documentation created (SECURITY_SETUP.md)
- [ ] Code changes documented (CODE_CHANGES_REQUIRED.md)
- [ ] Security review completed
- [ ] Ready for GitHub publication ✅

---

## 🆘 WHAT IF YOU ALREADY PUSHED SECRETS?

If API keys are already in git history:

1. **Revoke immediately** - All exposed keys must be revoked
2. **Clean history** using BFG Repo-Cleaner:
   ```bash
   bfg --delete-files .env repo.git
   git push --force-with-lease
   ```
3. **Notify users** - If customer data exposed
4. **Audit logs** - Check if keys were used
5. **Clean repository** - Rewrite history to remove all traces

---

## 📞 SUMMARY

| Item | Current | Target | Status |
|------|---------|--------|--------|
| API Keys in Code | 4 hardcoded | In .env.local only | 🔴 CHANGE NEEDED |
| Weak Secrets | Hardcoded fallback | 32-char random | 🔴 CHANGE NEEDED |
| .gitignore | Missing .env | Configured | 🔴 CHANGE NEEDED |
| Documentation | None | Complete | ✅ DONE |
| Test Status | N/A | Ready for test | 🟡 PENDING |

---

**Document Status:** ⚠️ CRITICAL - Action required
**Prepared:** 2024
**Next Steps:** 
1. Read SECURITY_SETUP.md (5 min)
2. Apply CODE_CHANGES_REQUIRED.md (15 min)
3. Generate secure secrets (2 min)
4. Test locally (5 min)
5. Push to GitHub (2 min)

**Total Time:** ~30 minutes to complete full remediation
