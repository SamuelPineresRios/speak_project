# 🚀 Story Mode - Final Setup & Deployment Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Set Environment Variable
```bash
# In .env.local (root of project)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Step 2: Verify Dependencies
All Story Mode features use existing dependencies:
- ✅ `next` (13+) - Framework
- ✅ `react` (18+) - UI library
- ✅ `lucide-react` - Icons (already used)
- ✅ TypeScript - Type safety
- ✅ Tailwind CSS - Styling

**No new npm packages needed!**

### Step 3: Test Locally
```bash
npm run dev
# Navigate to http://localhost:3000/story
```

### Step 4: Verify All Features
- [ ] Story hub loads 3 stories
- [ ] Can click story and see first scene
- [ ] Clicking "Ver Ayuda" shows guidance modal
- [ ] Can type response (word count shows)
- [ ] Submit button evaluates response
- [ ] See feedback with score
- [ ] Can continue to next scene
- [ ] Completion page shows summary

---

## 📁 Files Created/Modified

### New Files (9)
```
frontend/app/(student)/story/page.tsx
frontend/app/(student)/story/[storyId]/page.tsx
frontend/app/(student)/story/[storyId]/completion/page.tsx
frontend/app/api/story/evaluate.ts
frontend/app/api/story/progress.ts
frontend/components/PreResponseGuidanceModal.tsx
frontend/components/EvaluationFeedbackModal.tsx
frontend/public/data/stories.json
frontend/lib/types.ts (UPDATED - added new types)
```

### Modified Files (1)
```
frontend/components/StudentSidebar.tsx (added Story Mode link)
```

---

## 🔑 Key Configuration

### OpenRouter API Setup
1. Go to https://openrouter.ai
2. Sign up or log in
3. Get API key from https://openrouter.ai/keys
4. Add to `.env.local` as `OPENROUTER_API_KEY`

### Story Data
Stories are stored in `frontend/public/data/stories.json`:
- 3 complete stories (18 scenes)
- A1 to B2 difficulty progression
- Each scene has full guidance and evaluation criteria

### Progress Tracking
Student progress is automatically tracked:
- **MVP**: `/frontend/public/data/story_progress.json` (auto-created)
- **Production**: Migrate to database

---

## 🧪 Testing Scenarios

### Test 1: Basic Flow
1. Navigate to /story
2. Click first story "Crisis en la Estación"
3. See Scene 1 content
4. Type response: "Hola María, me llamo Juan. Estoy aquí para ayudarte."
5. Click "Enviar"
6. See evaluation with score

### Test 2: Guidance Modal
1. On any scene, click "💡 Ver Ayuda"
2. See 4 tabs (Verbos, Adjetivos, Sustantivos, Gramática)
3. Switch between tabs
4. Click "Volver a escribir" to close

### Test 3: Progress Persistence
1. Complete Scene 1 (submit response)
2. Continue to Scene 2
3. Close browser
4. Return to /story/[storyId]
5. Should show Scene 2 (not Scene 1)

### Test 4: Minimum Word Count
1. Type only 5 words in response area
2. "Enviar" button should be disabled
3. Add more words until 15+ minimum met
4. "Enviar" button should enable

### Test 5: Story Hub
1. Start Story 1, complete Scene 1
2. Go back to /story
3. Story 1 card should show progress indicator
4. Options should show "Continuar" button

---

## 🐛 Troubleshooting

### Problem: "API key not configured" error
**Solution:** 
1. Add `OPENROUTER_API_KEY` to `.env.local`
2. Restart `npm run dev`
3. Clear browser cache

### Problem: Stories not loading
**Solution:**
1. Verify `/public/data/stories.json` exists
2. Check browser console for fetch errors
3. Ensure public folder is being served

### Problem: Progress not saving
**Solution:**
1. Check `/public/data/story_progress.json` is writable
2. Check browser network tab for POST errors
3. Verify API route is responding

### Problem: TypeScript compilation errors
**Solution:**
1. Run `npm run build` to see full errors
2. Ensure all imports use `type` keyword for types
3. Verify types are exported from `lib/types.ts`

---

## 📊 Database Schema (for migration)

When ready to scale to production, use this schema:

### stories
```sql
CREATE TABLE stories (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  cefr_level VARCHAR,
  cover_emoji VARCHAR,
  estimated_minutes INT,
  total_scenes INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### scenes
```sql
CREATE TABLE scenes (
  id VARCHAR PRIMARY KEY,
  story_id VARCHAR REFERENCES stories(id),
  scene_number INT,
  title VARCHAR,
  narrative_context TEXT,
  npc_opening_dialogue TEXT,
  student_objective TEXT,
  cefr_level VARCHAR,
  minimum_word_count INT,
  evaluation_criteria JSONB,
  expected_responses JSONB,
  guidance JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### student_progress
```sql
CREATE TABLE student_progress (
  id VARCHAR PRIMARY KEY,
  student_id VARCHAR NOT NULL,
  story_id VARCHAR REFERENCES stories(id),
  current_scene_index INT,
  status VARCHAR,
  scenes_completed INTEGER[],
  total_score FLOAT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### scene_responses
```sql
CREATE TABLE scene_responses (
  id VARCHAR PRIMARY KEY,
  student_id VARCHAR NOT NULL,
  scene_id VARCHAR REFERENCES scenes(id),
  story_id VARCHAR REFERENCES stories(id),
  student_response TEXT,
  score FLOAT,
  passed_evaluation BOOLEAN,
  feedback JSONB,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📈 Performance Considerations

### Current (MVP)
- Stories loaded from JSON file
- Progress saved to JSON file
- Single-server deployment OK

### Scaling Strategy
1. **10K students**: Database migration + CDN for stories
2. **100K students**: Read replicas for stories, write cache for progress
3. **1M+ students**: Story content in object storage (S3), progress in fast cache (Redis)

---

## 🔒 Security Checklist

- ✅ API key never exposed in frontend
- ✅ Student can only access own progress
- ✅ API routes validate student_id
- ✅ No SQL injection (using JSON files MVP)
- [ ] Add rate limiting to evaluation endpoint
- [ ] Add CORS validation
- [ ] Add input validation for response text

---

## 📋 Pre-Production Checklist

### Code Quality
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run lint` - no warnings
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS and Android mobile
- [ ] Verify performance (Lighthouse score >80)

### Functionality
- [ ] All 3 stories complete without errors
- [ ] Progress persists across sessions
- [ ] Evaluation returns meaningful feedback
- [ ] All modals display correctly
- [ ] Error messages are helpful

### Content
- [ ] All 18 scenes have accurate guidance
- [ ] All expected responses make sense
- [ ] Grammar tips are correct and helpful
- [ ] Native suggestions are natural Spanish

### Infrastructure
- [ ] Environment variables configured
- [ ] Error logging set up
- [ ] Database backup strategy (if DB)
- [ ] API rate limiting enabled
- [ ] CORS properly configured

---

## 🚢 Deployment Steps

### 1. Staging Deployment
```bash
# Build for production
npm run build

# Run build locally to verify
npm run start

# Deploy to staging environment
vercel deploy --prod
```

### 2. Testing in Staging
- [ ] Run through all 5 test scenarios
- [ ] Have testers try on various devices
- [ ] Monitor error logs for exceptions
- [ ] Check API response times
- [ ] Verify progress persistence

### 3. Production Deployment
```bash
# Add production environment variables
vercel env add OPENROUTER_API_KEY

# Deploy to production
vercel deploy --prod
```

### 4. Post-Deployment
- [ ] Monitor error logs for first hour
- [ ] Check story loading times
- [ ] Verify student progress saving
- [ ] Get user feedback
- [ ] Schedule database backup

---

## 📞 Support & Documentation

### Reference Files
- `STORY_MODE_ARCHITECTURE.md` - Technical design decisions
- `STORY_MODE_IMPLEMENTATION_GUIDE.md` - Detailed implementation steps
- `STORY_MODE_FAQ.md` - Common questions and answers
- `STORY_MODE_IMPLEMENTATION_COMPLETE.md` - Summary of what was implemented

### API Documentation
- `/api/story/evaluate` - LLM evaluation endpoint
- `/api/story/progress` - Progress tracking endpoint

### Story Data Format
- `/public/data/stories.json` - Full story format with 18 scenes

---

## 🎯 Success Metrics

### Launch Goals
- Students can complete at least 1 story
- Average evaluation score distribution is normal
- Progress saves consistently
- Page load < 3 seconds
- 0 errors in first 24 hours

### 30-Day Goals
- 50% of students have started Story Mode
- Average completion rate 40% (at least 2 scenes)
- Student feedback score > 4/5
- No critical bugs

### 90-Day Goals
- 80%+ students have used Story Mode
- Average 3+ stories completed per active student
- Implement new stories (stretch to 10+)
- Begin scaling to database

---

## ✅ Final Verification

Before going live, verify:

1. **All files exist:**
   ```bash
   ls frontend/app/(student)/story/page.tsx
   ls frontend/app/(student)/story/[storyId]/page.tsx
   ls frontend/app/api/story/evaluate.ts
   ls frontend/components/PreResponseGuidanceModal.tsx
   ls frontend/public/data/stories.json
   ```

2. **Types compile:**
   ```bash
   npm run build
   # Should show: "Build complete"
   ```

3. **API routes work:**
   ```bash
   npm run dev
   # Test in browser: http://localhost:3000/api/story/progress
   # Should return JSON (or 400 if no params)
   ```

4. **UI renders:**
   - Visit http://localhost:3000/story
   - Should see 3 story cards with no errors

---

**🎉 Ready for launch!**

Questions? Check the reference documentation or review the implementation files directly.
