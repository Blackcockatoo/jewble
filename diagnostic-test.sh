#!/bin/bash

# Complete System Diagnostics Script
# Tests all aspects of the Jewble interactive response system

echo "🔬 JEWBLE SYSTEM DIAGNOSTICS"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd /home/user/jewble/meta-pet

echo "1️⃣  FILE STRUCTURE CHECK"
echo "------------------------------------"

FILES=(
  "src/lib/realtime/responseSystem.ts"
  "src/lib/realtime/useRealtimeResponse.ts"
  "src/lib/realtime/index.ts"
  "src/components/ResponseBubble.tsx"
  "src/components/PetResponseOverlay.tsx"
  "src/app/page.tsx"
  "src/app/test-responses/page.tsx"
  "src/lib/store/index.ts"
  "src/lib/identity/hepta/audio.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    SIZE=$(wc -l < "$file")
    echo -e "${GREEN}✓${NC} $file ($SIZE lines)"
  else
    echo -e "${RED}✗${NC} $file MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "2️⃣  IMPORT VALIDATION"
echo "------------------------------------"

# Check PetResponseOverlay imports
echo "Checking PetResponseOverlay.tsx imports..."
if grep -q "import.*useRealtimeResponse" src/components/PetResponseOverlay.tsx &&
   grep -q "import.*ResponseBubble" src/components/PetResponseOverlay.tsx &&
   grep -q "import.*useStore" src/components/PetResponseOverlay.tsx &&
   grep -q "import.*playHepta" src/components/PetResponseOverlay.tsx; then
  echo -e "${GREEN}✓${NC} All imports present"
else
  echo -e "${RED}✗${NC} Missing imports"
  ERRORS=$((ERRORS + 1))
fi

# Check page.tsx integration
echo "Checking page.tsx integration..."
if grep -q "PetResponseOverlay" src/app/page.tsx; then
  echo -e "${GREEN}✓${NC} PetResponseOverlay integrated in dashboard"
else
  echo -e "${RED}✗${NC} PetResponseOverlay not integrated"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "3️⃣  EXPORT VALIDATION"
echo "------------------------------------"

# Check barrel exports
EXPORTS=("useRealtimeResponse" "getResponse" "getIdleResponse" "getWarningResponse" "ResponseContext" "PetResponse")
for export in "${EXPORTS[@]}"; do
  if grep -q "export.*$export" src/lib/realtime/index.ts || \
     grep -q "export.*$export" src/lib/realtime/responseSystem.ts || \
     grep -q "export.*$export" src/lib/realtime/useRealtimeResponse.ts; then
    echo -e "${GREEN}✓${NC} $export exported"
  else
    echo -e "${YELLOW}!${NC} Warning: $export export not clearly visible"
    WARNINGS=$((WARNINGS + 1))
  fi
done

echo ""
echo "4️⃣  SYNTAX VALIDATION"
echo "------------------------------------"

# Check for common syntax errors
echo "Checking responseSystem.ts syntax..."
if node -c src/lib/realtime/responseSystem.ts 2>/dev/null; then
  echo -e "${GREEN}✓${NC} responseSystem.ts - valid syntax"
else
  echo -e "${RED}✗${NC} responseSystem.ts - syntax errors"
  ERRORS=$((ERRORS + 1))
fi

echo "Checking useRealtimeResponse.ts syntax..."
if node -c src/lib/realtime/useRealtimeResponse.ts 2>/dev/null; then
  echo -e "${GREEN}✓${NC} useRealtimeResponse.ts - valid syntax"
else
  echo -e "${RED}✗${NC} useRealtimeResponse.ts - syntax errors"
  ERRORS=$((ERRORS + 1))
fi

echo "Checking PetResponseOverlay.tsx syntax..."
if node -c src/components/PetResponseOverlay.tsx 2>/dev/null; then
  echo -e "${GREEN}✓${NC} PetResponseOverlay.tsx - valid syntax"
else
  echo -e "${RED}✗${NC} PetResponseOverlay.tsx - syntax errors"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "5️⃣  RESPONSE LIBRARY CHECK"
echo "------------------------------------"

ACTIONS=("feed" "play" "clean" "sleep" "achievement" "evolution" "battle_victory" "minigame_victory")
for action in "${ACTIONS[@]}"; do
  if grep -q "case '$action'" src/lib/realtime/responseSystem.ts; then
    echo -e "${GREEN}✓${NC} Response for '$action' implemented"
  else
    echo -e "${RED}✗${NC} Response for '$action' missing"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "6️⃣  STORE INTEGRATION CHECK"
echo "------------------------------------"

# Check store subscription pattern
if grep -q "useStore.subscribe" src/components/PetResponseOverlay.tsx; then
  echo -e "${GREEN}✓${NC} Store subscription present"

  # Check for proper pattern
  if grep -q "let prevState = useStore.getState()" src/components/PetResponseOverlay.tsx; then
    echo -e "${GREEN}✓${NC} Correct subscription pattern (manual state tracking)"
  else
    echo -e "${YELLOW}!${NC} Warning: Manual state tracking not found"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}✗${NC} Store subscription missing"
  ERRORS=$((ERRORS + 1))
fi

# Check triggerResponse usage
TRIGGER_COUNT=$(grep -c "triggerResponse(" src/components/PetResponseOverlay.tsx)
echo -e "${BLUE}ℹ${NC}  triggerResponse called $TRIGGER_COUNT times"

echo ""
echo "7️⃣  WARNING THROTTLING CHECK"
echo "------------------------------------"

if grep -q "lastWarningTimeRef" src/lib/realtime/useRealtimeResponse.ts; then
  echo -e "${GREEN}✓${NC} Warning throttling refs present"
else
  echo -e "${RED}✗${NC} Warning throttling not implemented"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "60000" src/lib/realtime/useRealtimeResponse.ts; then
  echo -e "${GREEN}✓${NC} 60-second throttle configured"
else
  echo -e "${YELLOW}!${NC} Warning: Throttle timing may be different"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "8️⃣  UI FIXES CHECK"
echo "------------------------------------"

# Check Tetris fix
if grep -q "h-\[90vh\]" src/components/MiniGamesPanel.tsx; then
  echo -e "${GREEN}✓${NC} Tetris height fix applied"
else
  echo -e "${RED}✗${NC} Tetris height fix missing"
  ERRORS=$((ERRORS + 1))
fi

# Check Auralia fix
if grep -q 'h-48.*:.*h-96' src/app/page.tsx || grep -q "petType === 'geometric' ? 'h-48' : 'h-96'" src/app/page.tsx; then
  echo -e "${GREEN}✓${NC} Auralia height fix applied"
else
  echo -e "${RED}✗${NC} Auralia height fix missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "9️⃣  PACKAGE.JSON CHECK"
echo "------------------------------------"

if [ -f "package.json" ]; then
  echo -e "${GREEN}✓${NC} package.json found"

  # Check for required dependencies
  if grep -q "framer-motion" package.json; then
    echo -e "${GREEN}✓${NC} framer-motion dependency present"
  else
    echo -e "${YELLOW}!${NC} Warning: framer-motion not in package.json"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${RED}✗${NC} package.json not found"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔟  AUDIO INTEGRATION CHECK"
echo "------------------------------------"

if grep -q "playHepta" src/components/PetResponseOverlay.tsx; then
  echo -e "${GREEN}✓${NC} HeptaCode audio integration present"
else
  echo -e "${YELLOW}!${NC} Warning: Audio integration not found"
  WARNINGS=$((WARNINGS + 1))
fi

if grep -q "getAudioToneForResponse" src/lib/realtime/responseSystem.ts; then
  echo -e "${GREEN}✓${NC} Audio tone mapping function present"
else
  echo -e "${RED}✗${NC} Audio tone mapping missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "===================================="
echo "📊 DIAGNOSTIC SUMMARY"
echo "===================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo "The system is fully operational!"
  echo ""
  echo "🚀 Quick Start:"
  echo "   1. npm install (if dependencies not installed)"
  echo "   2. npm run dev"
  echo "   3. Visit http://localhost:3000"
  echo "   4. Visit http://localhost:3000/test-responses to test"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
  echo "The system should work but review warnings above."
  echo ""
  echo "🚀 You can proceed with:"
  echo "   npm run dev"
  exit 0
else
  echo -e "${RED}❌ $ERRORS error(s) found${NC}"
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
  echo ""
  echo "Please fix the errors above before proceeding."
  exit 1
fi
