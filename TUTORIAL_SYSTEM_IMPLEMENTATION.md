# Tutorial System Implementation Guide

## Overview

The Tutorial System is a comprehensive first-time user onboarding experience that guides new users through SPEAK's core modules with interactive overlays and spotlight effects.

## Components Created

### 1. **TutorialContext** (`lib/context/TutorialContext.tsx`)
- Global state management for tutorial flow
- Tracks current step, completed steps, and active status
- Provides hooks: `useTutorial()`
- Auto-detects and starts tutorial based on localStorage flag

### 2. **Tutorial Steps Config** (`lib/context/tutorialSteps.ts`)
- Defines all tutorial steps with titles, descriptions, routes
- Configures spotlight target elements via CSS selectors
- All text in Spanish (LATA audience)

### 3. **TutorialOverlay** (`components/Tutorial/TutorialOverlay.tsx`)
- Semi-transparent dark overlay covering entire viewport
- Canvas-based spotlight effect with rounded corners and glow
- Close button to skip tutorial

### 4. **TutorialExplanationBox** (`components/Tutorial/TutorialExplanationBox.tsx`)
- Displays contextual explanation at configured position
- Shows step progress indicators (X of 6)
- Navigation controls: Previous, Next, Skip
- Responsive positioning for mobile/desktop
- Auto-repositions on window resize

### 5. **TutorialSystem** (`components/Tutorial/TutorialSystem.tsx`)
- Main orchestrator component
- Handles route navigation between steps
- Auto-completes on final step
- Combines overlay + explanation box

## API Endpoints

### POST `/api/tutorial/complete`
Marks tutorial as completed in user's Supabase record
- Sets `tutorial_completed = true`
- Removes `startTutorial` flag from localStorage

### POST `/api/tutorial/skip`
Same as complete (user can skip anytime)
- Sets `tutorial_completed = true`
- Clears localStorage flags

## Tutorial Flow

### Signup → Join-Group → Missions (with Tutorial)

```
1. User signs up
   → Signup API returns user with tutorial_completed = false
   → Frontend sets localStorage.startTutorial = 'true'
   → Redirects to /join-group

2. User joins group
   → Preserves startTutorial flag
   → Redirects to /missions

3. Missions page loads
   → TutorialProvider detects startTutorial = 'true'
   → Initializes tutorial at 'welcome' step
   → TutorialSystem renders overlay + explanation

4. User navigates through steps
   → 'welcome' → 'missions' → 'guides' → 'groups' → 'profile' → 'completion'
   → Each step navigates to its configured route
   → Spotlight highlights relevant UI section

5. Completion
   → API marks tutorial_completed = true
   → Clears localStorage flags
   → Tutorial closes
```

## Integration Steps

### 1. Add Tutorial Markers to Pages

Add `data-tutorial` attributes to key sections:

**In Missions page:**
```jsx
<div data-tutorial="missions-section">
  {/* Missions content */}
</div>
```

**In Guides page:**
```jsx
<div data-tutorial="guides-section">
  {/* Guides content */}
</div>
```

**In Groups page:**
```jsx
<div data-tutorial="groups-section">
  {/* Groups content */}
</div>
```

**In Profile page:**
```jsx
<div data-tutorial="profile-section">
  {/* Profile content */}
</div>
```

### 2. Update Supabase Schema

Add `tutorial_completed` column to `users` table:

```sql
ALTER TABLE users ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE;
```

### 3. Signup API Update

Ensure signup response includes `tutorial_completed`:

```typescript
// In /api/auth/signup route
const user = await supabase
  .from('users')
  .insert({ 
    email, 
    full_name, 
    role,
    tutorial_completed: false  // Ensure default
  })
```

### 4. Layout Already Updated

✅ Root `layout.tsx` already includes:
- `TutorialProvider` wrapper
- `TutorialSystem` component
- Proper provider hierarchy

## Mobile Optimizations

- Explanation boxes stack vertically on small screens
- Touch-friendly button sizes (48px+ height)
- Viewport-aware positioning
- Reduced opacity overlay on mobile for readability
- Scroll behavior preserved during tutorial

## Customization

### Change Step Content

Edit `tutorialSteps.ts`:

```typescript
{
  id: 'missions',
  title: 'Misiones Interactivas',
  description: 'Your custom description here...',
  route: '/missions',
  targetElement: '[data-tutorial="missions-section"]',
  position: 'bottom',
  showNavigation: true
}
```

### Adjust Spotlight Target

Use different CSS selectors:

```typescript
targetElement: '.missions-grid' // class selector
targetElement: '#mission-card' // id selector
targetElement: '[data-testid="missions"]' // custom attribute
```

### Change Colors/Styling

Edit `TutorialExplanationBox.tsx` and `TutorialOverlay.tsx` for:
- Overlay darkness: `rgba(0, 0, 0, 0.75)` → adjust alpha
- Highlight color: `rgba(6, 182, 212, 0.5)` → cyan glow
- Box colors: `from-slate-800 to-slate-900` → gradient

## Re-enabling Tutorial

Users can re-start tutorial from settings (future feature):

```typescript
const { startTutorial } = useTutorial()

const resetTutorial = async () => {
  // Clear tutorial_completed flag in DB
  await fetch('/api/tutorial/reset', { method: 'POST' })
  
  // Start tutorial again
  startTutorial()
}
```

## Testing

1. **New User Flow:**
   - Create new account → Join group → Verify tutorial appears on /missions

2. **Step Navigation:**
   - Click "Siguiente" → Verify route changes
   - Verify spotlight highlights correct element
   - Click "Atrás" → Verify previous step loads

3. **Skip Tutorial:**
   - Click ✕ button → Verify tutorial closes
   - Verify `tutorial_completed = true` in DB

4. **Mobile:**
   - Resize browser to mobile width
   - Verify explanation box fits viewport
   - Verify spotlight is accurate
   - Test touch interactions

## Browser Compatibility

- Chrome/Edge/Firefox: Full support (Canvas for spotlight)
- Safari: Full support
- Mobile browsers: Full support (responsive)

## Performance Considerations

- Canvas redraws only on resize or step change
- Spotlight effect is lightweight canvas operations
- No heavy animations or transitions
- Lazy loads route components as needed

## Known Limitations

- Spotlight requires HTML element to exist in DOM
- Works best with fixed-position key sections
- Canvas spotlight may not work in older IE versions (not a concern for modern targets)

## Troubleshooting

**Tutorial doesn't start after signup:**
- Check `startTutorial` flag in localStorage
- Verify `tutorial_completed = false` in Supabase
- Check browser console for errors

**Spotlight not highlighting right element:**
- Verify `data-tutorial` attribute is on target element
- Check CSS selector in `tutorialSteps.ts` matches DOM
- Ensure element is visible/not hidden

**Explanation box positioning off:**
- Check viewport width (may need responsive rules)
- Verify target element has correct BoundingClientRect
- Check for CSS transforms/fixed positioning on parent

## Future Enhancements

- [ ] Keyboard navigation (arrow keys to move between steps)
- [ ] Progress animations between steps
- [ ] Video hints in explanation boxes
- [ ] Achievement notification after completion
- [ ] Tutorial analytics tracking
- [ ] Multi-language support
- [ ] Dark/light mode tutorial styling
