#!/bin/bash

# Verification Script for Interactive Response System
# This script checks that all components are in place and properly configured

echo "🔍 Verifying Interactive Response System..."
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_export() {
    if grep -q "export.*$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Export '$2' found in $1"
        return 0
    else
        echo -e "${YELLOW}!${NC} Warning: Export '$2' not found in $1"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

check_import() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Import '$2' found in $1"
        return 0
    else
        echo -e "${YELLOW}!${NC} Warning: Import '$2' not found in $1"
        WARNINGS=$((WARNINGS + 1))
        return 1
    fi
}

echo "📁 Checking Core Files..."
check_file "meta-pet/src/lib/realtime/responseSystem.ts"
check_file "meta-pet/src/lib/realtime/useRealtimeResponse.ts"
check_file "meta-pet/src/lib/realtime/index.ts"
check_file "meta-pet/src/lib/realtime/README.md"
echo ""

echo "🎨 Checking Components..."
check_file "meta-pet/src/components/ResponseBubble.tsx"
check_file "meta-pet/src/components/PetResponseOverlay.tsx"
echo ""

echo "📄 Checking Pages..."
check_file "meta-pet/src/app/page.tsx"
check_file "meta-pet/src/app/test-responses/page.tsx"
echo ""

echo "📚 Checking Documentation..."
check_file "INTERACTIVE_RESPONSES_IMPLEMENTATION.md"
check_file "BUG_FIXES_SUMMARY.md"
echo ""

echo "🔧 Checking Exports..."
check_export "meta-pet/src/lib/realtime/index.ts" "useRealtimeResponse"
check_export "meta-pet/src/lib/realtime/index.ts" "getResponse"
check_export "meta-pet/src/lib/realtime/index.ts" "ResponseContext"
check_export "meta-pet/src/lib/realtime/responseSystem.ts" "getAudioToneForResponse"
check_export "meta-pet/src/lib/realtime/responseSystem.ts" "getAnticipatoryResponse"
echo ""

echo "📦 Checking Imports..."
check_import "meta-pet/src/components/PetResponseOverlay.tsx" "useRealtimeResponse"
check_import "meta-pet/src/components/PetResponseOverlay.tsx" "ResponseBubble"
check_import "meta-pet/src/app/page.tsx" "PetResponseOverlay"
check_import "meta-pet/src/app/test-responses/page.tsx" "useRealtimeResponse"
echo ""

echo "🔍 Checking for Common Issues..."

# Check for unmatched quotes in responseSystem
SINGLE_QUOTES=$(grep -o "'" meta-pet/src/lib/realtime/responseSystem.ts 2>/dev/null | wc -l)
if [ $((SINGLE_QUOTES % 2)) -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Quote matching looks good in responseSystem.ts"
else
    echo -e "${YELLOW}!${NC} Warning: Odd number of single quotes in responseSystem.ts"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for subscribe usage
if grep -q "useStore.subscribe" meta-pet/src/components/PetResponseOverlay.tsx; then
    echo -e "${GREEN}✓${NC} Store subscription found in PetResponseOverlay"
    # Check if it's using the correct pattern
    if grep -q "let prevState = useStore.getState()" meta-pet/src/components/PetResponseOverlay.tsx; then
        echo -e "${GREEN}✓${NC} Correct subscription pattern (manual state tracking)"
    else
        echo -e "${RED}✗${NC} Subscription pattern may be incorrect"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} Store subscription not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check for response types
echo "🎯 Checking Response Types..."
RESPONSE_ACTIONS=(
    "feed"
    "play"
    "clean"
    "sleep"
    "achievement"
    "evolution"
    "battle_victory"
    "minigame_victory"
    "exploration_discovery"
)

for action in "${RESPONSE_ACTIONS[@]}"; do
    if grep -q "case '$action'" meta-pet/src/lib/realtime/responseSystem.ts; then
        echo -e "${GREEN}✓${NC} Response type '$action' implemented"
    else
        echo -e "${YELLOW}!${NC} Warning: Response type '$action' not found"
        WARNINGS=$((WARNINGS + 1))
    fi
done
echo ""

# Summary
echo "════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo "The interactive response system is ready to use."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "The system should work but review warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "Please fix the errors above before proceeding."
    exit 1
fi
