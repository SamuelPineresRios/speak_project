# ⚡ QUICK START - Security Remediation Checklist

**Status:** 🔴 CRITICAL - Must complete before GitHub publication
**Estimated Time:** 30-45 minutes
**Priority:** HIGHEST

---

## 🎯 WHAT'S WRONG (30-second summary)

Your code has **7 exposed secrets** that will be visible on GitHub:
- ❌ 4 OpenRouter API keys (hardcoded in code)
- ❌ 1 Anthropic API key (in `.env` file)
- ❌ 1 Weak JWT secret (fallback in code)
- ❌ Configuration issues

**Consequence:** Anyone can access your API accounts and rack up charges.

---

## ✅ QUICK FIX STEPS

### Step 1: Understand the Problem (5 min)
📖 Read: `SECURITY_AUDIT_REPORT.md` - Overview section only

### Step 2: Generate New Secrets (2 min)
```bash
# Generate secure JWT secret
# Windows PowerShell:
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use: https://1password.com/password-generator/
```

### Step 3: Get New API Keys (5 min)
1. Visit [Anthropic Console](https://console.anthropic.com/) → API Keys → Create new key
2. Visit [OpenRouter](https://openrouter.ai/) → Settings → API Keys → Create new key
3. Save these in a temporary text file

### Step 4: Create Local Environment File (3 min)
**Create `frontend/.env.local`:**
```env
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
OPENROUTER_API_KEY=sk-or-v1-YOUR-NEW-KEY-HERE
JWT_SECRET=YOUR-32-CHAR-SECURE-STRING-FROM-STEP-2
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EVALUATION_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

**Create `evaluation_service/.env`:**
```env
ANTHROPIC_API_KEY=sk-ant-***REDACTED***
REDIS_HOST=localhost
REDIS_PORT=6379
ALLOWED_ORIGIN=http://localhost:3000
EVALUATION_SERVICE_URL=http://127.0.0.1:8000
```

### Step 5: Update Code (12 min)
📖 Follow: `CODE_CHANGES_REQUIRED.md`

File-by-file changes needed:
1. `frontend/app/api/chat/route.ts`
2. `frontend/app/api/guides/[id]/tutor/route.ts`
3. `frontend/app/api/guides/[id]/chat/route.ts`
4. `frontend/app/api/missions/[id]/submit/route.ts`
5. `frontend/lib/auth.ts`
6. `STORY_MODE_API_ROUTES.ts`

### Step 6: Verify Changes (3 min)
```bash
# Search for any remaining API keys
grep -r "sk-or-v1-" --include="*.ts" --include="*.tsx" frontend/

# Should return: NOTHING
# If it does, you missed a file!
```

### Step 7: Test Locally (5 min)
```bash
cd frontend
npm install
npm run dev

# App should start without errors
# Check that API calls work
```

### Step 8: Commit & Push (2 min)
```bash
git add .
git commit -m "security: move secrets to environment variables"
git push
```

---

## 🚨 CRITICAL REMINDERS

✋ **STOP! Before publishing:**

- [ ] `.env.local` is in `.gitignore`? (`git check-ignore .env.local`)
- [ ] No API keys in code? (`grep -r "sk-"` returns nothing)
- [ ] App runs locally? (`npm run dev` works)
- [ ] All 6 files updated? (Check CODE_CHANGES_REQUIRED.md)
- [ ] New API keys created? (Don't use old exposed keys!)

❌ **If you ignore this:**
- Anyone can use your API accounts
- $1000+ in unexpected charges
- Service disruption
- Potential security breach

✅ **After you fix it:**
- Safe to publish to GitHub
- Other developers can contribute
- No credentials exposed
- Professional security posture

---

## 📚 FULL DOCUMENTATION

- **SECURITY_AUDIT_REPORT.md** - Detailed vulnerability analysis
- **SECURITY_SETUP.md** - Complete setup guide with best practices
- **CODE_CHANGES_REQUIRED.md** - Line-by-line code changes needed
- **.env.example** - Template for environment variables
- **SECURITY_QUICK_START.md** - This file

---

## 🆘 I'M STUCK!

### "I can't find the API key file"
→ Check `frontend/app/api/chat/route.ts` line 3

### "How do I generate a random string?"
→ Use: `openssl rand -hex 32` or https://1password.com/password-generator/

### "npm run dev gives an error"
→ Check: Is `.env.local` created with valid keys?

### "Should I commit .env or .env.local?"
→ **NEVER!** Both should be in `.gitignore`

### "How do I revoke exposed API keys?"
→ Anthropic: https://console.anthropic.com/ → Delete key
→ OpenRouter: https://openrouter.ai/ → Delete key

---

## 📞 TIMELINE

```
Get started: NOW
↓
Understand problem: 5 min (read first part of audit)
↓
Generate secrets: 5 min
↓
Get new API keys: 5 min
↓
Update code: 15 min
↓
Test locally: 5 min
↓
Push to GitHub: 2 min
↓
DONE! ✅ Ready to publish
```

**Total: ~45 minutes**

---

## ✅ WHEN YOU'RE DONE

Your repository will be:
- ✅ Safe to publish to GitHub
- ✅ Professional security practices
- ✅ No exposed credentials
- ✅ Ready for team collaboration
- ✅ CI/CD pipeline compatible
- ✅ Production-ready

---

## 🎓 NEXT: After Publishing

1. **Add pre-commit hooks** - Prevent accidental secret commits
   ```bash
   npm install husky --save-dev
   npx husky install
   ```

2. **Enable GitHub Secret Scanning** - Alert if any keys uploaded
   → Settings → Security → Secret scanning

3. **Setup branch protection** - Require reviews before merge
   → Settings → Branches → Add rule

4. **Rotate keys regularly** - Every 90 days
   → Set calendar reminder

5. **Monitor API usage** - Check for unusual activity
   → Anthropic Console & OpenRouter Dashboard

---

**You've got this! 💪**

**Questions?** Reference the full docs:
- [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- [CODE_CHANGES_REQUIRED.md](CODE_CHANGES_REQUIRED.md)
- [SECURITY_SETUP.md](SECURITY_SETUP.md)
