# 🔧 CODE CHANGES REQUIRED - Security Remediation

## Summary
This document lists all the code changes required to move from hardcoded credentials to environment variables.

**Total Files to Modify:** 5
**Severity:** CRITICAL - Must complete before GitHub publication

---

## 1️⃣ FILE: frontend/app/api/chat/route.ts

### Current State (VULNERABLE):
```typescript
const OPENROUTER_API_KEY = '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';
```

### Required Change:
**Lines 1-10** - Replace hardcoded key with environment variable

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Load API key from environment - fail fast if not set
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set in environment variables. ' +
    'Please configure your .env.local file.'
  );
}

export async function POST(req: NextRequest) {
  try {
    // ... rest of code
  }
}
```

---

## 2️⃣ FILE: frontend/app/api/guides/[id]/tutor/route.ts

### Current State (VULNERABLE):
```typescript
const OPENROUTER_API_KEY = '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';
```

### Required Change:
**Lines 1-15** - Replace hardcoded key

```typescript
import { NextRequest, NextResponse } from "next/server";

// Load API key from environment - fail fast if not set
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set in environment variables. ' +
    'Please configure your .env.local file.'
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("\n========== TUTOR ENDPOINT (Gemini) ==========");
    // ... rest of code
  }
}
```

---

## 3️⃣ FILE: frontend/app/api/guides/[id]/chat/route.ts

### Current State (VULNERABLE):
```typescript
const OPENROUTER_API_KEY = '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';
```

### Required Change:
**Lines 1-10** - Replace hardcoded key

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Load API key from environment - fail fast if not set
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set in environment variables. ' +
    'Please configure your .env.local file.'
  );
}

export async function POST(req: NextRequest) {
  try {
    // ... rest of code
  }
}
```

---

## 4️⃣ FILE: frontend/app/api/missions/[id]/submit/route.ts

### Current State (VULNERABLE):
```typescript
const OPENROUTER_API_KEY = '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';
```

### Required Change:
**Lines 1-10** - Replace hardcoded key

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Load API key from environment - fail fast if not set
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set in environment variables. ' +
    'Please configure your .env.local file.'
  );
}

export async function POST(req: NextRequest) {
  try {
    // ... rest of code
  }
}
```

---

## 5️⃣ FILE: frontend/lib/auth.ts

### Current State (VULNERABLE):
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'speak-dev-secret-change-in-production-32chars';
```

### Required Change:
Replace the fallback weak secret with error handling

```typescript
// Load JWT secret from environment - fail fast if not set
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not set in environment variables. ' +
    'Please configure your .env.local file with a secure random 32-character string.'
  );
}

// Validate secret strength
if (JWT_SECRET.length < 32) {
  console.warn(
    '⚠️  WARNING: JWT_SECRET should be at least 32 characters for production use'
  );
}
```

---

## 6️⃣ FILE: STORY_MODE_API_ROUTES.ts

### Current State (WEAK):
```typescript
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'sk-or-v1-...'
```

### Required Change:
Replace placeholder with proper error handling

```typescript
// Load API key from environment - fail fast if not set
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY is not set in environment variables. ' +
    'Please configure your .env.local file.'
  );
}
```

---

## 7️⃣ FILE: evaluation_service/.env

### Current State (VULNERABLE):
```env
ANTHROPIC_API_KEY=***REDACTED***
```

### Required Action:
1. **Delete the current .env file** (it contains exposed credentials)
2. **Keep .env in .gitignore** (already configured)
3. **Each developer must:**
   - Copy `.env.example` to `.env.local` (or `.env`)
   - Insert their own Anthropic API key
   - Never commit this file

### Verification:
```bash
# After making changes, verify no API keys are exposed:
grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.py" --include="*.js" frontend/ STORY_MODE*.ts
# Should return: No results (only matches like 'sk-' in comments are OK)
```

---

## Implementation Checklist

- [ ] **Change 1:** Update `frontend/app/api/chat/route.ts`
- [ ] **Change 2:** Update `frontend/app/api/guides/[id]/tutor/route.ts`
- [ ] **Change 3:** Update `frontend/app/api/guides/[id]/chat/route.ts`
- [ ] **Change 4:** Update `frontend/app/api/missions/[id]/submit/route.ts`
- [ ] **Change 5:** Update `frontend/lib/auth.ts`
- [ ] **Change 6:** Update `STORY_MODE_API_ROUTES.ts`
- [ ] **Change 7:** Secure `evaluation_service/.env`
- [ ] **Verify:** Run grep search to confirm no keys remain in code
- [ ] **Test:** Run application locally with .env.local to verify env vars load
- [ ] **Commit:** Create PR with changes
- [ ] **Review:** Security review before merging

---

## How to Apply Changes (Git Workflow)

### If you have raw file content changes:

```bash
# 1. Create a new branch
git checkout -b security/move-secrets-to-env

# 2. Make the 7 changes above

# 3. Verify no keys remain
grep -r "sk-or-" --include="*.ts" --include="*.tsx" frontend/

# 4. Commit changes
git add frontend/app/api/ frontend/lib/auth.ts STORY_MODE_API_ROUTES.ts .env* .gitignore
git commit -m "security: move hardcoded API keys to environment variables"

# 5. Push and create PR
git push origin security/move-secrets-to-env
```

---

## Testing After Changes

### 1. Local Testing
```bash
# Copy example to local .env
cp .env.example .env.local

# Edit with your actual keys
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-v1-...
# JWT_SECRET=your-32-char-secret

# Start frontend server
cd frontend
npm install
npm run dev

# The app should start without errors
```

### 2. Verify Environment Loading
```bash
# Check that env vars are loaded correctly
node -e "console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✓ Loaded' : '✗ Missing')"
```

### 3. Error Handling Test
```bash
# Unset a key and verify error message
OPENROUTER_API_KEY= npm run dev
# Should show: "OPENROUTER_API_KEY is not set in environment variables"
```

---

## Rollback Plan (if something breaks)

```bash
# If changes break the application:
git revert <commit-hash>

# Or checkout previous version:
git checkout HEAD~1 -- <affected-file>

# Verify still works:
git diff  # Check what changed
git status
```

---

## Security Verification

After making all changes, run this security checklist:

```bash
# 1. Search for exposed API keys
grep -r "sk-or-v1-[0-9a-z]\{50,\}" --include="*.ts" --include="*.tsx" --include="*.js" .

# 2. Search for exposed Anthropic keys
grep -r "sk-ant-" --include="*.py" --include="*.ts" --include="*.tsx" evaluation_service/ frontend/

# 3. Search for hardcoded secrets
grep -r "Bearer " --include="*.ts" --include="*.tsx" --include="*.py" .

# 4. Verify .gitignore covers all .env files
git check-ignore .env evaluation_service/.env frontend/.env.local

# All should pass with no unexpected results
```

---

**Status:** 🔴 CRITICAL
**Timeline:** Must complete BEFORE publishing to GitHub
**Approver:** Security review required
