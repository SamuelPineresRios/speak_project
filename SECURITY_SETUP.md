# 🔐 SECURITY SETUP GUIDE - SPEAK MVP

## Critical: Secrets Management & GitHub Publication Safety

This document explains how to properly handle secrets and prepare the repository for public GitHub publication.

---

## ⚠️ CRITICAL SECURITY ISSUES FOUND

### **EXPOSED CREDENTIALS - ACTION REQUIRED IMMEDIATELY**

1. **API Keys Currently Exposed in Codebase:**
   - ✗ 4× OpenRouter API keys hardcoded in `/frontend/app/api/*/route.ts`
   - ✗ 1× Anthropic API key in `/evaluation_service/.env`
   - ✗ Weak JWT secret hardcoded in `/frontend/lib/auth.ts`

2. **Impact:**
   - Attackers can use exposed keys to access your API accounts
   - Potential for massive billing charges (API abuse)
   - Unauthorized access to your service

3. **Status:** Since this is in a backup folder being prepared for GitHub, you MUST fix these before uploading.

---

## ✅ SETUP INSTRUCTIONS

### Step 1: Update .gitignore

Make sure your `.gitignore` includes:

```gitignore
# Environment Variables - NEVER COMMIT
.env
.env.local
.env.*.local
.env.production.local
.env.development.local
.env.test.local

# Evaluation Service
evaluation_service/.env
evaluation_service/.env.local

# Frontend
frontend/.env.local
frontend/.env.*.local

# IDE & System
.DS_Store
.vscode/settings.json
.idea/
*.swp
*.swo
*~
.cache/
.venv/
node_modules/
dist/
build/
.next/
__pycache__/
*.pyc
.pytest_cache/
.coverage

# OS
Thumbs.db
desktop.ini

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Optional npm cache directory
.npm

# Optional PNPM cache directory
.pnpm-debug.log*

# Optional Yarn integrity check
.yarn-integrity
```

### Step 2: Generate Secure Secrets

#### JWT Secret (Frontend)
```bash
# Generate using OpenSSL (Linux/Mac):
openssl rand -hex 32

# Or PowerShell (Windows):
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.BitConverter]::ToString($bytes).Replace("-","")

# Example output: a3f8e9c2d5b1f6a9e3c
```

#### API Keys
- **Anthropic API**: Get from https://console.anthropic.com/
- **OpenRouter API**: Get from https://openrouter.ai/
- **N8N Webhook**: Get from your N8N instance

---

## 📋 REQUIRED CODE CHANGES

### Frontend - Replace Hardcoded OpenRouter Keys

**File:** [frontend/app/api/chat/route.ts](frontend/app/api/chat/route.ts)
```typescript
// ❌ WRONG (current):
const OPENROUTER_API_KEY = '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';

// ✅ CORRECT (should be):
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}
```

**Files that need this change:**
- `frontend/app/api/chat/route.ts` (line 3)
- `frontend/app/api/guides/[id]/tutor/route.ts` (line 3)
- `frontend/app/api/guides/[id]/chat/route.ts` (line 4)
- `frontend/app/api/missions/[id]/submit/route.ts` (line 5)

---

### Frontend - Replace Hardcoded JWT Secret

**File:** [frontend/lib/auth.ts](frontend/lib/auth.ts)
```typescript
// ❌ WRONG (current):
const JWT_SECRET = process.env.JWT_SECRET || 'speak-dev-secret-change-in-production-32chars';

// ✅ CORRECT (should be):
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
```

---

### Evaluation Service - Keep Configuration as-is

**File:** [evaluation_service/main.py](evaluation_service/main.py)

The evaluation service correctly reads from environment variables:
```python
api_key=os.getenv("ANTHROPIC_API_KEY")  # ✅ Correct
host=os.getenv("REDIS_HOST", "localhost")  # ✅ Correct
```

But ensure `.env` file is in `.gitignore`.

---

## 📁 ENVIRONMENT FILE SETUP

### For Development:

**Frontend** (`frontend/.env.local`):
```env
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
OPENROUTER_API_KEY=sk-or-v1-your-actual-key
JWT_SECRET=your-32-char-secure-random-string
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EVALUATION_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

**Evaluation Service** (`evaluation_service/.env`):
```env
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGIN=http://localhost:3000
EVALUATION_SERVICE_URL=http://127.0.0.1:8000
```

### For Production:

1. Use environment management service:
   - Railway.app environment variables
   - Vercel environment variables
   - AWS Secrets Manager
   - HashiCorp Vault

2. Never use `.env` files in production

3. Use strong, unique secrets:
   - JWT_SECRET: 32+ random characters
   - API Keys: From official provider accounts
   - Database passwords: 24+ characters with special chars

---

## 🚀 Pre-GitHub Publication Checklist

- [ ] **Credentials Revoked**: All exposed keys have been revoked (see audit findings)
- [ ] **Code Updated**: All 4 hardcoded OpenRouter keys replaced with env vars
- [ ] **JWT Secret Updated**: Strong, random secret configured
- [ ] **.gitignore Updated**: All `.env*` files ignored
- [ ] **No API Keys in Code**: Final grep for `sk-` patterns returns nothing
- [ ] **Test Locally**: Run with `.env.local` to verify env var loading
- [ ] **Documentation**: `.env.example` and `.env.local.example` included
- [ ] **Git History Clean**: Remove any commits with exposed keys
  ```bash
  # If keys are in git history, use:
  git filter-branch --tree-filter 'rm -f .env evaluation_service/.env' -- --all
  # Then force push to remove history
  ```

---

## 🔍 Verification Commands

### Check for exposed keys before committing:
```bash
# Search for API key patterns
grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.py" .

# Search for hardcoded secrets
grep -r "process\.env\s*||" --include="*.ts" --include="*.tsx" .

# Check .env files are ignored
git check-ignore .env evaluation_service/.env frontend/.env.local
```

### Secure deletion of historical commits:
```bash
# If you've already committed .env files:
git log --all --pretty=format: --name-only --diff-filter=D | sort -u | grep -E '\.(env|secret)'

# Remove from git history using BFG Repo-Cleaner:
bfg --delete-files .env repo.git
```

---

## 📚 Best Practices Going Forward

### 1. Pre-commit Hook
Install `git-secrets` to prevent accidental commits:
```bash
# Install
brew install git-secrets

# Initialize
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'sk-'
git secrets --add 'ANTHROPIC_API_KEY'
```

### 2. Use direnv (recommended)
```bash
# Install: https://direnv.net/
# Then: echo "direnv allow" in the repo folder
# File: .envrc
export $(cat .env | xargs)
```

### 3. Environment-based Configuration
```typescript
// Example: Load config based on NODE_ENV
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    debug: true
  },
  production: {
    apiUrl: process.env.EVALUATION_SERVICE_URL,
    debug: false
  }
};

const appConfig = config[process.env.NODE_ENV];
```

### 4. Rotate Keys Regularly
- Change API keys every 90 days
- Rotate JWT secret in production regularly
- Monitor for unauthorized access

### 5. Principle of Least Privilege
- Create separate API keys for different services
- Each key should have minimal required permissions
- Revoke unused keys immediately

---

## 🆘 If You've Already Exposed Secrets

1. **Immediate Actions:**
   ```bash
   # Revoke all exposed keys through their respective providers
   # - Anthropic Console
   # - OpenRouter Dashboard
   # - Any other services
   
   # Create new keys
   # Update .env files locally
   # Test everything works
   ```

2. **Clean Git History:**
   ```bash
   # Using BFG Repo-Cleaner (recommended, faster)
   bfg --delete-files .env /path/to/repo

   # Or git filter-branch (slower, more control)
   git filter-branch --tree-filter 'rm -f .env' -- --all
   ```

3. **Force Push:**
   ```bash
   git push --force-with-lease origin main
   ```

4. **Notify:**
   - GitHub Security Advisory
   - Anyone with repository access
   - Your users (if customer data was exposed)

---

## 📞 References

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub - Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Node.js - Environment Variables](https://nodejs.org/en/knowledge/file-system/security/introduction/)
- [Python - python-dotenv](https://python-dotenv.readthedocs.io/)
- [git-secrets](https://github.com/awslabs/git-secrets)
- [Anthropic - API Key Security](https://docs.anthropic.com/)
- [OpenRouter - API Security](https://openrouter.ai/)

---

**Last Updated:** 2024
**Status:** ⚠️ CRITICAL - Must complete before publishing to GitHub
