# Bug Fixes - Quick Reference

## Issues Fixed (2025-11-20)

### 1. ✅ "I'm STARVING!" Warning Spam

**Problem:** Warning responses triggered on every render when hunger > 80

**Solution:**
- Added 60-second throttling using refs
- Tracks last warning time and type
- Only shows if no response visible OR 60+ seconds passed OR different warning type

**File:** `meta-pet/src/lib/realtime/useRealtimeResponse.ts`

**Code Added:**
```typescript
const lastWarningTimeRef = useRef<number>(0);
const lastWarningTypeRef = useRef<string | null>(null);

// In warning check effect:
const shouldShow =
  !isVisible ||
  timeSinceLastWarning > 60000 ||
  !isSameWarning;
```

---

### 2. ✅ Tetris Game Bottom Cutoff

**Problem:** Vimana Tetris game bottom was cut off by modal container

**Solution:**
- Added explicit height constraints: `h-[90vh] max-h-[800px]`
- Added `overflow-auto` to parent for scrolling
- Increased Close button z-index to `z-10`

**File:** `meta-pet/src/components/MiniGamesPanel.tsx`

**Changes:**
```tsx
// Before:
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
  <div className="relative w-full max-w-3xl">

// After:
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-auto">
  <div className="relative w-full max-w-3xl h-[90vh] max-h-[800px]">
```

---

### 3. ✅ Auralia Guardian Display Issue

**Problem:** Auralia pet was squished in h-48 (192px) container meant for geometric sprite

**Solution:**
- Made height conditional: `h-48` for geometric, `h-96` (384px) for Auralia
- Auralia now has double the space to render properly

**File:** `meta-pet/src/app/page.tsx`

**Changes:**
```tsx
// Before:
<div className="relative h-48 mb-6 bg-gradient-to-br...">

// After:
<div className={`relative mb-6 bg-gradient-to-br... ${petType === 'geometric' ? 'h-48' : 'h-96'}`}>
```

---

## Testing Checklist

- ✅ Warning appears once, then waits 60 seconds before showing again
- ✅ Different warning types can appear immediately
- ✅ Tetris game fully visible with scrolling if needed
- ✅ Close button always visible above game
- ✅ Auralia Guardian displays properly without being cut off
- ✅ Geometric sprite still works as before

---

## Commit Details

**Branch:** `claude/jewble-interactive-responses-01Py4oaDcpPfFa23PieGnpb2`
**Commit:** 2fe6f80
**Files Changed:** 3
**Lines:** +34, -15

---

## How to Test

### Warning Throttling
1. Let hunger go above 80
2. Warning should appear once
3. Wait - it won't spam again for 60 seconds
4. Change to hygiene < 20 - different warning shows immediately

### Tetris Display
1. Go to Mini-Games panel
2. Click "Launch Simulation" under Vimana Tetris
3. Game should be fully visible
4. Bottom row of blocks should be visible
5. Close button should be clickable

### Auralia Display
1. Click "Auralia" button in Pet Card
2. Guardian should render fully without being cut off
3. All visual effects should be visible
4. Click "Geometric" to switch back

---

## Status

All bugs fixed and tested ✅
Ready for production use 🚀
